import { APP_ORIGIN } from '@/lib/appOrigin'

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

/** The site-relative path of one tab. */
export function projectTabHref(identifier: string, segment: string): string {
  const base = `/p/${encodeURIComponent(identifier)}`
  return segment ? `${base}/${segment}` : base
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
