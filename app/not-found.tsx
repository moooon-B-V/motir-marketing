import { NotFoundRoom } from './_components/NotFoundRoom'
import { UNKNOWN_HOST } from '@/lib/publicHost'

/**
 * THE 404 ROOM (MOTIR-4193), drawn by
 * `motir-core/design/public-site/design-notes.md` § *the NOT-FOUND room*
 * (MOTIR-4245) and `design/public-site/not-found.mock.html` panels 1 / 3 / 4.
 *
 * ── ⚠️ WHY THIS FILE HAS TO EXIST AT ALL ──────────────────────────────────
 *
 * Next's stock not-found is a FALLBACK it prerenders when no route group
 * supplies one, and it renders OUTSIDE every shell in this repository — so it
 * cannot inherit `SiteShell` however the layouts are arranged. Measured on
 * `origin/main` `140f2e4` from a clean `pnpm build`,
 * `.next/server/app/_not-found.html` was an inline-styled `<h1>404</h1>` with
 * **no `<main>`, no chrome, nothing linking anywhere**, hard-coding `#000` on
 * `#fff` and swapping on `prefers-color-scheme` alone. The only way out of a
 * 404 on motir.co was the Back button. The fix is a file that did not exist,
 * not an edit to one that did.
 *
 * ── ONE ROOM FOR ALL FOUR ARRIVALS ────────────────────────────────────────
 *
 * `notFound()` resolves to the nearest `not-found.tsx` ABOVE the route, and
 * this repository has exactly one — so this room answers all four families
 * that call it: an unknown `/legal/[slug]`, an unlisted
 * `/explore/topic/[slug]`, a `/p/[identifier]` (and its tabs) that is not
 * public, and a mistyped URL. The lede is written to be true for every one of
 * them; **do not narrow it per route**, and do not add a per-segment
 * `app/legal/not-found.tsx` — `motir-marketing/design/legal/`'s panel-4
 * `/legal`-scoped room is SUPERSEDED by this one (the correction to that asset
 * is MOTIR-4247).
 *
 * ── THE DOORS ARE A RANKING, NOT A MENU ───────────────────────────────────
 *
 * Two, ordered, and the count is the design's own argument: the bar above
 * carries Explore / Docs / Design and the footer below carries all nine
 * destinations, so the room names the LIKELIEST intent and lets the chrome
 * carry the rest. Explore is primary because three of the four arrivals are
 * people who wanted a public project or to browse for one — `/p/*` makes that
 * the routine case, not the exceptional one. The landing answers the mistyped
 * URL and nothing else, which is why it is second.
 *
 * No search field: motir.co has no site-wide search (the one input belongs to
 * `/explore`), so drawing one here would invent an unshipped control.
 *
 * ── THREE THINGS NOT TO "FIX" ─────────────────────────────────────────────
 *
 *  1. **No `<main>` of its own.** `SiteShell` owns the landmark (MOTIR-4169);
 *     a second one is the defect that card removed. `justify-center` on the
 *     landmark's own content box is what puts the room in the middle of the
 *     viewport rather than jammed under the bar — `main` is `flex-1` inside
 *     `SiteShell`'s `min-h-dvh` column.
 *  2. **No nav item is current.** `SiteHeader`'s `isCurrent()` matches
 *     `/explore` and `/docs` and their prefixes; a 404 URL is neither, so the
 *     accent treatment is absent BY DERIVATION rather than by omission.
 *  3. **The ghost door has no border, and that is a MEASUREMENT.**
 *     `--el-border` is 1.28:1 light / 1.34:1 dark against `--el-page-bg` and
 *     `--el-border-strong` is 1.74:1 / 1.69:1, so an outlined ghost button
 *     would fail WCAG 1.4.11's 3:1 in both themes with no token that fixes it.
 *     The shipped `ghost` variant is border-less and identified by its label
 *     at 17.40:1 — mirroring the shipped control is both the composition rule
 *     and the accessible answer.
 *
 * ── AND THE ORDERING TRAP THAT MAKES THIS PAGE A LIE IF IT IS BROKEN ──────
 *
 * **No `loading.tsx` may be introduced above any route that calls
 * `notFound()`.** A loading boundary flushes the response head at 200, so the
 * 404 becomes a page that merely LOOKS like one (MOTIR-3491, on the other
 * host). `app/legal/layout.tsx` and `app/p/[identifier]/layout.tsx` both carry
 * the rule in their own comments; `e2e/specs/not-found.spec.ts` asserts the
 * STATUS as well as the DOM, which is what would catch a later regression.
 */
