import { APP_ORIGIN } from '@/lib/appOrigin'
import { SITE_ORIGIN as SITE_ORIGIN_FOR_RETURN } from '@/lib/siteOrigin'
import {
  publicPathFor,
  publicPathWithQuery,
  type PublicHost,
} from '@/lib/publicHost'

/**
 * The `/p/*` data layer for `motir-marketing` (MOTIR-4115).
 *
 * The public project pages moved out of `motir-core`, so this repository does
 * NOT read the database — it consumes motir-core's anonymous public contract.
 * This module owns every fetch that surface makes; the pages render its result.
 * No database client (the standing repo rule, asserted by a test).
 *
 * ── ⚠️ THE SHAPES BELOW ARE RESTATED, NOT IMPORTED, AND THAT IS THE SEAM ──
 *
 * They mirror `motir-core`'s `lib/dto/publicProjects.ts`. The CONTRACT is
 * guarded in the PRODUCING repository — `docs/decisions/public-surface-hosts.md`
 * §3 and its `tests/api/public/contract-drift.test.ts` — because, as §3 puts it,
 * "a contract test that lives only in the consumer reports that motir-core broke
 * motir.co, after it has shipped". Nothing here asserts the contract. When a
 * shape changes, the guard that goes red is over there.
 *
 * ── ⚠️ THREE OUTCOMES, NOT TWO ────────────────────────────────────────────
 *
 * `lib/explore.ts` has a `failed` flag because its read has two outcomes: data,
 * or the API is unreachable. This surface has THREE, and conflating any two of
 * them is a visible product bug:
 *
 *   • `ok`        — the project exists and is public.
 *   • `not-found` — a `404 { code }` from the API. The project does not exist,
 *                   is not public, or the key is wrong. The page calls
 *                   `notFound()`.
 *   • `failed`    — the API did not answer, or answered 5xx. The project may
 *                   well exist. The page renders the ERROR state the design
 *                   draws (`design/public-projects/`, panel 12).
 *
 * Collapsing `failed` into `not-found` tells a visitor the project was deleted
 * every time motir-core restarts, which is the worse direction: a 404 is a
 * statement about the world, an error is a statement about us. Collapsing
 * `not-found` into `failed` hides real 404s from crawlers and keeps dead links
 * out of the index. `design/public-projects/design-notes.md` records the split.
 */

/* ── the contract shapes (motir-core `lib/dto/publicProjects.ts`) ─────────── */

export interface PublicProjectStatsDto {
  publicRequests: number
  upvotes: number
  planned: number
  shipped: number
  inProgress: number
}

export interface PublicProjectLinksDto {
  website?: string
  repo?: string
  docs?: string
  changelog?: string
}

export interface PublicProjectOverviewDto {
  /** The GLOBAL project id — what the public WRITE endpoints are keyed by. */
  id: string
  name: string
  /** The project key — the `/p/<identifier>` URL segment. */
  identifier: string
  workspaceName: string
  /** The authored README Markdown, or null → the empty state. */
  publicOverviewMd: string | null
  publicTagline: string | null
  publicTags: string[]
  stats: PublicProjectStatsDto
  links: PublicProjectLinksDto
  /**
   * ⚠️ ALWAYS `false` HERE, AND THE PAGE MUST NOT READ IT.
   *
   * It exists in the contract because the application used to render this page
   * and could resolve a viewer. On `motir.co` `actorUserId` is structurally
   * null for every read — the session cookie is host-only on `app.motir.co` and
   * `sameSite: 'lax'` forecloses a credentialed cross-origin call either way —
   * so this field can only ever be `false`. `public-surface-hosts.md`
   * AMENDMENT 4 row 7 makes in-place editing ABSENT from this host for exactly
   * that reason; a page that branched on this flag would be drawing a state it
   * cannot reach. Kept in the shape because the contract carries it.
   */
  viewerCanManage: boolean
}

/* ── the tab shapes (MOTIR-4116) ──────────────────────────────────────────── */

