import Link from 'next/link'
import {
  Building2,
  ChevronUp,
  Activity,
  ArrowRight,
  Plus,
  FolderOpen,
  SearchX,
  WifiOff,
} from 'lucide-react'
import { EmptyState, buttonVariants } from '@motir/design-system'
import { copy, format } from '@/lib/copy'
import {
  buildExploreHref,
  hasActiveFilters,
  type ExploreQuery,
  type ProjectSquareCardDto,
  type ProjectSquarePageDto,
} from '@/lib/explore'

/*
 * The card gallery + cursor pagination + empty / no-results / error states
 * (MOTIR-4045). Paginated over the keyset cursor — "Load more" is a real
 * `<a href="?cursor=…">`, so pagination works with no JS. An empty result
 * splits on whether a filter is active (no-results) vs a genuinely empty square;
 * a `failed` read renders the error state.
 */

/** A compact "n d/h/m ago" for the card's recency stat (English only). */
function relativeAge(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('en', {
    numeric: 'auto',
    style: 'narrow',
  })
  const mins = Math.round(diffMs / 60000)
  const absMin = Math.abs(mins)
  if (absMin < 60) return rtf.format(Math.min(mins, -1), 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(months / 12), 'year')
}

function ProjectCard({ card }: { card: ProjectSquareCardDto }) {
  const age = card.stats.lastActivityAt
    ? relativeAge(card.stats.lastActivityAt)
    : null
  return (
    <article className="min-w-0">
      <Link
        href={`/p/${encodeURIComponent(card.identifier)}`}
        aria-label={format(copy.explore.cardViewAria, { name: card.name })}
        className="group flex h-full min-w-0 flex-col rounded-(--radius-card) border border-(--el-border) bg-(--el-surface) p-(--spacing-card-padding) shadow-(--shadow-card) transition-shadow hover:border-(--el-border-strong) hover:shadow-(--shadow-elevated)"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-(--el-text-secondary)">
          <Building2 className="h-3.5 w-3.5 flex-none" aria-hidden />
          <span className="truncate" title={card.org.name}>
            {card.org.name}
          </span>
        </div>

        <h3 className="mt-1.5 truncate text-[15px] font-bold text-(--el-text)">
          {card.name}
        </h3>

        {card.description ? (
          <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-(--el-text-secondary)">
            {card.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-4 pt-4 text-[13px] font-semibold text-(--el-text-secondary)">
          <span
            className="inline-flex items-center gap-1"
            aria-label={format(copy.explore.statUpvotesAria, {
              count: card.stats.upvotes,
            })}
          >
            <ChevronUp className="h-4 w-4 text-(--el-accent)" aria-hidden />
            {card.stats.upvotes}
          </span>
          <span
            className="inline-flex items-center gap-1"
            aria-label={
              age
                ? format(copy.explore.statActivityAria, { time: age })
                : copy.explore.statActivityNone
            }
          >
            <Activity className="h-4 w-4 text-(--el-success)" aria-hidden />
            {age ?? '—'}
          </span>
          <ArrowRight
            className="ml-auto h-4 w-4 text-(--el-text-faint) transition-colors group-hover:text-(--el-link)"
            aria-hidden
          />
        </div>
      </Link>
    </article>
  )
}

export function ExploreGallery({
  basePath,
  query,
  page,
  heading,
}: {
  basePath: string
  query: ExploreQuery
  page: ProjectSquarePageDto | null
  heading: string
}) {
  // Error state — the API is a network hop, so this is a real state.
  if (page === null) {
    return (
      <section aria-labelledby="explore-gallery-heading">
        <h2 id="explore-gallery-heading" className="sr-only">
          {heading}
        </h2>
        <EmptyState
          icon={<WifiOff className="h-6 w-6" aria-hidden />}
          title={copy.explore.errorTitle}
          description={copy.explore.errorBody}
        />
      </section>
    )
  }

  if (page.items.length === 0) {
    const filtered = hasActiveFilters(query)
    return (
      <section aria-labelledby="explore-gallery-heading">
        <h2 id="explore-gallery-heading" className="sr-only">
          {heading}
        </h2>
        <EmptyState
          icon={
            filtered ? (
              <SearchX className="h-6 w-6" aria-hidden />
            ) : (
              <FolderOpen className="h-6 w-6" aria-hidden />
            )
          }
          title={
            filtered ? copy.explore.noResultsTitle : copy.explore.emptyTitle
          }
          description={
            filtered ? copy.explore.noResultsBody : copy.explore.emptyBody
          }
          action={
            filtered ? (
              <Link
                href={buildExploreHref(basePath, query, {
                  search: null,
                  category: null,
                })}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                {copy.explore.clearFilters}
              </Link>
            ) : undefined
          }
        />
      </section>
    )
  }

  return (
    <section aria-labelledby="explore-gallery-heading">
      <h2
        id="explore-gallery-heading"
        className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text)"
      >
        {heading}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.items.map((card) => (
          <ProjectCard key={card.identifier} card={card} />
        ))}
      </div>

      {page.nextCursor ? (
        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href={buildExploreHref(basePath, query, {
              cursor: page.nextCursor,
            })}
            className={buttonVariants({ variant: 'secondary', size: 'md' })}
            rel="next"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            {copy.explore.loadMore}
          </Link>
        </div>
      ) : null}
    </section>
  )
}
