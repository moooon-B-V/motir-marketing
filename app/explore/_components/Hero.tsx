import { Compass, CheckCheck } from 'lucide-react'
import { copy } from '@/lib/copy'
import type { ExploreQuery } from '@/lib/explore'
import { ExploreSearchForm } from './SearchForm'

/*
 * The SEO hero (MOTIR-4045). Leads with the page's single semantic <h1> + a
 * descriptive lede + the search. A lavender wash; serif headline. The numeric
 * trust chip from the mock is replaced by a qualitative "Open to everyone" chip
 * (the directory read is cursor-paginated with no total COUNT).
 */

export function ExploreHero({
  basePath,
  query,
}: {
  basePath: string
  query: ExploreQuery
}) {
  return (
    <section className="relative overflow-hidden rounded-(--radius-card) border border-(--el-border) bg-(--el-tint-lavender) px-(--spacing-card-padding) py-10 text-center">
      <div className="mx-auto flex max-w-[44rem] flex-col items-center">
        <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-(--el-accent-on-surface) uppercase">
          <Compass className="h-4 w-4" aria-hidden />
          {copy.explore.heroEyebrow}
        </div>
        <h1 className="font-(family-name:--font-serif) text-3xl font-semibold tracking-tight text-(--el-text) sm:text-4xl">
          {copy.explore.heroTitle}
        </h1>
        <p className="mt-3 max-w-[40rem] text-[15px] leading-relaxed text-(--el-text-secondary)">
          {copy.explore.heroLede}
        </p>
        <div className="mt-6 w-full max-w-[34rem]">
          <ExploreSearchForm basePath={basePath} query={query} />
        </div>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px] text-(--el-text-secondary)">
          {[
            copy.explore.trustCrawlable,
            copy.explore.trustNoSignup,
            copy.explore.trustUpdated,
          ].map((label) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <CheckCheck
                className="h-3.5 w-3.5 text-(--el-success)"
                aria-hidden
              />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
