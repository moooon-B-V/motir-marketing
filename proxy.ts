import { NextResponse, type NextRequest } from 'next/server'
import { SITE_ORIGIN } from '@/lib/siteOrigin'
import { TENANT_DOMAIN } from '@/lib/tenantDomain'
import {
  PUBLIC_ADDRESS_KIND_HEADER,
  PUBLIC_HOST_HEADER,
  PUBLIC_ORIGIN_HEADER,
  normaliseHost,
  type PublicAddressKind,
} from '@/lib/publicHost'
import {
  ROUTER_PATHS,
  resolveHost,
  routeForHost,
  type PublicHostResolution,
} from '@/lib/hostResolution'

/**
 * THE HOST ROUTER (Story MOTIR-3878 · MOTIR-4220) — this repository's first
 * proxy, and the reason `motir.co`'s renderer can answer for other hosts.
 *
 * Next 16 renamed the `middleware.ts` convention to `proxy.ts` and the export to
 * `proxy` (https://nextjs.org/docs/messages/middleware-to-proxy); `motir-core`'s
 * own file is the shape followed here, including `config.matcher`'s guard.
 *
 * ── WHAT IT DOES ─────────────────────────────────────────────────────────
 *
 * A request arrives on `acme.motir.site` or on `roadmap.acme.com`. The visitor's
 * URL is the address they typed; the RENDERER has one `/p/[identifier]` tree.
 * This turns the first into the second with a REWRITE — the URL bar does not
 * change, no page is duplicated, and `app/p/**` never learns that it is serving
 * three shapes of address. The two headers it forwards are what a page uses to
 * emit links back at the host it is on (`lib/publicHost.ts`).
 *
 * ── ⚠️ `motir.co` NEVER CALLS THE CONTRACT, AND THAT IS ASSERTED ─────────
 *
 * The site's own host, `localhost` and the loopback addresses leave here on the
 * first branch, before any network hop. Every request to the marketing site —
 * the landing, `/explore`, `/docs`, `/legal` — would otherwise pay a round trip
 * to `app.motir.co` to be told it is not a tenant, on the host whose entire job
 * is to be fast and crawlable. `tests/host/hostRouter.test.ts` asserts the
 * absence with a spy rather than trusting the branch to stay first.
 *
 * ── ⚠️ AN OUTAGE IS NOT A 404 ────────────────────────────────────────────
 *
 * When the contract does not answer, the request is rewritten to
 * `/host-unavailable`, which renders the design's ERROR state
 * (`design/public-projects/` panel 12) in the site chrome. Answering 404 instead
 * would tell a crawler that a customer's domain is gone every time
 * `app.motir.co` restarts — and a crawler acts on a 404. This is
 * `lib/publicProject.ts`'s three-outcome rule, applied one layer earlier.
 *
 * ── BOUNDARY ─────────────────────────────────────────────────────────────
 *
 * No canonical, `og:url`, sitemap or robots decision is made here, and no
 * `motir.co/p/*` redirect — those are MOTIR-4222's, over the headers this sets.
 */

// The three paths the router itself produces live in `lib/hostResolution.ts`,
// beside the branch that has to RECOGNISE them — see `alreadyRouted`.
const {
  notFound: NOT_FOUND_PATH,
  unavailable: UNAVAILABLE_PATH,
  workspaceRoot: WORKSPACE_ROOT_PATH,
} = ROUTER_PATHS

/**
 * Hosts this router steps aside for — the site itself and every local address.
 *
 * `127.0.0.1` and `[::1]` are here beside `localhost` because the browser lane
 * addresses the app by IP (`e2e/stub/origin.ts`), and a lane whose every request
 * tried to resolve `127.0.0.1` as a tenant would fail differently from
 * production for a reason that has nothing to do with the code under test.
 */
const LOCAL_HOSTS: ReadonlySet<string> = new Set([
  'localhost',
  '127.0.0.1',
  '[::1]',
])

function isSiteHost(host: string): boolean {
  return (
    host === normaliseHost(new URL(SITE_ORIGIN).host) || LOCAL_HOSTS.has(host)
  )
}

/**
 * The visitor's own origin — scheme, host AND port, all three from what the
 * proxy in front of us said rather than from the socket. See
 * `PublicHost.origin` for why the port and the scheme are carried rather than
 * assumed.
 */
function forwardedOrigin(request: NextRequest): string {
  const proto =
    request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    request.nextUrl.protocol.replace(':', '')
  const authority =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host
  return `${proto}://${authority.trim().toLowerCase()}`
}

/**
 * Forward the request with the three host headers SET (never merged).
 *
 * ⚠️ EVERY BRANCH GOES THROUGH HERE NOW (MOTIR-4430). It used to have a
 * sibling, `rewriteTo(request, pathname)`, which set NOTHING — and the four
 * branches that took it were the four that end at the router's own two landing
 * pads, so `/host-unavailable` and the 404 room were the only surfaces in the
 * app told they were on `motir.co` when they were not. The sibling is DELETED
 * rather than narrowed: a helper that forwards a rewrite WITHOUT the host is a
 * helper the next branch will reach for.
 *
 * ⚠️ AND ONE OF THE TWO STILL CANNOT USE WHAT IT IS SENT, which is worth saying
 * here so the next reader does not conclude the headers are unused.
 * `/host-unavailable` is an ordinary route and reads them. The 404 room is
 * served by `app/not-found.tsx`, the GLOBAL not-found boundary, where a
 * `headers()` read makes the ENTIRE SITE dynamic — measured, and that file
 * carries the route tables. It links absolutely on every host instead. The
 * headers are still SET on that branch because they are the truth about the
 * request and because the day that boundary can read them, this router already
 * says the right thing.
 */
