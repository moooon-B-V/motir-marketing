import Link from 'next/link'
import { Search, Tag, TrendingUp } from 'lucide-react'
import { copy, format } from '@/lib/copy'
import {
  buildExploreHref,
  hasActiveFilters,
  type ExploreQuery,
} from '@/lib/explore'

/*
 * The active-filter summary bar (MOTIR-4045). Renders the composed
 * query/topic/rank as tone pills + a "Clear filters" link back to the
 * unfiltered square. Only shown when a narrowing filter (search or topic) is
 * active.
 */

const PILL =
  'inline-flex items-center gap-1 rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) text-xs font-medium text-(--el-text-strong)'

export function ActiveFilters({
  basePath,
  query,
  categoryLabel,
}: {
  basePath: string
  query: ExploreQuery
  categoryLabel?: string
}) {
  if (!hasActiveFilters(query)) return null
  const rankSummary =
    query.rank === 'trending'
      ? format(copy.explore.summaryRankTrending, {
          window:
            copy.explore[
              `window${query.window[0].toUpperCase()}${query.window.slice(1)}` as 'windowWeek'
            ],
        })
      : query.rank === 'popular'
        ? copy.explore.summaryRankPopular
        : copy.explore.summaryRankNew

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-(--el-text-secondary)">
        {copy.explore.activeLabel}
      </span>
      {query.search ? (
        <span className={`${PILL} bg-(--el-tint-sky)`}>
          <Search className="h-3 w-3" aria-hidden />
          {format(copy.explore.summarySearch, { query: query.search })}
        </span>
      ) : null}
      {query.category ? (
        <span className={`${PILL} bg-(--el-tint-lavender)`}>
          <Tag className="h-3 w-3" aria-hidden />
          {categoryLabel ?? query.category}
        </span>
      ) : null}
      <span className={`${PILL} bg-(--el-muted)`}>
        <TrendingUp className="h-3 w-3" aria-hidden />
        {rankSummary}
      </span>
      <Link
        href={buildExploreHref(basePath, query, {
          search: null,
          category: null,
        })}
        className="text-xs font-medium text-(--el-link) hover:text-(--el-link-pressed)"
      >
        {copy.explore.clearFilters}
      </Link>
    </div>
  )
}
