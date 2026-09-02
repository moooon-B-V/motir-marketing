import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteShell } from '@/app/_components/SiteShell'

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
    <SiteShell contentClassName="mx-auto w-full max-w-[46rem] px-(--spacing-card-padding) py-10">
      {children}
    </SiteShell>
  )
}
