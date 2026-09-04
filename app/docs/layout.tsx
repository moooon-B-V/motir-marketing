import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteShell } from '@/app/_components/SiteShell'

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
  return <SiteShell>{children}</SiteShell>
}
