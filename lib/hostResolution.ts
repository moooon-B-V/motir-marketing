import { APP_ORIGIN } from '@/lib/appOrigin'
import { normaliseHost } from '@/lib/publicHost'

/**
 * THE ROUTER'S READ — `GET {APP_ORIGIN}/api/public/hosts/{host}`, its cache, and
 * the pure decision it feeds (Story MOTIR-3878 · MOTIR-4220).
 *
 * ── ⚠️ WHY THIS IS NOT IN `lib/publicProject.ts` ─────────────────────────
 *
 * That module's header says it "owns every fetch that surface makes", and it
 * does — every fetch a PAGE makes. This one is made by `proxy.ts`, before a page
 * exists, and it differs in four ways that would each be a wart over there:
 *
 *   • it runs in Next's PROXY bundle, a different runtime with no `next: {}`
 *     fetch cache to hand caching to;
 *   • it reads the RESPONSE HEADERS, because the contract states its own
 *     freshness in `Cache-Control` and this is the caller that honours it;
 *   • it is on the critical path of EVERY request to a tenant host, so it takes
 *     a hard timeout — a page data read can afford to wait where a router
 *     cannot;
 *   • its key is attacker-supplied (anyone can point a `Host` header at us), so
 *     its cache is BOUNDED. See the eviction note below.
 *
 * The shapes below mirror `motir-core`'s `lib/dto/publicAddresses.ts`. They are
 * RESTATED, not imported — the same seam rule `lib/publicProject.ts` records:
 * the contract is guarded in the PRODUCING repository, because a contract test
 * that lives only in the consumer reports the break after it has shipped.
 */

/* ── the contract shapes (motir-core `lib/dto/publicAddresses.ts`) ────────── */

/** A workspace subdomain — the host lists that workspace's public projects. */
export interface PublicHostWorkspace {
  readonly kind: 'workspace'
  readonly workspace: { readonly name: string }
  readonly projects: ReadonlyArray<{
    readonly identifier: string
    readonly name: string
  }>
}

/** A RETIRED subdomain. It keeps redirecting for ever — ADR §8. */
export interface PublicHostAlias {
  readonly kind: 'alias'
  readonly redirectTo: string
}

/** A customer domain with an issued certificate: ONE project, at the root. */
export interface PublicHostProject {
  readonly kind: 'project'
  readonly project: { readonly identifier: string; readonly name: string }
  /** Whether THIS address is the project's canonical one (ADR §7). */
  readonly primary: boolean
}

export type PublicHostResolution =
  PublicHostWorkspace | PublicHostAlias | PublicHostProject

/**
 * The same THREE outcomes `lib/publicProject.ts` splits, for the same reason and
 * with higher stakes: collapsing `failed` into `not-found` would 404 every
 * customer's domain for as long as `app.motir.co` is restarting, and a 404 is
 * what a crawler acts on.
 */
export type HostRead =
  | { status: 'ok'; data: PublicHostResolution }
  | { status: 'not-found' }
  | { status: 'failed' }

/* ── the cache ────────────────────────────────────────────────────────────── */

/**
 * How long an answer with no usable `Cache-Control` is held.
 *
 * The contract sends `max-age=60`; this is only the floor for a deployment that
 * has stripped it. Sixty seconds is the number the producing route chose, and
 * choosing a different one here would mean a rename took two different times to
 * become visible depending on which layer answered.
 */
const DEFAULT_MAX_AGE_MS = 60_000

/**
 * ⚠️ THE CACHE IS BOUNDED, AND THE BOUND IS A SECURITY PROPERTY, NOT TIDINESS.
 * The key is the `Host` header, which ANY caller can set to any value — a
 * script pointing a million distinct hostnames at this app would otherwise grow
 * an unbounded `Map` in a 512 MB machine, and every one of those requests is a
 * 404 that costs nothing to re-derive.
 */
const MAX_ENTRIES = 1000

/** How long the router will wait for the contract before giving up. */
const REQUEST_TIMEOUT_MS = 3_000

interface CacheEntry {
  readonly read: HostRead
  readonly expiresAt: number
}

const cache = new Map<string, CacheEntry>()

/**
 * Drop every cached resolution. For tests — a module-level cache outlives one
 * test FILE, so a suite that stubs `fetch` and one that does not will otherwise
 * inherit each other's verdicts.
 */
export function resetHostResolutionCache(): void {
  cache.clear()
}

