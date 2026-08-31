import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteFooter } from '@/app/_components/SiteFooter'
import { SiteHeader } from '@/app/_components/SiteHeader'

/**
 * The docs shell (MOTIR-4046). Composes the same chrome every motir.co surface
 * wears; `/docs` marks the `Docs` nav item current (the second nav item to
 * resolve on this host, after Explore).
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
    <div className="flex min-h-dvh flex-col bg-(--el-page-bg) text-(--el-text)">
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-[46rem] px-(--spacing-card-padding) py-10">
          {children}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
