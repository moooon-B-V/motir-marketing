import { SITE_ORIGIN } from '@/lib/siteOrigin'

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
  /**
   * The tenant's full ORIGIN — scheme, host and port; `null` on the site.
   *
   * ⚠️ IT IS CARRIED RATHER THAN DERIVED, and the two things it removes are
   * both guesses. A tenant address always serves over https in production, so
   * `https://${host}` looks safe — but the browser lane reaches the app at
   * `http://acme.localhost:4318`, and a `robots.txt` there would name
   * `https://acme.localhost/sitemap.xml`: a URL that resolves nowhere, in the
   * one file whose entire job is to hand a crawler a working address. The
   * router knows the scheme (`x-forwarded-proto`) and the port (the forwarded
   * host), so it says so instead of leaving each consumer to assume.
   */
  readonly origin: string | null
}

/** `motir.co` — and every request the router stepped aside for. */
export const SITE_HOST: PublicHost = { kind: 'site', host: null, origin: null }

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
/** Scheme, host and port — see {@link PublicHost.origin}. */
export const PUBLIC_ORIGIN_HEADER = 'x-motir-public-origin'

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
  const host = normaliseHost(headers.get(PUBLIC_HOST_HEADER))
  const origin = headers.get(PUBLIC_ORIGIN_HEADER)
  return {
    kind: kind as PublicAddressKind,
    host,
    // A value that is not an origin is treated as absent rather than passed on:
    // it ends up in a `robots.txt` and a sitemap, where a malformed one is worse
    // than the https guess it replaced.
    origin: origin && /^https?:\/\/[^/\s]+$/.test(origin) ? origin : null,
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
 *
 * ⚠️ AND IT DOES NOT CATCH. `headers()` throws outside a request scope, which is
 * also how Next reports a route being PRERENDERED when it needs to be dynamic —
 * so a fallback to {@link SITE_HOST} here would make a test harness and a real
 * static-render bug look identical, and the second one ships a `robots.txt`
 * frozen to whichever host built the image. A test that calls a route function
 * directly supplies the scope instead (`vi.mock('next/headers', …)`), which is
 * also what lets it choose which host it is asking as.
 */
export async function requestPublicHost(): Promise<PublicHost> {
  const { headers } = await import('next/headers')
  return readPublicHost(await headers())
}

/* ── the PRIMARY address (MOTIR-4222) ─────────────────────────────────────── */

/**
 * Everything below needs only these two fields, so that is what it asks for —
 * which is also what lets a test call it with a two-line object instead of a
 * whole `PublicProjectOverviewDto`.
 */
export interface AddressedProject {
  readonly identifier: string
  readonly addresses: { readonly primary: string }
}

/** The host this request is on — `SITE_ORIGIN`'s when the router stepped aside. */
export function currentHost(host: PublicHost): string {
  return host.host ?? new URL(SITE_ORIGIN).host
}

/**
 * The absolute origin of the host this request is on.
 *
 * The router's own value where there is one, `https://<host>` as the fallback
 * for a tenant host that somehow arrived without it (a tenant address serves
 * only once its certificate is ISSUED, and `fly.toml` sets `force_https`), and
 * `SITE_ORIGIN` on the site itself.
 */
export function currentOrigin(host: PublicHost): string {
  if (host.origin) return host.origin
  return host.host ? `https://${host.host}` : SITE_ORIGIN
}

/**
 * The ONE canonical URL for a project, and the only place `/p/` is spelled into
 * an absolute URL (MOTIR-4222).
 *
 * `addresses.primary` already carries the project's own path — `motir.co/p/PROD`,
 * `acme.motir.site/PROD`, or a customer domain's bare root — so a tab hangs
 * below it. Every `<link rel="canonical">`, `og:url`, JSON-LD `@id` and sitemap
 * entry is built from this, which is what makes them agree by construction
 * rather than by four files being edited together.
 */
export function publicUrlFor(
  project: AddressedProject,
  path = '',
  search = '',
): string {
  const base = project.addresses.primary.replace(/\/$/, '')
  return `${base}${path ? `/${path}` : ''}${search}`
}

/**
 * Whether this request is already on the project's canonical host.
 *
 * ⚠️ BOTH SIDES ARE NORMALISED, and the port is why. `currentHost` comes from a
 * `Host` header with the port stripped, while `addresses.primary` is a URL that
 * may carry one — `http://acme.localhost:4318/ACME` in the browser lane, or an
 * explicit `:443` from a hand-edited value. Comparing the two raw makes a
 * project's own host look like somebody else's, and the page then redirects to
 * itself: an infinite loop, in the one code path every public page runs.
 */
export function isOnPrimaryHost(
  project: AddressedProject,
  host: PublicHost,
): boolean {
  return (
    normaliseHost(new URL(project.addresses.primary).host) ===
    normaliseHost(currentHost(host))
  )
}

/**
 * 301 to the same page on the project's PRIMARY address, unless we are already
 * there (MOTIR-4222).
 *
 * ⚠️ CALLED FROM THE SHELL, so every tab and detail page inherits it — including
 * `motir.co/p/<identifier>` once a project's primary lives elsewhere, which the
 * ADR §7 names as its stated consequence. Without it the same page is indexable
 * at three addresses, which is the duplication *make primary* exists to prevent.
 *
 * ⚠️ IT ANSWERS 308, NOT THE 301 THE CARD ASKS FOR, and the difference is the
 * framework's rather than a choice. Next's page-level API is
 * `permanentRedirect()`, which emits 308; a 301 is settable only from the proxy
 * or a route handler, and the proxy cannot know a project's primary without a
 * SECOND contract read on every request to every host — including `motir.co`,
 * the host that today makes none. Both are permanent and both consolidate a
 * canonical for every crawler that matters; 308 additionally preserves the
 * method, which for a GET-only surface is a difference with no consequence. The
 * one redirect on this story that IS a 301 is the retired subdomain's, because
 * that one lives in the router where the status is settable.
 *
 * ⚠️ AND `next/navigation` IS IMPORTED LAZILY, for the reason this module's
 * header gives: `proxy.ts` imports it, and the proxy runtime has no router.
 */
export async function redirectIfNotPrimary(
  project: AddressedProject,
  host: PublicHost,
  path = '',
  search = '',
): Promise<void> {
  if (isOnPrimaryHost(project, host)) return
  const { permanentRedirect } = await import('next/navigation')
  permanentRedirect(publicUrlFor(project, path, search))
}
