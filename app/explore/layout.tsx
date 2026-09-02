import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteShell } from '@/app/_components/SiteShell'

/**
 * The project-square shell (MOTIR-4045). Composes the same chrome every
 * motir.co surface wears. `/explore` marks the `Explore` nav item current —
 * the ONE nav item that now resolves on this host.
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: copy.explore.metaTitle,
    description: copy.explore.metaDescription,
  }
}

export default function ExploreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteShell contentClassName="mx-auto w-full max-w-[72rem] px-(--spacing-card-padding) py-10">
      {children}
    </SiteShell>
  )
}
