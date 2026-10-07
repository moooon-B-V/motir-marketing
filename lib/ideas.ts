import { APP_ORIGIN } from '@/lib/appOrigin'

/**
 * The ideas data layer for `motir-marketing` (MOTIR-7685, Story MOTIR-7665).
 *
 * `/ideas` is read live from motir-core's idea store, through its anonymous
 * public contract — `/api/public/ideas`, `/api/public/ideas/tags` and
 * `/api/public/ideas/:slug`. This module owns the contract's shapes, the URL
 * model that turns `?category=&tag=&q=&kind=&idea=` into an API question and
 * back, and the three server reads. The page renders what it returns. No
 * database client (the standing repo rule, asserted by a test) — the same
 * pattern `lib/explore.ts` set for the project square.
 */

/* ── the contract shapes ───────────────────────────────────────────────────
 *
 * Mirrored BY HAND from motir-core `lib/dto/ideas.ts` (the PUBLIC half) and
 * the `IdeaCategory` / `IdeaKind` enums in `prisma/schema.prisma`, as they
 * stand at motir-core `0ee9f99` (2026-10-07). The contract is guarded in the
 * PRODUCING repository and changes additively only; when it changes, these
 * follow. `e2e/fixtures/ideas*.json` are recorded responses of it, and a test
 * type-checks them against these interfaces. */

/** The fixed category list, in motir-core's (grouped) enum order. */
export const IDEA_CATEGORY_SLUGS = [
  'legal',
  'finance',
  'security_compliance',
  'customer_support',
  'localization',
  'growth_marketing',
  'sales',
  'people_hr',
  'operations',
  'engineering',
  'ecommerce',
  'healthcare',
  'education',
  'financial_services',
  'real_estate',
  'logistics',
  'construction',
  'agriculture',
  'pets',
  'family_care',
  'public_sector',
  'personal_growth',
  'personal_finance',
  'health_wellness',
  'ai_infrastructure',
] as const
export type IdeaCategory = (typeof IDEA_CATEGORY_SLUGS)[number]

/** Every kind. `motir_buys` first — the order the public list sorts by. */
export const IDEA_KINDS = ['motir_buys', 'direction'] as const
export type IdeaKind = (typeof IDEA_KINDS)[number]

export interface IdeaCategoryRefDto {
  slug: IdeaCategory
  label: string
}

export interface IdeaTagRefDto {
  slug: string
  label: string
}

/** One sourced claim. `sourceDate` is `YYYY-MM-DD`, or null when the source has none. */
export interface IdeaEvidenceDto {
  claim: string
  sourceName: string
  url: string
  sourceDate: string | null
}

export interface PublicIdeaDto {
  slug: string
  title: string
  pitch: string
  kind: IdeaKind
  category: IdeaCategoryRefDto
  tags: IdeaTagRefDto[]
  capabilities: string[]
  evidence: IdeaEvidenceDto[]
  gap: string | null
  whyNow: string | null
  whyMotir: string | null
  whoElse: string | null
  addedAt: string
  lastReviewedAt: string | null
}

export interface PublicIdeaCategoryCountDto extends IdeaCategoryRefDto {
  count: number
}

export interface PublicIdeaListDto {
  items: PublicIdeaDto[]
  /** Counts over every filter EXCEPT `category`, so the chips stay choosable. */
  categories: PublicIdeaCategoryCountDto[]
  total: number
}

export interface PublicIdeaTagDto extends IdeaTagRefDto {
  /** How many ACTIVE ideas carry the tag. */
  count: number
}

/* ── the URL model ─────────────────────────────────────────────────────────
 *
 * Every narrowing of `/ideas` is a URL parameter, so a filtered view can be
 * shared, bookmarked and crawled, and `?idea=<slug>` addresses the in-place
 * detail. The parse is FORGIVING — a value the API would refuse (an unknown
 * category or kind) or one that is not a slug is dropped rather than turned
 * into an error page, because the URL is something a visitor can type. */

/** The longest free-text query honoured; longer input is cut, as motir-core cuts it. */
export const IDEAS_QUERY_MAX = 200

/** The slug shape every idea and tag slug takes (motir-core `IDEA_SLUG_PATTERN`). */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const IDEAS_PATH = '/ideas'