/** One public-safe work item — the same stripped projection every list uses. */
export interface PublicWorkItemDto {
  id: string
  identifier: string
  key: number
  title: string
  kind: string
  status: string
  statusCategory: 'todo' | 'in_progress' | 'done'
  priority: string
  /**
   * Present and TRUE only on a private epic seen by a non-member. Its
   * descendants are excluded server-side, not hidden here — this is the display
   * signal, and the reason a row can say so honestly.
   */
  childrenHidden?: boolean
}

export interface PublicWorkItemPageDto {
  items: PublicWorkItemDto[]
  nextCursor: string | null
}

export interface PublicBoardColumnDto {
  id: string
  name: string
  statusKeys: string[]
  cards: PublicWorkItemDto[]
  totalCount: number
}

export interface PublicBoardDto {
  boardId: string
  name: string
  columns: PublicBoardColumnDto[]
  /** The board-level load cap: this read is BOUNDED, not paged. */
  cap: number
  truncated: boolean
}

export interface PublicTreeRowDto extends PublicWorkItemDto {
  parentId: string | null
  hasChildren: boolean
}

export interface PublicTreeLevelDto {
  rows: PublicTreeRowDto[]
  hasMore: boolean
  /** The level's FULL sibling count, independent of paging. */
  total: number
}

export type PublicRoadmapBucket =
  'submitted' | 'planned' | 'in_progress' | 'done'

export const ROADMAP_BUCKETS: readonly {
  key: PublicRoadmapBucket
  label: string
}[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'planned', label: 'Planned' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
] as const

export interface PublicRoadmapCardDto {
  id: string
  identifier: string
  key: number
  title: string
  kind: string
  voteCount: number
  /** Always false on this host — see `viewerCanManage`'s note. */
  voted: boolean
}

export interface PublicRoadmapColumnDto {
  key: PublicRoadmapBucket
  totalCount: number
  cards: PublicRoadmapCardDto[]
  nextCursor: string | null
}

export interface PublicRoadmapDto {
  columns: PublicRoadmapColumnDto[]
}

export interface PublicChangelogEntryDto {
  identifier: string
  key: number
  title: string
  kind: string
  status: string
  priority: string
  /** ISO 8601 — the most recent transition into a done-category status. */
  shippedAt: string
  epic: { identifier: string; title: string } | null
}

export interface PublicChangelogPageDto {
  entries: PublicChangelogEntryDto[]
  nextCursor: string | null
}

/* ── the read ─────────────────────────────────────────────────────────────── */

/** The public API origin — `app.motir.co`, from `lib/appOrigin.ts`. */
export const PUBLIC_API_BASE = `${APP_ORIGIN}/api/public`

/** One read's outcome. See the three-outcomes note above. */
export type PublicRead<T> =
  { status: 'ok'; data: T } | { status: 'not-found' } | { status: 'failed' }

/**
 * GET one path under the public API, mapping the three outcomes.
 *
 * `next: { revalidate: 0 }` keeps the read at request time: a public project
 * page shows a live board and a live changelog, and a copy frozen into the build
 * would serve a project's state as it was when the site last deployed.
 */
export async function readPublic<T>(path: string): Promise<PublicRead<T>> {
  try {
    const res = await fetch(`${PUBLIC_API_BASE}${path}`, {
      next: { revalidate: 0 },
      headers: { accept: 'application/json' },
    })
    // 404 is the API SAYING something — the project is not public, or the key is
    // unknown. It is not a failure to reach it, and the two must not merge.
    if (res.status === 404) return { status: 'not-found' }
    if (!res.ok) return { status: 'failed' }
    return { status: 'ok', data: (await res.json()) as T }
  } catch {
    // A network error, a DNS failure, a timeout — the API did not answer.
    return { status: 'failed' }
  }
}

/** The project SUBJECT — the hero, the authored overview, the stats. */
export function loadProject(
  identifier: string,
): Promise<PublicRead<PublicProjectOverviewDto>> {
  return readPublic<PublicProjectOverviewDto>(
    `/p/${encodeURIComponent(identifier)}`,
  )
}

/* ── the tab set (the shell renders it; the routes arrive in MOTIR-4116) ──── */

