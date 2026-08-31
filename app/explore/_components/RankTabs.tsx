import Link from 'next/link'
import { TrendingUp, Star, Clock } from 'lucide-react'
import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import {
  buildExploreHref,
  PROJECT_SQUARE_RANKS,
  TRENDING_WINDOWS,
  type ExploreQuery,
} from '@/lib/explore'

/*
 * The rank tabs + the Trending window (MOTIR-4045) — the square's sort surface,
 * built as the design's Segmented control but rendered as real `<a href>` LINKS
 * (each rank/window is its own server-rendered, shareable, crawlable URL). Each
 * link resets the keyset cursor. Colour via --el-* tokens; shape via
 * element-semantic shape tokens.
 */

const RANK_META = {
  trending: { icon: TrendingUp, labelKey: 'rankTrending' as const },
  popular: { icon: Star, labelKey: 'rankPopular' as const },
  recent: { icon: Clock, labelKey: 'rankNew' as const },
}

const WINDOW_META = {
  day: 'windowDay' as const,
  week: 'windowWeek' as const,
  month: 'windowMonth' as const,
}

function SegLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-(--radius-control) px-(--spacing-control-x) py-(--spacing-control-y) text-[13px] font-medium transition-colors',
        active
          ? 'bg-(--el-page-bg) text-(--el-text) shadow-(--shadow-subtle)'
          : 'text-(--el-text-secondary) hover:text-(--el-text)',
      )}
    >
      {children}
    </Link>
  )
}

export function RankTabs({
  basePath,
  query,
}: {
  basePath: string
  query: ExploreQuery
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label={copy.explore.sortAria}
        className="inline-flex items-center gap-0.5 rounded-(--radius-btn) border border-(--el-border) bg-(--el-surface) p-0.5"
      >
        {PROJECT_SQUARE_RANKS.map((rank) => {
          const { icon: Icon, labelKey } = RANK_META[rank]
          const active = query.rank === rank
          const tint =
            rank === 'trending'
              ? 'text-(--el-accent)'
              : rank === 'popular'
                ? 'text-(--el-warning)'
                : 'text-(--el-info)'
          return (
            <SegLink
              key={rank}
              href={buildExploreHref(basePath, query, { rank })}
              active={active}
            >
              <Icon
                className={cn('h-3.5 w-3.5', active ? tint : '')}
                aria-hidden
              />
              {copy.explore[labelKey]}
            </SegLink>
          )
        })}
      </div>

      {query.rank === 'trending' ? (
        <div
          role="group"
          aria-label={copy.explore.windowWeek}
          className="inline-flex items-center gap-0.5 rounded-(--radius-btn) border border-(--el-border) bg-(--el-surface) p-0.5"
        >
          {TRENDING_WINDOWS.map((window) => (
            <SegLink
              key={window}
              href={buildExploreHref(basePath, query, { window })}
              active={query.window === window}
            >
              {copy.explore[WINDOW_META[window]]}
            </SegLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}