export interface IdeasParams {
  category?: IdeaCategory
  /** Every tag must match. Kept in the order given, de-duplicated. */
  tags: string[]
  q?: string
  kind?: IdeaKind
  /** The idea open in place over the list. Not a filter: the API never sees it. */
  idea?: string
}

/** What `searchParams` looks like in a Next page, or a `URLSearchParams`. */
export type RawSearchParams =
  Record<string, string | string[] | undefined> | URLSearchParams

function allValues(raw: RawSearchParams, name: string): string[] {
  if (raw instanceof URLSearchParams) return raw.getAll(name)
  const value = raw[name]
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function firstValue(raw: RawSearchParams, name: string): string | undefined {
  const value = allValues(raw, name)[0]?.trim()
  return value ? value : undefined
}

function oneOf<T extends string>(
  allowed: readonly T[],
  value: string | undefined,
): T | undefined {
  return value !== undefined && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined
}

function slugOrUndefined(value: string | undefined): string | undefined {
  return value !== undefined && SLUG_PATTERN.test(value) ? value : undefined
}

export function parseIdeasParams(raw: RawSearchParams): IdeasParams {
  const tags: string[] = []
  for (const value of allValues(raw, 'tag')) {
    const tag = slugOrUndefined(value.trim())
    if (tag && !tags.includes(tag)) tags.push(tag)
  }
  const q = firstValue(raw, 'q')?.slice(0, IDEAS_QUERY_MAX).trim()
  return {
    category: oneOf(IDEA_CATEGORY_SLUGS, firstValue(raw, 'category')),
    tags,
    q: q ? q : undefined,
    kind: oneOf(IDEA_KINDS, firstValue(raw, 'kind')),
    idea: slugOrUndefined(firstValue(raw, 'idea')),
  }
}

/** A change to apply to the current params: `null` clears a field. */
export interface IdeasParamsChange {
  category?: IdeaCategory | null
  tags?: string[]
  q?: string | null
  kind?: IdeaKind | null
  idea?: string | null
}

function pick<T>(change: T | null | undefined, current: T | undefined) {
  if (change === null) return undefined
  return change === undefined ? current : change
}

/**
 * The FILTER part of the URL, in the one stable order: category, every tag,
 * q, kind. Shared by the page URL and the API query, so the two cannot
 * disagree about what a filter means.
 */
function filterEntries(p: IdeasParams): Array<[string, string]> {
  const entries: Array<[string, string]> = []
  if (p.category) entries.push(['category', p.category])
  for (const tag of p.tags) entries.push(['tag', tag])
  if (p.q) entries.push(['q', p.q])
  if (p.kind) entries.push(['kind', p.kind])
  return entries
}

/**
 * The canonical `/ideas` URL for `params` with `change` applied. The
 * parameter order is fixed (category, tag…, q, kind, idea), so the same view
 * is always the same string — a shared link and a crawled link are one URL.
 * Fields `change` leaves undefined are kept; `idea` is kept too, so a caller
 * that changes a filter while a detail is open says `idea: null` to close it.
 */
export function ideasHref(
  params: IdeasParams,
  change: IdeasParamsChange = {},
): string {
  const tags = change.tags ?? params.tags
  const next: IdeasParams = {
    category: pick(change.category, params.category),
    tags: [...new Set(tags)],
    q: pick(change.q, params.q)?.trim() || undefined,
    kind: pick(change.kind, params.kind),
    idea: pick(change.idea, params.idea),
  }
  const entries = filterEntries(next)
  if (next.idea) entries.push(['idea', next.idea])
  const qs = new URLSearchParams(entries).toString()
  return qs ? `${IDEAS_PATH}?${qs}` : IDEAS_PATH
}

/** Whether any filter narrows the list (the open idea is not a filter). */
export function hasIdeaFilters(params: IdeasParams): boolean {
  return filterEntries(params).length > 0
}

/* ── the reads (the ONLY network hops this surface makes) ─────────────────
 *
 * Server-side, revalidated hourly: the store changes when its owner curates
 * it, not per request, and an hour is how long a retired idea may linger —
 * the window the story promises. motir-core's `Cache-Control` matches it. */

export const IDEAS_REVALIDATE_SECONDS = 3600

const API_BASE = `${APP_ORIGIN}/api/public/ideas`

/**
 * The public API could not answer — unreachable, a 5xx, a refused filter, or
 * a body that is not JSON. The page renders its error state for it: there is
 * no static copy of the ideas left to fall back on.
 */
export class IdeasUnavailableError extends Error {
  override readonly name = 'IdeasUnavailableError'

  constructor(
    readonly path: string,
    readonly status: number | null,
    options?: { cause?: unknown },
  ) {
    super(
      `the public ideas API did not answer ${path}` +
        (status === null ? '' : ` (HTTP ${status})`),
      options,
    )
  }
}

async function read(path: string): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      next: { revalidate: IDEAS_REVALIDATE_SECONDS },
    })
  } catch (cause) {
    throw new IdeasUnavailableError(path, null, { cause })
  }
}

