import { copy } from '@/lib/copy'

/**
 * THE SURFACES `/docs` DOCUMENTS — one list, read by everything that draws them
 * (MOTIR-4507).
 *
 * ⚠️ WHY THIS MODULE EXISTS, AND IT IS NOT TIDINESS. The same fact — which
 * pages this area has — was written down twice: `SURFACES` inside
 * `app/docs/_components/DocsRail.tsx` and a hand-built `groups` array inside
 * `app/docs/(guides)/page.tsx`. MOTIR-4227 added `/docs/public-address`, put it
 * in the rail, and did not put it on the index; nothing failed, because neither
 * file knows the other exists. The page a reader lands on when they click
 * `Docs` — whose entire content is a list of what the area contains — was
 * silently missing the page a paying customer reaches for when they are
 * pointing a domain they own at something they bought.
 *
 * Adding one row would have left the TENTH page to arrive the same way. So the
 * list lives here, both renderers read it, and
 * `tests/docs/docsSurfaces.test.tsx` asserts the index links every route this
 * file names AND that this file names every route `app/docs` actually serves —
 * by walking, never by listing, because a literal list of nine is the same
 * defect one level up.
 *
 * ⚠️ PLAIN SERIALISABLE DATA, NO DIRECTIVE, NO SERVER-ONLY IMPORT. `DocsRail`
 * is a client component and the index is a server one, so this module is read
 * across the render boundary. Anything both sides need lives in its own
 * directive-free module and is imported from both; declaring it inside the
 * client component is what made a shared constant unreachable from the server
 * side in the first place, and re-exporting it back would move the boundary
 * rather than remove it. `lib/docs.ts` is deliberately NOT the home: it fetches
 * `motir-core`'s published artifacts and importing it from the rail would drag
 * that into the client bundle.
 *
 * ⚠️ THE INDEX IS ITS OWN CONSTANT, and that is the one asymmetry. `/docs` is a
 * ROW in the rail (a reader on `/docs/cli` needs a way back) and it is the PAGE
 * the others are listed on, so it is not a destination the index advertises to
 * itself.
 */

/** One page in the area: a rail row, and an index row where the index draws it. */
export interface DocsPage {
  /** The route, exactly as `app/docs` serves it. */
  href: string
  /** The rail row's label, and the index row's title. */
  label: string
  /** The one line the index prints under the title. */
  description: string
}

/** A surface: a page in tier 1, plus the pages tier 2 shows inside it. */
export interface DocsSurface extends DocsPage {
  /**
   * That surface's OWN pages. Rendered by the rail's second tier while the
   * reader is under this surface's route prefix, and by the index beneath the
   * surface's own row. Empty for a surface that is a single page.
   */
  pages: DocsPage[]
}

/**
 * The index itself — tier 1's first row on every page in the area, and the page
 * every surface below is listed on.
 */
export const DOCS_INDEX: Omit<DocsPage, 'description'> = {
  href: '/docs',
  label: copy.docs.indexTitle,
}

/**
 * The surfaces, in reading order. A page added to `app/docs` is added HERE, and
 * the rail, the index and the sitemap all draw it with no second edit.
 */
export const DOCS_SURFACES: DocsSurface[] = [
  {
    href: '/docs/api',
    label: copy.docs.api,
    description: copy.docs.descApi,
    pages: [
      {
        href: '/docs/api/getting-started',
        label: copy.docs.apiGettingStarted,
        description: copy.docs.descApiGettingStarted,
      },
      {
        href: '/docs/api/stability',
        label: copy.docs.apiStability,
        description: copy.docs.descApiStability,
      },
    ],
  },
  {
    href: '/docs/mcp',
    label: copy.docs.mcp,
    description: copy.docs.descMcp,
    pages: [
      {
        href: '/docs/mcp/tools',
        label: copy.docs.mcpTools,
        description: copy.docs.descMcpTools,
      },
    ],
  },
  {
    href: '/docs/cli',
    label: copy.docs.cli,
    description: copy.docs.descCli,
    pages: [],
  },
  {
    href: '/docs/sandbox',
    label: copy.docs.sandbox,
    description: copy.docs.descSandbox,
    pages: [],
  },
  {
    href: '/docs/public-address',
    label: copy.docs.publicAddress,
    description: copy.docs.descPublicAddress,
    pages: [],
  },
]

/**
 * Every route the area serves, in reading order, the index first — a surface
 * immediately followed by its own pages. The sitemap emits exactly this, and
 * the guard test measures it against the file system.
 */
export const DOCS_ROUTES: string[] = [
  DOCS_INDEX.href,
  ...DOCS_SURFACES.flatMap((surface) => [
    surface.href,
    ...surface.pages.map((page) => page.href),
  ]),
]
