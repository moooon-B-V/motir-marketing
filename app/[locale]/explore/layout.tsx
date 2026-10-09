import type { Metadata } from 'next'
import { getCopy } from '@/lib/copy'
import { enterLocale, type LocaleParams } from '@/i18n/locale'

/**
 * The project-square shell (MOTIR-4045). Composes the same chrome every
 * motir.co surface wears. `/explore` marks the `Explore` nav item current —
 * the ONE nav item that now resolves on this host.
 */

export async function generateMetadata({
  params,
}: {
  params: LocaleParams
}): Promise<Metadata> {
  // The words only; each page names its own canonical (MOTIR-7956).
  const copy = await getCopy(await enterLocale(params))
  return {
    title: copy.explore.metaTitle,
    description: copy.explore.metaDescription,
  }
}

/*
 * The frame is each page's own (2026-10 redesign): the Build in public page
 * opens on a full-width wave hero with the header laid over it, while a topic
 * page keeps the centred column. So this layout passes its children through.
 */
export default function ExploreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
