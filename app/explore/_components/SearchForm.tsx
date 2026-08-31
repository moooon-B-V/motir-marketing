import { Search } from 'lucide-react'
import { copy } from '@/lib/copy'
import {
  DEFAULT_PROJECT_SQUARE_RANK,
  DEFAULT_TRENDING_WINDOW,
  type ExploreQuery,
} from '@/lib/explore'

/*
 * The square's search field (MOTIR-4045). A real GET `<form>` — works with no
 * JavaScript and navigates to a crawlable `/explore?q=…` URL. Hidden inputs
 * preserve the active rank / window / topic so a search COMPOSES with them.
 */

export function ExploreSearchForm({
  basePath,
  query,
  preserveCategory = true,
}: {
  basePath: string
  query: ExploreQuery
  preserveCategory?: boolean
}) {
  return (
    <form
      method="get"
      action={basePath}
      role="search"
      aria-label={copy.explore.searchAria}
      className="flex h-(--height-input) w-full items-center gap-2 rounded-(--radius-input) border border-(--el-border) bg-(--el-page-bg) px-(--spacing-input-x) focus-within:border-(--el-border-strong)"
    >
      <Search
        className="h-4 w-4 flex-none text-(--el-text-muted)"
        aria-hidden
      />
      <input
        type="text"
        name="q"
        defaultValue={query.search ?? ''}
        placeholder={copy.explore.searchPlaceholder}
        aria-label={copy.explore.searchAria}
        className="min-w-0 flex-1 bg-transparent text-sm text-(--el-text) placeholder:text-(--el-text-muted) focus:outline-none"
      />
      {query.rank !== DEFAULT_PROJECT_SQUARE_RANK ? (
        <input type="hidden" name="rank" value={query.rank} />
      ) : null}
      {query.rank === 'trending' && query.window !== DEFAULT_TRENDING_WINDOW ? (
        <input type="hidden" name="window" value={query.window} />
      ) : null}
      {preserveCategory && query.category ? (
        <input type="hidden" name="category" value={query.category} />
      ) : null}
      <button type="submit" className="sr-only">
        {copy.explore.searchSubmit}
      </button>
    </form>
  )
}