/*
 * ⚠️ THE ROOM LINKS ABSOLUTELY ON EVERY HOST, INCLUDING THIS ONE — AND THE FILE
 * MUST STAY SYNCHRONOUS (MOTIR-4430).
 *
 * The comment this replaces said `SITE_HOST` was all the page could know,
 * because `proxy.ts` reached it through a header-less `rewriteTo`. That helper
 * is gone: the router now forwards the host on every branch, three of them
 * under the new `unresolved` kind. So the page COULD ask. It does not, and
 * every reason is a MEASUREMENT rather than a preference.
 *
 * ── ⚠️ WHY IT MAY NOT ASK ────────────────────────────────────────────────
 *
 * `await requestPublicHost()` in THIS file turns THE WHOLE SITE dynamic. This
 * is the GLOBAL not-found boundary, so it sits in every route's tree. On a
 * clean `pnpm build` of this branch the edit moved `/`, `/design`, `/docs`,
 * `/docs/mcp`, `/docs/public-address`, `/docs/sandbox`, `/legal` and
 * `/_not-found` from `○ (Static)` to `ƒ (Dynamic)`, and stripped
 * `/legal/[slug]` of its seven SSG paths. `export const dynamic =
 * 'force-dynamic'` does not scope it; that was measured too. The bill lands on
 * the landing page of the host whose entire job is to be fast and crawlable, to
 * answer a question that only matters on a page reached by mistyping a URL.
 *
 * ── ⚠️ AND WHY IT COULD NOT BE MOVED TO A ROUTE THAT MAY ─────────────────
 *
 * Both ways of giving `ROUTER_PATHS.notFound` a real, host-aware route were
 * built and measured on `next@16.2.6`, and both failed:
 *
 *   • `app/host-unknown/page.tsx` calling `notFound()` beside a sibling
 *     `not-found.tsx` — a NESTED `not-found.tsx` renders only while it is
 *     SYNCHRONOUS. Made `async`, or given an async child, it silently produced
 *     an empty document: 404, no chrome, no room, and nothing in the dev log.
 *   • `NextResponse.rewrite(dest, { status: 404 })` from the proxy, so the room
 *     could be an ordinary async page — the status is IGNORED and the page
 *     answered 200. A soft 404 is the exact defect `e2e/specs/not-found.spec.ts`
 *     and MOTIR-3491 exist to prevent.
 *
 * ── SO: {@link UNKNOWN_HOST}, AND IT IS RIGHT RATHER THAN MERELY CHEAP ────
 *
 * Its `kind` is not `site`, so `siteLinkFor` spells every `motir.co` path
 * absolutely. On a tenant or unresolved host that is the ONLY spelling that
 * works — the defect this card fixes. On `motir.co` itself
 * `https://motir.co/explore` is the same page `/explore` was, so the room still
 * leads exactly where it led.
 *
 * ⚠️ THE ONE THING IT COSTS, NAMED: on `motir.co` the room's links stop being
 * `next/link`s, so leaving the room is a document load rather than a client
 * transition. That is the trade — client routing on a 404 page, against the
 * prerendering of the entire marketing site — and it is the half of MOTIR-4430's
 * fifth criterion that could not be kept alongside its first. Both halves are
 * quoted in that card and in this pull request, with the route tables.
 *
 * ⚠️ DO NOT MAKE THIS FILE `async`, and do not read `headers()`, `cookies()` or
 * `draftMode()` from anything it renders. Nothing in the test suite catches it:
 * `pnpm build`'s route table is the only signal, and only if somebody reads it.
 */
export default function NotFound() {
  return <NotFoundRoom host={UNKNOWN_HOST} />
}