export interface ProjectTab {
  /** The path segment under `/p/<identifier>`; '' is the Overview itself. */
  segment: string
  label: string
}

/**
 * The five tabs plus the Overview, in the order the design draws them.
 *
 * ⚠️ ONE LIST, and the shell is what renders it — so a tab cannot be added to a
 * route tree and forgotten in the navigation, or vice versa. The tab ROUTES
 * arrive in MOTIR-4116; until they do these links point at 404s, which is
 * expected and is why that card is `blocked_by` this one rather than the
 * reverse.
 */
export const PROJECT_TABS: readonly ProjectTab[] = [
  { segment: '', label: 'Overview' },
  { segment: 'board', label: 'Board' },
  { segment: 'items', label: 'Items' },
  { segment: 'tree', label: 'Tree' },
  { segment: 'roadmap', label: 'Roadmap' },
  { segment: 'changelog', label: 'Changelog' },
] as const

/**
 * The path of one tab ON THE HOST THIS REQUEST ARRIVED ON (MOTIR-4220).
 *
 * ⚠️ IT TAKES THE HOST, and every caller passes the one the router resolved.
 * The same tab is `/p/ACME/board` on `motir.co`, `/ACME/board` on a workspace
 * subdomain and `/board` on a customer domain — `lib/publicHost.ts` owns that
 * mapping, and this delegates rather than restating it, so there is one place
 * that knows what a link looks like.
 */
export function projectTabHref(
  host: PublicHost,
  identifier: string,
  segment: string,
): string {
  return publicPathFor(host, identifier, segment)
}

/**
 * A plain-text, length-capped description from the authored README.
 *
 * Mirrors `motir-core`'s `derivePublicDescription` so the `<meta>` this host
 * emits matches the one the API's own consumers would derive — the same text,
 * from the same source, on the host that now owns the canonical.
 */
const DESCRIPTION_MAX = 160

export function deriveDescription(md: string | null, fallback: string): string {
  if (!md) return fallback
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return fallback
  return text.length > DESCRIPTION_MAX
    ? `${text.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`
    : text
}

/* ── the five tab reads (MOTIR-4116) ──────────────────────────────────────── */
//
// Each takes the project key and whatever paging coordinate its endpoint uses,
// and returns the same three-outcome `PublicRead`. The `not-found` arm belongs
// to the PROJECT — a tab is never 404 in its own right, because the shell has
// already resolved the project by the time a tab renders.

const seg = (identifier: string) => `/p/${encodeURIComponent(identifier)}`

/** The BOARD — bounded by the API's own cap, not paged. */
export function loadBoard(
  identifier: string,
): Promise<PublicRead<PublicBoardDto>> {
  return readPublic<PublicBoardDto>(`${seg(identifier)}/board`)
}

/** The ITEMS list — cursor-paged; `cursor` omitted is the first page. */
export function loadItems(
  identifier: string,
  cursor?: string,
): Promise<PublicRead<PublicWorkItemPageDto>> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return readPublic<PublicWorkItemPageDto>(`${seg(identifier)}/items${qs}`)
}

/**
 * ONE LEVEL of the tree — the roots, or one parent's direct children.
 *
 * OFFSET-paged, not cursor-paged, and that is the endpoint's contract rather
 * than a choice here: a level is a stable sibling set, so the loaded count is
 * the next offset.
 */
export function loadTreeLevel(
  identifier: string,
  opts: { parentId?: string; offset?: number } = {},
): Promise<PublicRead<PublicTreeLevelDto>> {
  const params = new URLSearchParams()
  if (opts.parentId) params.set('parentId', opts.parentId)
  if (opts.offset) params.set('offset', String(opts.offset))
  const qs = params.toString()
  return readPublic<PublicTreeLevelDto>(
    `${seg(identifier)}/tree${qs ? `?${qs}` : ''}`,
  )
}

/** The whole ROADMAP — four columns, each with its first page. */
export function loadRoadmap(
  identifier: string,
): Promise<PublicRead<PublicRoadmapDto>> {
  return readPublic<PublicRoadmapDto>(`${seg(identifier)}/roadmap`)
}

