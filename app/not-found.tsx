import Link from 'next/link'
import { buttonVariants } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { EXPLORE } from '@/lib/destinations'
import { SiteShell } from './_components/SiteShell'

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
export default function NotFound() {
  return (
    /* The box is the design's, verbatim. `max-w-[46rem]` is the shipped
       `/legal` measure, reused rather than re-chosen. */
    <SiteShell contentClassName="mx-auto flex w-full max-w-[46rem] flex-col justify-center px-(--spacing-card-padding) py-16">
      <p className="font-(family-name:--font-mono) text-[12px] font-semibold tracking-[0.08em] text-(--el-text-secondary)">
        {copy.notFound.eyebrow}
      </p>

      <h1 className="mt-2.5 font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.notFound.title}
      </h1>

      <p className="mt-3 max-w-[40rem] text-[15px] leading-[1.6] text-(--el-text-secondary)">
        {copy.notFound.lede}
      </p>

      {/* The doors STACK below `sm` and sit on one line above it. Panel 3
          measures them at 390 — where two `md` buttons do not fit — and panel
          1 at 1440; a WRAPPED pair with no explicit order reads as two equal
          choices, which is precisely what the ranking above is not. */}
      <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link href={EXPLORE} className={buttonVariants({ size: 'md' })}>
          {copy.notFound.exploreDoor}
        </Link>
        {/* Both destinations are same-origin, so both are `next/link` — the
            site root as `SiteHeader` links it, and `EXPLORE` from
            `lib/destinations.ts` (same-origin since MOTIR-4045). Neither is
            built from `APP_ORIGIN`. */}
        <Link
          href="/"
          className={buttonVariants({ variant: 'ghost', size: 'md' })}
        >
          {copy.notFound.homeDoor}
        </Link>
      </div>
    </SiteShell>
  )
}
