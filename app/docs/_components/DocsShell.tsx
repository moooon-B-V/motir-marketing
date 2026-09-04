import { DocsRail } from './DocsRail'
import type { RailOperation } from '@/lib/docs'

/*
 * The docs two-column shell (MOTIR-4396) — the rail beside the reading column,
 * per `design/docs/design-notes.md` § "The one structural change".
 *
 * ⚠️ WHY THIS IS A COMPONENT AND NOT A LAYOUT. Two layouts render it — the
 * guides group and the API sub-area — because those are the two things Next can
 * tell apart WITHOUT a pathname, and a server layout cannot read one. That is
 * the whole reason the route group exists: the file system decides which pages
 * get the operation tier, so "tiers 2 and 3 render if and only if the route is
 * `/docs/api` or below" is a fact about where a file lives rather than a
 * condition somebody has to keep true.
 *
 * ⚠️ THE CONTENT COLUMN KEEPS ITS 46rem MEASURE. The rail takes space beside it
 * rather than out of it: long-form prose is constrained by the reading measure,
 * not by the container, so widening the column to fill what the rail left over
 * would make every page harder to read in order to use the space. The asset
 * says so; this is where it is true.
 */
export function DocsShell({
  children,
  operations,
}: Readonly<{
  children: React.ReactNode
  /** The operation tier. Passed only by the API sub-area's layout. */
  operations?: readonly { group: string; operations: RailOperation[] }[]
}>) {
  return (
    /* ⚠️ THE BASE TRACK IS BOUNDED, and that is not decoration. A grid column
       defaults to `auto`, which sizes to MAX-CONTENT — so below the breakpoint
       the single track took its width from the 46rem reading column and the
       rail stretched to 736px inside a 390px viewport, scrolling the whole page
       sideways. `minmax(0,1fr)` is what stops a grid child from setting the
       track's width. Caught by rendering at 390px, not by any test. */
    <div className="grid grid-cols-[minmax(0,1fr)] items-start md:grid-cols-[264px_minmax(0,1fr)]">
      <DocsRail operations={operations} />
      <div className="w-full max-w-[46rem] px-(--spacing-card-padding) py-10">
        {children}
      </div>
    </div>
  )
}