/** `public, max-age=60, stale-while-revalidate=300` → 60_000. */
export function maxAgeMs(cacheControl: string | null): number {
  const match = /(?:^|[\s,])max-age\s*=\s*(\d+)/i.exec(cacheControl ?? '')
  if (!match) return DEFAULT_MAX_AGE_MS
  return Number(match[1]) * 1000
}

function remember(host: string, read: HostRead, ttlMs: number): void {
  // Insertion-ordered, so the first key is the oldest: one eviction per write
  // keeps the map at its bound without a sweep.
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next()
    if (!oldest.done) cache.delete(oldest.value)
  }
  cache.set(host, { read, expiresAt: Date.now() + ttlMs })
}

/**
 * Resolve a host through the public contract, with the in-process cache.
 *
 * ⚠️ `ok` AND `not-found` ARE CACHED; `failed` IS NOT. A 404 is the contract
 * SAYING something and is as cacheable as an answer — caching it is what stops a
 * hostname somebody has pointed at us from costing a round trip on every hit.
 * An outage is not an answer: pinning it for a minute would extend every
 * `app.motir.co` restart into a minute of tenant hosts showing the error state
 * after the API came back.
 */
export async function resolveHost(rawHost: string): Promise<HostRead> {
  const host = normaliseHost(rawHost)
  if (!host) return { status: 'not-found' }

  const hit = cache.get(host)
  if (hit && hit.expiresAt > Date.now()) return hit.read

  let res: Response
  try {
    res = await fetch(
      `${APP_ORIGIN}/api/public/hosts/${encodeURIComponent(host)}`,
      {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    )
  } catch {
    // A network error, a DNS failure, the timeout above — the API did not
    // answer. The visitor's page says so; it does not say the project is gone.
    return { status: 'failed' }
  }

  if (res.status === 404) {
    const read: HostRead = { status: 'not-found' }
    remember(host, read, maxAgeMs(res.headers.get('cache-control')))
    return read
  }
  if (!res.ok) return { status: 'failed' }

  let data: PublicHostResolution
  try {
    data = (await res.json()) as PublicHostResolution
  } catch {
    // A 200 that is not JSON is the API not answering in any useful sense — a
    // proxy's own error page, most likely. It is an outage, not a 404.
    return { status: 'failed' }
  }

  const read: HostRead = { status: 'ok', data }
  remember(host, read, maxAgeMs(res.headers.get('cache-control')))
  return read
}

/* ── the decision ─────────────────────────────────────────────────────────── */

/**
 * The paths the router itself produces. Recognising them is what makes
 * {@link routeForHost} IDEMPOTENT — see the ⚠️ on that function.
 */
export const ROUTER_PATHS = {
  /** A workspace subdomain's root: that workspace's public-project list. */
  workspaceRoot: '/w',
  /** No route matches it, so Next renders `app/not-found.tsx` with a 404. */
  notFound: '/_host-unknown',
  /** A real route rendering the ERROR state — never a 404. */
  unavailable: '/host-unavailable',
} as const

/** What the router does with one request. */
export type HostRoute =
  /** Serve the path as-is — a site asset, or the site's own host. */
  | { action: 'pass' }
  /** Serve the path as-is, but with the host headers set on the request. */
  | { action: 'forward' }
  /** Rewrite onto the shipped `/p/*` tree, with the visitor's URL unchanged. */
  | { action: 'rewrite'; path: string }
  /** A workspace subdomain's ROOT — that workspace's public-project list. */
  | { action: 'workspace-root' }
  /** 301 to the same path on another host (a retired subdomain). */
  | { action: 'redirect'; host: string }
  /** The site's not-found page, with a 404 status. */
  | { action: 'not-found' }

/**
 * A path that belongs to the SITE rather than to a project — `/motir-mark.svg`,
 * `/favicon.ico`, `/robots.txt`.
 *
 * ⚠️ IT EXISTS BECAUSE THE CHROME IS THE SAME CHROME. A tenant host wears
 * `SiteHeader` and `SiteFooter`, whose logo is `/motir-mark.svg` at the ROOT —
 * so a router that rewrote every path under a customer domain onto `/p/<id>/…`
 * would rewrite the logo to a 404 and the page would render with a hole in it.
 *
 * ONE segment, containing a dot. A project's tab paths are two segments or more
 * (`/ACME/changelog.xml` on a workspace host), and a project identifier cannot
 * contain a dot — so the test is unambiguous in both directions. `/_next/*` never
 * reaches here at all; `config.matcher` in `proxy.ts` excludes it.
 */
export function isSiteAssetPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 1 && segments[0]!.includes('.')
}