function forwardWithHost(
  request: NextRequest,
  kind: Exclude<PublicAddressKind, 'site'>,
  host: string,
  rewriteTo?: string,
): NextResponse {
  // Copied from the incoming request and then SET, so a client-supplied value is
  // overwritten rather than honoured — the rule `motir-core`'s proxy records for
  // `x-current-path`, and the reason a page may trust these two.
  const headers = new Headers(request.headers)
  headers.set(PUBLIC_ADDRESS_KIND_HEADER, kind)
  headers.set(PUBLIC_HOST_HEADER, host)
  headers.set(PUBLIC_ORIGIN_HEADER, forwardedOrigin(request))

  if (!rewriteTo) return NextResponse.next({ request: { headers } })

  const destination = new URL(request.nextUrl)
  destination.pathname = rewriteTo
  return NextResponse.rewrite(destination, { request: { headers } })
}

/** The header value for a resolution — an alias never reaches a page. */
function kindOf(resolution: PublicHostResolution): 'workspace' | 'project' {
  return resolution.kind === 'workspace' ? 'workspace' : 'project'
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // ⚠️ THE FORWARDED VALUE WINS. Fly terminates TLS and proxies to the machine,
  // so `Host` is the internal address and `x-forwarded-host` is what the visitor
  // typed. Reading `Host` first would make every tenant request look like the
  // same internal host.
  const host =
    normaliseHost(request.headers.get('x-forwarded-host')) ??
    normaliseHost(request.headers.get('host'))

  // Today's behaviour, untouched — and no network hop. See the note above.
  if (!host || isSiteHost(host)) return NextResponse.next()

  // ⚠️ THE THREE BRANCHES WITH NO RESOLUTION, AND THEY ARE `unresolved` RATHER
  // THAN SILENT (MOTIR-4430). None of them can say WHICH tenant this is — the
  // base domain is not one, and the other two are the contract declining or not
  // answering. But all three know the one thing a link depends on: the visitor
  // is not on `motir.co`. So they forward the host under the fourth kind, and
  // the two landing pads below spell every site path absolutely instead of
  // offering a lost visitor six doors that 404 where they are standing.

  // The base domain itself is not a tenant address (`lib/tenantDomain.ts`).
  if (host === TENANT_DOMAIN) {
    return forwardWithHost(request, 'unresolved', host, NOT_FOUND_PATH)
  }

  const read = await resolveHost(host)
  if (read.status === 'failed') {
    // The OUTAGE — and the one branch where the host is most likely to be a real
    // customer's domain, because `/host-unavailable` renders exactly while
    // `app.motir.co` is restarting. Site-relative chrome is at its most wrong
    // here, which is why "SITE_HOST is fine on an unresolvable host" is not the
    // disposition this card took.
    return forwardWithHost(request, 'unresolved', host, UNAVAILABLE_PATH)
  }
  if (read.status === 'not-found') {
    return forwardWithHost(request, 'unresolved', host, NOT_FOUND_PATH)
  }

  const route = routeForHost(read.data, request.nextUrl.pathname)

  switch (route.action) {
    case 'redirect': {
      // A retired subdomain — ADR §8's never-released promise, made observable.
      // 301 with the PATH AND QUERY preserved: a link somebody published to a
      // deep page must land on that page, not on the new root.
      const destination = new URL(request.nextUrl)
      // ⚠️ `hostname`, NOT `host`, AND THE PORT IS KEPT. The contract answers a
      // bare hostname, and the live subdomain is served by THIS deployment — so
      // the port and scheme the visitor already reached us on are the ones that
      // work. Clearing the port sends a browser to :80 and breaks every
      // non-production run of this redirect, including the browser lane's.
      destination.hostname = route.host
      return NextResponse.redirect(destination, 301)
    }
    case 'forward':
      // The router's own rewrite, coming back around. The headers are SET again
      // rather than assumed to have survived, so the page reads them whichever
      // pass produced the request it renders.
      return forwardWithHost(request, kindOf(read.data), host)
    case 'not-found':
      // ⚠️ THE ONE 404 BRANCH THAT HOLDS A RESOLUTION, so it forwards the REAL
      // kind rather than `unresolved` (MOTIR-4430). `hey.motir.site/explore` is
      // a workspace address serving a path that is not one of its projects —
      // the host is known, the path is not — and this is the branch the card's
      // reproduction takes.
      return forwardWithHost(request, kindOf(read.data), host, NOT_FOUND_PATH)
    case 'workspace-root':
      return forwardWithHost(request, 'workspace', host, WORKSPACE_ROOT_PATH)
    default:
      return forwardWithHost(request, kindOf(read.data), host, route.path)
  }
}

export const config = {
  /**
   * Everything except Next's own asset routes.
   *
   * ⚠️ NO BLANKET `.*\..*` EXCLUSION, and the difference is a real page:
   * `/ACME/changelog.xml` is a tenant host's Atom feed and contains a dot, so
   * the idiomatic "skip anything with an extension" matcher would leave the feed
   * unrouted and 404 on every tenant host — in people's feed readers. Site
   * assets are recognised by SHAPE instead, in `isSiteAssetPath`, which knows
   * that a project path is never one segment.
   */
  matcher: ['/((?!_next/static|_next/image).*)'],
}
