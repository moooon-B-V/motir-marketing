/**
 * THE ONE PLACE THAT KNOWS WHAT A LINK LOOKS LIKE ON THIS HOST
 * (Story MOTIR-3878 · MOTIR-4220).
 *
 * The same project page is now served at three shapes of address, and the path
 * to a given tab is different at each:
 *
 *   • `motir.co`            — `/p/ACME/board`   (the site; the shape that shipped)
 *   • `acme.motir.site`     — `/ACME/board`     (a workspace subdomain)
 *   • `roadmap.acme.com`    — `/board`          (a customer domain; ADR Q3 puts
 *                                                ONE project at the host's root)
 *
 * `proxy.ts` rewrites all three onto the SAME `app/p/[identifier]/**` tree, so
 * no page is duplicated — but a page that emitted `/p/ACME/board` on a customer
 * domain would send the visitor to a path that host does not serve. Every href
 * under `app/p/**` therefore goes through {@link publicPathFor}, and a grep for
 * a `/p/` string literal in that tree finds none.
 *
 * ── ⚠️ THE HOST IS A PROP, NOT AN AMBIENT READ, AND THAT IS DELIBERATE ────
 *
 * `requestPublicHost()` below reads it from the request once, in the async
 * component at the top of each route; everything under that takes it as a
 * parameter. The alternative — every leaf component awaiting `headers()` — was
 * rejected for two reasons, and the second is the load-bearing one:
 *
 *   1. It makes `WorkItemRow`, `ErrorState` and the tab bar async Server
 *      Components, which `@testing-library/react` cannot render at all. The
 *      component tests that assert what these emit would have had to be deleted
 *      and replaced by end-to-end walks — a strictly worse trade for the exact
 *      behaviour this card is about.
 *   2. A component whose output depends on a value it did not receive is a
 *      component whose test can pass while the page is wrong. Passing it makes
 *      the dependency visible in the type, so a caller that forgets it is a
 *      compile error rather than a link that is wrong on two hosts out of three.
 *
 * The default is {@link SITE_HOST}, which is what an unrouted request already
 * is — `motir.co` is not a special case, it is the `site` kind.
 */

/**
 * Which SHAPE of address this request arrived on.
 *
 * `site` is `motir.co` itself. `workspace` and `project` mirror the two tenant
 * cases of `motir-core`'s `PublicHostResolutionDto` — an `alias` never reaches
 * a page, because the router answers it with a 301.
 */
export type PublicAddressKind = 'site' | 'workspace' | 'project'

/** The request's address, as the router resolved it. */
export interface PublicHost {
  readonly kind: PublicAddressKind
  /** The tenant host, lowercased and without a port; `null` on the site. */
  readonly host: string | null
}

/** `motir.co` — and every request the router stepped aside for. */
export const SITE_HOST: PublicHost = { kind: 'site', host: null }

/**
 * The two request headers the router sets, read back by
 * {@link requestPublicHost}.
 *
 * ⚠️ SET ON THE FORWARDED REQUEST, NEVER ON THE RESPONSE — nothing about a
 * route's caching changes. And OVERWRITTEN on every request the router handles,
 * so a client that sends its own `x-motir-address-kind` cannot talk a page into
 * emitting another host's links. A request the router did NOT handle carries
 * neither header and reads as {@link SITE_HOST}, which is the correct answer for
 * it — the headers are never an authorization input, only a link shape.
 */
export const PUBLIC_HOST_HEADER = 'x-motir-public-host'
export const PUBLIC_ADDRESS_KIND_HEADER = 'x-motir-address-kind'

const KINDS: ReadonlySet<string> = new Set<PublicAddressKind>([
  'site',
  'workspace',
  'project',
])

/**
 * A `Host` / `x-forwarded-host` value reduced to a comparable hostname:
 * lowercased, trimmed, with the port removed.
 *
 * ⚠️ IPv6 LITERALS KEEP THEIR BRACKETS AND LOSE ONLY THE PORT. `[::1]:4318`
 * has colons inside the address as well as before the port, so splitting on the
 * first colon would truncate it to `[` — a host that matches nothing and is not
 * obviously wrong when read in a log.
 */
export function normaliseHost(raw: string | null | undefined): string | null {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) return null
  if (value.startsWith('[')) {
    const close = value.indexOf(']')
    return close === -1 ? value : value.slice(0, close + 1)
  }
  const colon = value.indexOf(':')
  const host = colon === -1 ? value : value.slice(0, colon)
  return host || null
}

/**
 * The path of one public-project page ON THIS HOST.
 *
 * `path` is the suffix BELOW the project root, already URL-encoded and with no
 * leading slash — `''` for the overview, `'board'`, `'items/ACME-42'`,
 * `'changelog.xml'`. The identifier is encoded here, because on two of the three
 * host kinds it is a path segment this function alone emits.
 */
export function publicPathFor(
  host: PublicHost,
  identifier: string,
  path = '',
): string {
  const rest = path ? `/${path}` : ''
  switch (host.kind) {
    case 'workspace':
      return `/${encodeURIComponent(identifier)}${rest}`
    case 'project':
      // ONE project at the root (ADR Q3) — the identifier is the host, so it is
      // absent from the path. `''` is the root itself, not the empty string.
      return rest || '/'
    default:
      return `/p/${encodeURIComponent(identifier)}${rest}`
  }
}

/** The same path with a query string appended, dropping empty values. */
export function publicPathWithQuery(
  host: PublicHost,
  identifier: string,
  path: string,
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v)
  const qs = search.toString()
  return `${publicPathFor(host, identifier, path)}${qs ? `?${qs}` : ''}`
}

/** Read the router's two headers off a `Headers`. Pure, so a test can call it. */
export function readPublicHost(headers: Headers): PublicHost {
  const kind = headers.get(PUBLIC_ADDRESS_KIND_HEADER)
  if (!kind || !KINDS.has(kind) || kind === 'site') return SITE_HOST
  return {
    kind: kind as PublicAddressKind,
    host: normaliseHost(headers.get(PUBLIC_HOST_HEADER)),
  }
}

/**
 * This request's address, for the async component at the top of a route.
 *
 * ⚠️ `next/headers` IS IMPORTED LAZILY, and that is not a style choice. This
 * module is also imported by `proxy.ts`, which runs in Next's proxy bundle where
 * `next/headers` is not available — a top-level import would throw there at
 * import time, before a single line of routing ran. The same lazy-import shape
 * `motir-core`'s CORS module needed for the same class of reason.
 */
export async function requestPublicHost(): Promise<PublicHost> {
  const { headers } = await import('next/headers')
  return readPublicHost(await headers())
}