/**
 * ONE roadmap column's next page.
 *
 * ⚠️ BOTH parameters or NEITHER. The endpoint serves the whole tab when neither
 * is present and refuses a half-specified request — a bucket with no cursor is
 * `MISSING_ROADMAP_CURSOR`, not "start from the top". That refusal is
 * deliberate (a pager that silently restarted would be far harder to notice),
 * so this function requires both and cannot produce the ambiguous call.
 */
export function loadRoadmapColumn(
  identifier: string,
  bucket: PublicRoadmapBucket,
  cursor: string,
): Promise<PublicRead<PublicRoadmapColumnDto>> {
  const qs = `?bucket=${encodeURIComponent(bucket)}&cursor=${encodeURIComponent(cursor)}`
  return readPublic<PublicRoadmapColumnDto>(`${seg(identifier)}/roadmap${qs}`)
}

/** The CHANGELOG — cursor-paged. */
export function loadChangelog(
  identifier: string,
  cursor?: string,
): Promise<PublicRead<PublicChangelogPageDto>> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return readPublic<PublicChangelogPageDto>(`${seg(identifier)}/changelog${qs}`)
}

/**
 * The href a no-JS pager points at: this tab's own path, carrying the cursor.
 *
 * ⚠️ PAGING IS A REAL URL, following `app/explore/_components/Gallery.tsx`. A
 * "Load more" that only works with JavaScript is a page a crawler cannot walk
 * and a reader cannot link to — and this whole surface exists to be crawled.
 */
export function pagedTabHref(
  host: PublicHost,
  identifier: string,
  segment: string,
  params: Record<string, string | undefined>,
): string {
  return publicPathWithQuery(host, identifier, segment, params)
}

/* ── the two DETAIL reads (MOTIR-4117) ────────────────────────────────────── */

export interface PublicWorkItemDetailParentDto {
  identifier: string
  key: number
  title: string
  kind: string
}

export interface PublicWorkItemDetailDto extends PublicWorkItemDto {
  statusLabel: string
  descriptionMd: string | null
  parent: PublicWorkItemDetailParentDto | null
  /** True only on a private epic seen by a non-member; the display signal. */
  childrenHidden: boolean
  childCount: number
  /** The FIRST page of public-safe direct children, not the whole set. */
  children: PublicTreeRowDto[]
  childrenHasMore: boolean
}

export interface PublicRequestCommentDto {
  id: string
  workItemId: string
  parentCommentId: string | null
  author: { id: string; name: string; image: string | null }
  bodyMd: string
  editedAt: string | null
  createdAt: string
  /** Always empty here — public-request comments carry no mention scoping. */
  mentionedUserIds: string[]
}

export interface PublicRequestDetailDto {
  id: string
  identifier: string
  key: number
  title: string
  kind: string
  status: string
  statusLabel: string
  statusCategory: 'todo' | 'in_progress' | 'done'
  descriptionMd: string | null
  openedByName: string
  createdAt: string
  voteCount: number
  /** Always false on this host — `actorUserId` is structurally null here. */
  voted: boolean
  comments: PublicRequestCommentDto[]
}

/**
 * ONE work item, as the public surface shows it.
 *
 * ⚠️ THE SECOND ARGUMENT IS THE FULL IDENTIFIER (`ACME-42`), not the bare
 * number. The URL segment is called `key` because that is the address the public
 * page has always used, and the `key` FIELD in the response is the number — two
 * different things with one name. The endpoint takes the identifier and this
 * passes the segment through verbatim; rebuilding `${identifier}-${key}` works
 * on every fixture anyone would write and breaks on a project key with a dash.
 */
export function loadWorkItem(
  identifier: string,
  key: string,
): Promise<PublicRead<PublicWorkItemDetailDto>> {
  return readPublic<PublicWorkItemDetailDto>(
    `${seg(identifier)}/items/${encodeURIComponent(key)}`,
  )
}

