import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/**
 * THE CHROME EVERY motir.co SURFACE WEARS, AND THE ONE PLACE THE `main`
 * LANDMARK LIVES (MOTIR-4169).
 *
 * ── ⚠️ THE DECISION THIS COMPONENT EXISTS TO MAKE ─────────────────────────
 *
 * MOTIR-4169 asked which of two answers this repository takes, and this is it:
 * **the CHROME owns the landmark, and no page renders its own.** The rejected
 * alternative — the chrome renders a `main` only where a page does not — is
 * not expressible here in any honest way: a layout is rendered BEFORE and
 * AROUND its `children` and cannot inspect what they will produce, so
 * "only where a page does not" would have to be a prop each page passes, which
 * is the same per-page memory that produced the defect, wearing a flag.
 *
 * The defect was exactly that. Four of twelve routes rendered `<main>` in the
 * PAGE and eight did not, because nothing shared supplied one and every page
 * had to remember. A fix that adds the tag to the remaining pages leaves the
 * thirteenth page with the same hole. So the tag moves UP, the four pages that
 * had one give theirs up, and `tests/mainLandmark.test.ts` enumerates the
 * route tree from disk so a page added later cannot ship without one.
 *
 * ── THE SKIP LINK ─────────────────────────────────────────────────────────
 *
 * A landmark with nothing pointing at it is half the bypass mechanism WCAG
 * 2.4.1 asks for, so the affordance ships with it: the FIRST focusable element
 * on every page, invisible until focused, targeting the `main` below.
 *
 * ⚠️ ONE RUNG-1 FILL, DECLARED — the same declaration `SiteHeader`'s narrow
 * menu panel makes, for the same reason. `design/public-site/` (motir-core)
 * draws this chrome's bar and footer and depicts no skip link, because it
 * draws what is VISIBLE at rest and this is visible only under focus. It is
 * not invented here either: it is `motir-core`'s shipped
 * `components/ui/AppLayout.tsx` affordance — its markup, its `href="#main"` /
 * `id="main"` pairing and its `sr-only` → `focus:not-sr-only` reveal — reused
 * rather than redrawn, which is the composition rule
 * `design/public-site/design-notes.md` § "Composition, not redrawing" already
 * states for the bar and the footer.
 *
 * The ONE deliberate divergence from that source: the focus ring is
 * `--el-accent-on-surface` rather than motir-core's `--focus-ring-color`,
 * because this repository routes colour through Tier-3 element tokens and that
 * pair is a MEASURED row of `design/marketing/design-notes.md`'s AA table
 * (6.57:1 light / 6.11:1 dark against the page, over 1.4.11's 3:1). The link's
 * own ink is `--el-text` on `--el-page-bg` — 17.40:1 / 17.42:1, the table's
 * first row. Both readings are the table's, not new ones.
 */

/**
 * The landmark's id, and the skip link's target. Exported because the E2E lane
 * asserts against it rather than re-typing the string — `motir-core` uses the
 * same value, which is what makes the two shells' keyboard journeys identical.
 */
export const MAIN_LANDMARK_ID = 'main'

export function SiteShell({
  children,
  contentClassName,
  className,
}: Readonly<{
  children: React.ReactNode
  /**
   * The width / padding box the surface wants around its own content. It goes
   * ON the landmark rather than in a wrapper inside it, so the room a reader
   * skips into is the room the page draws.
   */
  contentClassName?: string
  /** Extra classes for the outer frame. Rarely needed. */
  className?: string
}>) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col bg-(--el-page-bg) text-(--el-text)',
        className,
      )}
    >
      {/* FIRST in the DOM, and therefore first in the tab order — the whole
          point of the affordance is that it is reachable before the banner it
          exists to skip. */}
      <a
        href={`#${MAIN_LANDMARK_ID}`}
        className={cn(
          'sr-only z-50 focus:not-sr-only focus:absolute focus:top-3 focus:left-4',
          'focus:rounded-(--radius-control) focus:bg-(--el-page-bg) focus:px-4 focus:py-2',
          'focus:text-[13.5px] focus:font-semibold focus:text-(--el-text)',
          'focus:shadow-(--shadow-elevated)',
          'focus:outline-2 focus:outline-offset-2 focus:outline-(--el-accent-on-surface)',
        )}
      >
        {copy.nav.skipToContent}
      </a>

      <SiteHeader />

      {/* `tabIndex={-1}` is what makes the skip link WORK rather than merely
          move the URL fragment: without it the anchor scrolls the landmark
          into view and leaves focus on the link, so the next Tab returns to
          the nav the reader just asked to skip. It is programmatically
          focusable and NOT in the tab order, so nothing else changes.
          `focus:outline-none` because the ring belongs to what the reader is
          about to read, not to the container that received focus in passing. */}
      <main
        id={MAIN_LANDMARK_ID}
        tabIndex={-1}
        className={cn('flex-1 focus:outline-none', contentClassName)}
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  )
}
