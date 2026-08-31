import { APP_ORIGIN } from '@/lib/appOrigin'

/**
 * The project-square data layer for `motir-marketing` (MOTIR-4045).
 *
 * The square moved out of `motir-core`, so this repository does NOT read the
 * database — it consumes motir-core's anonymous public contract
 * (`/api/public/explore` + `/api/public/categories`), both of which make ZERO
 * `getSession()` calls. This module owns the URL-param model and the fetch; the
 * pages render its result. No database client (the standing repo rule, asserted
 * by a test).
 */

/* ── the contract shapes (motir-core `lib/dto/projectSquare.ts`) ──────────── */

export interface ProjectSquareOrgDto {
  name: string
  slug: string
}

export interface ProjectSquareStatsDto {
  upvotes: number
  lastActivityAt: string | null
}

export interface ProjectSquareCardDto {
  identifier: string
  name: string
  org: ProjectSquareOrgDto
  description: string | null
  stats: ProjectSquareStatsDto
}

export interface ProjectSquarePageDto {
  items: ProjectSquareCardDto[]
  nextCursor: string | null
}

export interface ProjectCategoryDto {
  slug: string
  label: string
  projectCount: number
}

/* ── the rank / window model (motir-core `lib/projectSquare/rank.ts`) ─────── */

export const PROJECT_SQUARE_RANKS = ['trending', 'popular', 'recent'] as const
export type ProjectSquareRank = (typeof PROJECT_SQUARE_RANKS)[number]
export const DEFAULT_PROJECT_SQUARE_RANK: ProjectSquareRank = 'trending'
export const TRENDING_WINDOWS = ['day', 'week', 'month'] as const
export type TrendingWindow = (typeof TRENDING_WINDOWS)[number]
export const DEFAULT_TRENDING_WINDOW: TrendingWindow = 'week'

function parseRank(raw: string | undefined): ProjectSquareRank | null {
  return raw && (PROJECT_SQUARE_RANKS as readonly string[]).includes(raw)
    ? (raw as ProjectSquareRank)
    : null
}
function parseTrendingWindow(raw: string | undefined): TrendingWindow | null {
  return raw && (TRENDING_WINDOWS as readonly string[]).includes(raw)
    ? (raw as TrendingWindow)
    : null
}

/* ── the URL-param model (motir-core `lib/projectSquare/exploreParams.ts`) ── */

export interface ExploreQuery {
  search?: string
  category?: string
  rank: ProjectSquareRank
  window: TrendingWindow
  cursor?: string
}

export type RawSearchParams = Record<string, string | string[] | undefined>

function firstParam(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export function parseExploreSearchParams(
  raw: RawSearchParams,
  overrides?: { category?: string },
): ExploreQuery {
  const rank = parseRank(firstParam(raw['rank'])) ?? DEFAULT_PROJECT_SQUARE_RANK
  const window =
    parseTrendingWindow(firstParam(raw['window'])) ?? DEFAULT_TRENDING_WINDOW
  return {
    search: firstParam(raw['q']),
    category: overrides?.category ?? firstParam(raw['category']),
    rank,
    window,
    cursor: firstParam(raw['cursor']),
  }
}

function canonicalEntries(query: ExploreQuery): Array<[string, string]> {
  const entries: Array<[string, string]> = []
  if (query.search) entries.push(['q', query.search])
  if (query.category) entries.push(['category', query.category])
  if (query.rank !== DEFAULT_PROJECT_SQUARE_RANK)
    entries.push(['rank', query.rank])
  if (query.rank === 'trending' && query.window !== DEFAULT_TRENDING_WINDOW) {
    entries.push(['window', query.window])
  }
  if (query.cursor) entries.push(['cursor', query.cursor])
  return entries
}

export function buildExploreHref(
  basePath: string,
  current: ExploreQuery,
  overrides: {
    rank?: ProjectSquareRank
    window?: TrendingWindow
    search?: string | null
    category?: string | null
    cursor?: string
  } = {},
): string {
  const changesOrdering =
    overrides.rank !== undefined ||
    overrides.window !== undefined ||
    overrides.search !== undefined ||
    overrides.category !== undefined

  const next: ExploreQuery = {
    search:
      overrides.search === null
        ? undefined
        : (overrides.search ?? current.search),
    category:
      overrides.category === null
        ? undefined
        : (overrides.category ?? current.category),
    rank: overrides.rank ?? current.rank,
    window: overrides.window ?? current.window,
    cursor: changesOrdering ? undefined : overrides.cursor,
  }

  const params = new URLSearchParams(canonicalEntries(next))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function hasActiveFilters(query: ExploreQuery): boolean {
  return Boolean(query.search || query.category)
}

/* ── the fetch (the ONLY network hop this surface makes) ─────────────────── */

export interface SquareData {
  /** The page of cards, or `null` when the API was unreachable (error state). */
  page: ProjectSquarePageDto | null
  categories: ProjectCategoryDto[]
  /** `true` when either read failed — the page renders the error state. */
  failed: boolean
}

/** The public API origin — `app.motir.co`, from `lib/appOrigin.ts`. */
const API_BASE = `${APP_ORIGIN}/api/public`

async function fetchJson<T>(path: string): Promise<T> {
  // The square ranks by recent activity, so the read must be fresh, not baked
  // into the static build. `next: { revalidate: 0 }` keeps it request-time.
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`public API ${res.status} for ${path}`)
  return (await res.json()) as T
}

export async function loadSquare(
  query: ExploreQuery,
  opts: { strictCategory?: boolean } = {},
): Promise<SquareData> {
  const params = new URLSearchParams()
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.rank !== DEFAULT_PROJECT_SQUARE_RANK) params.set('rank', query.rank)
  if (query.rank === 'trending' && query.window !== DEFAULT_TRENDING_WINDOW) {
    params.set('window', query.window)
  }
  if (query.search) params.set('q', query.search)
  if (query.category) params.set('category', query.category)
  const qs = params.toString()

  try {
    const [page, { categories }] = await Promise.all([
      fetchJson<ProjectSquarePageDto>(`/explore${qs ? `?${qs}` : ''}`),
      fetchJson<{ categories: ProjectCategoryDto[] }>('/categories'),
    ])
    return { page, categories, failed: false }
  } catch {
    // An unreachable API is a REAL state for this surface — the page renders
    // the error state rather than crashing (asserted by a test).
    if (opts.strictCategory) {
      // A topic page still needs to distinguish "API down" from "unknown slug".
      // Without categories we cannot resolve the label, but the slug is still
      // the category param — leave the 404 decision to the page via the data.
    }
    return { page: null, categories: [], failed: true }
  }
}

/** Resolve a human label for a category slug, else the slug itself. */
export function categoryLabel(
  categories: ProjectCategoryDto[],
  slug: string,
): string | undefined {
  return categories.find((c) => c.slug === slug)?.label
}