/** ONE feature request, with its public thread and its vote count. */
export function loadRequest(
  identifier: string,
  requestKey: string,
): Promise<PublicRead<PublicRequestDetailDto>> {
  return readPublic<PublicRequestDetailDto>(
    `${seg(identifier)}/requests/${encodeURIComponent(requestKey)}`,
  )
}

/* ── the ACT hand-off (AMENDMENT 4 §D) ────────────────────────────────────── */

/** The intents `app.motir.co/act` accepts. */
export type ActIntent = 'follow' | 'vote' | 'upvote' | 'comment' | 'request'

/**
 * The absolute URL of a hand-off to the application.
 *
 * ⚠️ A LINK, NEVER A `fetch`, and that is mechanical rather than stylistic:
 * `lib/auth/index.ts` sets the session cookie `sameSite: 'lax'`, so a
 * cross-origin request from this host carries no credential at all. There is
 * nothing to call. `public-surface-hosts.md` AMENDMENT 4 §B carries it.
 *
 * `returnPath` is a path on THIS SITE — `/p/<identifier>/<tab>` — and it stays
 * that shape on every host, which is why `ProjectHeader` builds it from
 * {@link SITE_HOST} rather than from the host the visitor is on. Two reasons,
 * and the first one alone settles it:
 *
 *   1. A host-relative path prefixed with `SITE_ORIGIN` is a URL that does not
 *      exist. On a customer domain the board is `/board`, and
 *      `motir.co/board` is a 404 — the hand-off would return every visitor on a
 *      customer domain to a dead page.
 *   2. `motir.co/p/<identifier>/<tab>` is a valid address for the project on
 *      every host, and MOTIR-4222 carries it on to the project's PRIMARY
 *      address with a 301. So the visitor lands on the canonical address rather
 *      than on whichever alternate they happened to start from, which is what
 *      ADR §7's one-primary rule wants of a round trip anyway.
 *
 * The application validates the resulting absolute URL against its configured
 * public addresses before redirecting to it (MOTIR-4218).
 */
export function actHref(
  intent: ActIntent,
  identifier: string,
  returnPath: string,
): string {
  const params = new URLSearchParams({
    intent,
    subject: identifier,
    return: `${SITE_ORIGIN_FOR_RETURN}${returnPath}`,
  })
  return `${APP_ORIGIN}/act?${params.toString()}`
}

/* ── the crawl index (MOTIR-4118) ─────────────────────────────────────────── */

export interface PublicProjectIndexEntryDto {
  identifier: string
  /** ISO 8601 — the sitemap's `<lastmod>`. */
  updatedAt: string
}

export interface PublicProjectIndexPageDto {
  projects: PublicProjectIndexEntryDto[]
  nextCursor: string | null
}

/** How many index pages the sitemap will walk before it stops. */
const INDEX_PAGE_LIMIT = 20

/**
 * EVERY public project, for the sitemap — walking the index endpoint's pages.
 *
 * ⚠️ IT IS BOUNDED, AND THE BOUND IS DELIBERATE. The endpoint pages because the
 * set's size is the customer count, and a sitemap generator that followed the
 * cursor for ever would turn one slow response into an unbounded request loop on
 * every crawl. Twenty pages is far past today's set; if it is ever reached, the
 * sitemap is short rather than hanging, and a short sitemap is recoverable.
 *
 * ⚠️ AND IT NEVER THROWS. A failed read returns what it has — the sitemap's
 * caller emits its static entries alongside. A sitemap that briefly loses its
 * project pages is recoverable; one that 500s is not, and search engines back
 * off a sitemap that errors.
 */
export async function loadAllPublicProjects(): Promise<{
  projects: PublicProjectIndexEntryDto[]
  complete: boolean
}> {
  const projects: PublicProjectIndexEntryDto[] = []
  let cursor: string | undefined

  for (let page = 0; page < INDEX_PAGE_LIMIT; page += 1) {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    const read = await readPublic<PublicProjectIndexPageDto>(`/projects${qs}`)
    if (read.status !== 'ok') return { projects, complete: false }

    projects.push(...read.data.projects)
    if (!read.data.nextCursor) return { projects, complete: true }
    cursor = read.data.nextCursor
  }

  return { projects, complete: false }
}