async function json<T>(path: string, res: Response): Promise<T> {
  if (!res.ok) throw new IdeasUnavailableError(path, res.status)
  try {
    return (await res.json()) as T
  } catch (cause) {
    throw new IdeasUnavailableError(path, res.status, { cause })
  }
}

/** Every active idea matching the filters, with per-category counts. */
export async function fetchIdeas(
  params: IdeasParams,
): Promise<PublicIdeaListDto> {
  const qs = new URLSearchParams(filterEntries(params)).toString()
  const path = qs ? `?${qs}` : ''
  return json<PublicIdeaListDto>(path, await read(path))
}

/** Every tag carried by at least one active idea, with its count. */
export async function fetchIdeaTags(): Promise<PublicIdeaTagDto[]> {
  const path = '/tags'
  const body = await json<{ tags: PublicIdeaTagDto[] }>(path, await read(path))
  return body.tags
}

/**
 * One active idea, or `null` when there is none by that slug. motir-core
 * answers an unknown slug and a RETIRED one with the same 404, so `null` is
 * both — the page falls back to the list either way.
 */
export async function fetchIdea(slug: string): Promise<PublicIdeaDto | null> {
  const path = `/${encodeURIComponent(slug)}`
  const res = await read(path)
  if (res.status === 404) return null
  return json<PublicIdeaDto>(path, res)
}

/* ── presentation helpers the page and the detail share ────────────────────
 *
 * Both are DERIVED, never stored (`design/ideas/design-notes.md`): the mark
 * follows the category's group in motir-core's enum, so a palette swap
 * re-tints every mark and a category added to a group inherits its mark. */

/** The showcase fill a category's colour mark takes. */
export type IdeaMark = 'field' | 'decision' | 'record' | 'ground'

const MARK_BY_CATEGORY: Record<IdeaCategory, IdeaMark> = {
  // business functions
  legal: 'field',
  finance: 'field',
  security_compliance: 'field',
  customer_support: 'field',
  localization: 'field',
  growth_marketing: 'field',
  sales: 'field',
  people_hr: 'field',
  operations: 'field',
  engineering: 'field',
  // verticals
  ecommerce: 'decision',
  healthcare: 'decision',
  education: 'decision',
  financial_services: 'decision',
  real_estate: 'decision',
  logistics: 'decision',
  construction: 'decision',
  agriculture: 'decision',
  pets: 'decision',
  family_care: 'decision',
  public_sector: 'decision',
  // consumer
  personal_growth: 'record',
  personal_finance: 'record',
  health_wellness: 'record',
  // platform
  ai_infrastructure: 'ground',
}

/**
 * A category's mark. Total over every category the contract lists, and a
 * category this file does not know yet (motir-core added one first) takes the
 * platform mark rather than none.
 */
export function ideaCategoryMark(slug: string): IdeaMark {
  return (MARK_BY_CATEGORY as Record<string, IdeaMark>)[slug] ?? 'ground'
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * A source date as "October 2025". The store records the 1st when a source
 * gives only a month, so the day is never shown. Anything that is not
 * `YYYY-MM-DD` gives `null` and the date is simply not drawn.
 */
export function sourceMonth(date: string | null): string | null {
  const match = date?.match(/^(\d{4})-(\d{2})-\d{2}$/)
  if (!match) return null
  const month = MONTHS[Number(match[2]) - 1]
  return month ? `${month} ${match[1]}` : null
}

/** Whether an optional text field has anything to draw (`""` does not). */
export function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== ''
}
