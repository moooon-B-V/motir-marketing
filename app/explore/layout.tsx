import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteFooter } from '@/app/_components/SiteFooter'
import { SiteHeader } from '@/app/_components/SiteHeader'

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
    <div className="flex min-h-dvh flex-col bg-(--el-page-bg) text-(--el-text)">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[72rem] px-(--spacing-card-padding) py-10">
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