/** Every project identifier a host may serve — one, or a workspace's set. */
function identifiersOf(
  resolution: Exclude<PublicHostResolution, PublicHostAlias>,
): readonly string[] {
  return resolution.kind === 'workspace'
    ? resolution.projects.map((p) => p.identifier)
    : [resolution.project.identifier]
}

/**
 * ⚠️ THE ROUTER SEES ITS OWN REWRITE, AND THIS IS WHERE THAT IS HANDLED.
 *
 * MEASURED, not assumed. Next 16 dispatches an internal `NextResponse.rewrite`
 * back through the proxy, so one request to `acme.motir.site/MOTIR/board`
 * arrives here TWICE — first as `/MOTIR/board`, then as the `/p/MOTIR/board`
 * this function just produced. Without this branch the second pass reads `p` as
 * a project identifier the workspace does not publish and answers 404, so every
 * tenant page 404s while every unit test over a single pass stays green. It
 * cost one confusing red in the browser lane, which is where it was found.
 *
 * ⚠️ AND IT IS RECOGNISED BY SHAPE, NOT BY A MARKER HEADER. A header saying
 * "the router already ran" would be settable by any caller, and trusting it
 * would let a crafted request serve ANY project at ANY tenant address. This
 * asks instead whether the path is one this HOST could have produced — the
 * identifier must be one the contract just named — so a forged `/p/OTHER` is
 * still a 404 and there is nothing to forge.
 *
 * The visible consequence, stated: a tenant host serves BOTH `/MOTIR/board` and
 * `/p/MOTIR/board` for its own projects. That is a duplicate URL rather than a
 * leak, and MOTIR-4222 is the card that gives every duplicate a 301 to the
 * primary.
 */
function alreadyRouted(
  resolution: Exclude<PublicHostResolution, PublicHostAlias>,
  pathname: string,
): HostRoute | null {
  if (
    pathname === ROUTER_PATHS.notFound ||
    pathname === ROUTER_PATHS.unavailable
  ) {
    return { action: 'pass' }
  }
  if (pathname === ROUTER_PATHS.workspaceRoot) {
    return resolution.kind === 'workspace'
      ? { action: 'forward' }
      : { action: 'not-found' }
  }
  if (!pathname.startsWith('/p/')) return null

  const identifier = pathname.split('/')[2] ?? ''
  return identifiersOf(resolution).includes(identifier)
    ? { action: 'forward' }
    : { action: 'not-found' }
}

/**
 * The router's decision, given what the contract said and where the visitor
 * asked to go. PURE — every arm is a unit test, and the proxy is the thin shell
 * that turns this into a `NextResponse`.
 */
export function routeForHost(
  resolution: PublicHostResolution,
  pathname: string,
): HostRoute {
  if (resolution.kind === 'alias') {
    return { action: 'redirect', host: resolution.redirectTo }
  }

  const routed = alreadyRouted(resolution, pathname)
  if (routed) return routed

  if (resolution.kind === 'project') {
    if (isSiteAssetPath(pathname)) return { action: 'pass' }
    // ONE project at the root (ADR Q3): the whole path hangs below `/p/<id>`.
    return {
      action: 'rewrite',
      path: `/p/${encodeURIComponent(resolution.project.identifier)}${pathname === '/' ? '' : pathname}`,
    }
  }

  // A workspace subdomain. The ROOT is the workspace's project list; everything
  // else is addressed by a project identifier in the first segment.
  if (pathname === '/') return { action: 'workspace-root' }

  const [first, ...rest] = pathname.split('/').filter(Boolean)
  const project = resolution.projects.find((p) => p.identifier === first)
  if (!project) {
    // ⚠️ THE ASSET CHECK IS SECOND, NOT FIRST, so a project could never be
    // shadowed by it. Only once the segment is known NOT to be a project does a
    // dot in it mean "a file on the site".
    if (isSiteAssetPath(pathname)) return { action: 'pass' }
    return { action: 'not-found' }
  }

  const suffix = rest.length ? `/${rest.join('/')}` : ''
  return {
    action: 'rewrite',
    path: `/p/${encodeURIComponent(project.identifier)}${suffix}`,
  }
}
