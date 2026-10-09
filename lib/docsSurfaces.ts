import type { Copy } from '@/lib/copy'

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

export const DOCS_INDEX_HREF = '/docs'

/**
 * The index itself — tier 1's first row on every page in the area, and the page
 * every surface below is listed on.
 */
export function docsIndexFor(copy: Copy): Omit<DocsPage, 'description'> {
  return { href: DOCS_INDEX_HREF, label: copy.docs.indexTitle }
}

/**
 * The surfaces, in reading order. A page added to `app/docs` is added HERE, and
 * the rail, the index and the sitemap all draw it with no second edit.
 */
/*
 * ⚠️ CATALOGUE KEYS, NOT WORDS (MOTIR-7950). The list used to hold the English
 * strings themselves, read when the module loaded — which no locale can reach,
 * so the rail and the index would have stayed English on every page. It holds
 * the `docs` keys instead, and `docsSurfacesFor(copy)` reads them from the
 * caller's catalogue. The ROUTES need no words and stay a constant.
 */
// The string-valued keys: `notes` is a nested object (the document notes, MOTIR-8032).
type DocsKey = Exclude<keyof Copy['docs'], 'notes'>
type PageKeys = { href: string; label: DocsKey; description: DocsKey }
type SurfaceKeys = PageKeys & { pages: PageKeys[] }

const SURFACES: SurfaceKeys[] = [
  {
    href: '/docs/api',
    label: 'api',
    description: 'descApi',
    pages: [
      {
        href: '/docs/api/getting-started',
        label: 'apiGettingStarted',
        description: 'descApiGettingStarted',
      },
      {
        href: '/docs/api/stability',
        label: 'apiStability',
        description: 'descApiStability',
      },
    ],
  },
  {
    href: '/docs/mcp',
    label: 'mcp',
    description: 'descMcp',
    pages: [
      {
        href: '/docs/mcp/tools',
        label: 'mcpTools',
        description: 'descMcpTools',
      },
    ],
  },
  {
    href: '/docs/cli',
    label: 'cli',
    description: 'descCli',
    pages: [],
  },
  {
    href: '/docs/sandbox',
    label: 'sandbox',
    description: 'descSandbox',
    pages: [],
  },
  {
    href: '/docs/public-address',
    label: 'publicAddress',
    description: 'descPublicAddress',
    pages: [],
  },
  {
    href: '/docs/sentry',
    label: 'sentry',
    description: 'descSentry',
    pages: [],
  },
  {
    href: '/docs/difficulty',
    label: 'difficulty',
    description: 'descDifficulty',
    pages: [],
  },
  {
    href: '/docs/skills',
    label: 'skills',
    description: 'descSkills',
    pages: [],
  },
  {
    href: '/docs/claude-code-plugin',
    label: 'claudeCodePlugin',
    description: 'descClaudeCodePlugin',
    pages: [],
  },
  {
    href: '/docs/claude-code-connector',
    label: 'claudeCodeConnector',
    description: 'descClaudeCodeConnector',
    pages: [],
  },
]

/** The surfaces in the caller's catalogue — what the rail and the index draw. */
export function docsSurfacesFor(copy: Copy): DocsSurface[] {
  const page = ({ href, label, description }: PageKeys): DocsPage => ({
    href,
    label: copy.docs[label],
    description: copy.docs[description],
  })
  return SURFACES.map((surface) => ({
    ...page(surface),
    pages: surface.pages.map(page),
  }))
}

/**
 * Every route the area serves, in reading order, the index first — a surface
 * immediately followed by its own pages. The sitemap emits exactly this, and
 * the guard test measures it against the file system.
 */
export const DOCS_ROUTES: string[] = [
  DOCS_INDEX_HREF,
  ...SURFACES.flatMap((surface) => [
    surface.href,
    ...surface.pages.map((page) => page.href),
  ]),
]

/**
 * Routes whose human text is entirely catalogue copy (`copy.*`) and which therefore
 * have NO per-language document (MOTIR-8054). It ships empty: each move item adds
 * a route here only after verifying the route has no authored prose, and the
 * coverage gate exempts exactly these from "every route has a document per
 * locale". Directive-free, so a client component may import it.
 */
export const DOCS_CATALOGUE_ONLY_ROUTES: string[] = []
