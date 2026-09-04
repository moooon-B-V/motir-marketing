import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteShell } from '@/app/_components/SiteShell'
import { SITE_HOST } from '@/lib/publicHost'

/**
 * The docs shell (MOTIR-4046, narrowed by MOTIR-4396). Composes the same chrome
 * every motir.co surface wears; `/docs` marks the `Docs` nav item current (the
 * second nav item to resolve on this host, after Explore).
 *
 * ⚠️ IT NO LONGER SETS THE CONTENT BOX, and that is the whole of what MOTIR-4396
 * changed here. The 46rem measure moved DOWN into `_components/DocsShell.tsx`,
 * because the rail sits BESIDE that column and this landmark now has to hold
 * both. The measure itself is unchanged: the rail takes space beside the
 * reading column, never out of it.
 *
 * The two sub-area layouts below it are what decide whether a page's rail
 * carries the operation tier — `(guides)/layout.tsx` passes none,
 * `api/layout.tsx` passes the operations. A server layout cannot read a
 * pathname, so that split IS the design's route-prefix rule.
 *
 * ⚠️ IT DOES SET ONE THING ON THE LANDMARK, AND ONLY AT `md` (MOTIR-4465):
 * `md:flex md:flex-col`, so the docs grid inside it can GROW to the landmark's
 * height. `SiteShell`'s frame is `min-h-dvh` and its `<main>` is `flex-1`, so
 * the landmark already fills the viewport — but a block child of it does not,
 * and the docs grid was taking its height from its own content. On a page
 * shorter than the viewport (`/docs/mcp`) the row therefore ended 224px above
 * the footer, and the element that paints the rail's surface stretches to the
 * ROW, so the sidebar stopped mid-page: MOTIR-4432's defect again, on the axis
 * that card's measurement could not see.
 *
 * It is gated at `md` because below the breakpoint the rail is a band ABOVE the
 * content rather than a column beside it (`DocsRail.tsx`, panel 7 of the
 * asset). A grid stretched to the viewport there would distribute the leftover
 * space across its auto rows and inflate that band — the correct answer at one
 * breakpoint is the wrong one at the other, so the rule carries the breakpoint.
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: copy.docs.metaTitle,
    description: copy.docs.metaDescription,
  }
}

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteShell host={SITE_HOST} contentClassName="md:flex md:flex-col">
      {children}
    </SiteShell>
  )
}
