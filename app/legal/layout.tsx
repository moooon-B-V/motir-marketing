import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { SiteFooter } from '@/app/_components/SiteFooter'
import { SiteHeader } from '@/app/_components/SiteHeader'

/**
 * The legal-document shell (MOTIR-4009).
 *
 * The room is composed from the same chrome every motir.co surface wears —
 * `SiteHeader` + `SiteFooter` — so a legal page cannot drift from the rest of
 * the site. `/legal` marks NEITHER nav item current: the shipped header only
 * marks its one internal route (`/design`), and Explore / Docs stay cross-origin
 * until their own cards land.
 *
 * ── NO `loading.tsx` ANYWHERE IN THIS TREE, deliberately ────────────────────
 * `[slug]/page.tsx` calls `notFound()` for an unknown slug. A `loading.tsx`
 * above a route that decides existence flushes the response head and fixes the
 * status at 200, turning a 404 into a page that renders like one. The copy is
 * read from disk at build time, so there is nothing to suspend on anyway.
 *
 * ── NO database read, NO API call ───────────────────────────────────────────
 * These pages are files on disk. The reason the app host's shipped layout gives
 * still applies: a legal page that 500s because a database is unreachable is a
 * worse failure than a narrowed crawl surface.
 *
 * ── ENGLISH-ONLY, AND THAT IS ACCEPTED (MOTIR-4009) ─────────────────────────
 * motir-core carries `messages/en.json` AND `zh.json`, but `motir-marketing` is
 * English-only (`lib/copy.ts` imports `messages/en.json` directly, no locale
 * framework). So the SURROUNDING chrome labels — the breadcrumb, the version
 * line, the index title and intro — have no `zh` twin here. What is NOT lost is
 * the contract text itself: the documents were never translated (seven English
 * files, no `zh` variants), so only the labels around them drop a locale.
 * Adding an i18n framework to this site is a separate question no card here
 * owns, because nothing in this story depends on it.
 */

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: copy.legal.metaTitle,
    description: copy.legal.metaDescription,
    alternates: { canonical: '/legal' },
  }
}

export default function LegalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-(--el-page-bg) text-(--el-text)">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
