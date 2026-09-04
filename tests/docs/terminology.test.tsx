import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { APP_ORIGIN } from '@/lib/appOrigin'

/*
 * THE TERMINOLOGY SWEEP, ON THE RENDER (MOTIR-4508).
 *
 * ── The defect this exists for, which is a GREEN TEST rather than a red one ─
 * `/docs/sandbox` opened with "a container you start on your own machine,
 * holding a coding agent, the Motir CLI and your checkouts". `tests/copy.test.ts`
 * carries a case named *"never says 'coding agent' — agents do all kinds of
 * work"*, and it passed, because it walks `lib/copy` — the catalogue — and this
 * sentence was typed into `app/docs/(guides)/sandbox/page.tsx` as JSX prose.
 *
 * The catalogue was once the only place a rendered string could enter. It is not
 * any more: `lib/docs.ts`'s own carve-out makes the guide pages AUTHORED
 * documentation, so `/docs`, `/docs/cli`, `/docs/mcp`, `/docs/mcp/tools`,
 * `/docs/sandbox`, `/docs/public-address` and the three `/docs/api` pages all
 * render sentences no catalogue holds. A guard scoped to the wrong surface is
 * worse than no guard: it converts an open question into a settled one, and the
 * next person to wonder whether the terminology is enforced finds a passing test
 * with the right name and stops looking.
 *
 * ── Why it is not a second `grep` ───────────────────────────────────────────
 * The offending source line reads
 *
 *     A sandbox is a container you start on your own machine, holding a coding
 *     agent, the Motir CLI and your checkouts — and nothing else.
 *
 * so `grep -rn "coding agent" app/` returns NOTHING on the unfixed tree. JSX
 * wraps the phrase across two lines and joins it back with a single space when
 * it renders. That is the same trap MOTIR-4369 records about an acceptance
 * criterion that greps for a string JSX line-wraps. A source grep cannot be the
 * check, and `sourceGrepMissesIt` below asserts exactly that rather than
 * asserting it in a comment.
 *
 * ── Why it WALKS rather than lists ──────────────────────────────────────────
 * `tests/docs/pageMetadata.test.ts` found its pages instead of naming them for
 * this reason and this file follows it: a page added tomorrow is covered without
 * anybody remembering to add a case. The cost of the other shape is already
 * visible next door — `tests/docs/inlineSpacing.test.tsx` names seven routes and
 * the tree holds nine, so `/docs/mcp/tools` and `/docs/api` have never been
 * checked by it.
 *
 * ── What it does NOT reach, said plainly ────────────────────────────────────
 * It renders the PAGE, not the shell around it. The rail and the site chrome
 * read their strings out of `lib/copy`, which is the surface `tests/copy.test.ts`
 * already sweeps — so the two together cover the page and its frame, and neither
 * is a substitute for the other. This ADDS; it changes nothing in that file.
 */

/** The three predicates `tests/copy.test.ts` runs on the catalogue. */
const BANNED_TERMS: { label: string; pattern: RegExp }[] = [
  // Rendered "tracker" is banned outright; it survives only as a code
  // identifier (`?intent=tracker`, `scaled-tracker`, the Stripe price keys).
  { label: 'tracker', pattern: /\btrackers?\b/gi },
  // The unit of work is a "work item", never an "issue".
  { label: 'issue', pattern: /\bissues?\b/gi },
  // Motir's agents do design, decision, content, test and code work. Calling
  // the third pillar a "coding agent" sells a narrower product than the one
  // being built.
  { label: 'coding agent', pattern: /\bcoding agents?\b/gi },
]

/**
 * Every banned term in `text`, each with enough of its surroundings to find in
 * the source.
 *
 * ⚠️ WHITESPACE IS FLATTENED FIRST, and that is the whole mechanism. The
 * defect this file was written for is a phrase split across two source lines,
 * and `textContent` can carry that break through — so a detector that matched
 * the raw string would reproduce the very failure it exists to catch, one
 * surface further along.
 */
export function bannedTerms(text: string): string[] {
  const flat = text.replace(/\s+/g, ' ')
  return BANNED_TERMS.flatMap(({ label, pattern }) =>
    [...flat.matchAll(pattern)].map((match) => {
      const at = match.index ?? 0
      const from = Math.max(0, at - 60)
      const to = at + match[0].length + 40
      return `${label} — …${flat.slice(from, to).trim()}…`
    }),
  )
}

/** What a source `grep` for the phrase would have found. */
export function sourceGrepMissesIt(source: string): boolean {
  return !/coding agent/i.test(source)
}

/**
 * The same page read a second way, with every ELEMENT boundary spaced out.
 *
 * ⚠️ WHY BOTH READINGS ARE SWEPT. `textContent` concatenates across elements
 * with no separator, so `…a coding agent</strong>1 tool…` flattens to
 * `coding agent1`, where `\bagents?\b` correctly does not match — a violation
 * hidden by the element after it. That is not hypothetical on these pages:
 * words running into the element beside them is the exact defect MOTIR-4429
 * shipped seven of, and `tests/docs/inlineSpacing.test.tsx` exists for it.
 * Reading the markup with tags replaced by a space closes it, and cannot
 * invent a hit — separating text can only ever break a match, never make one.
 */
export function spacedText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ')
}

const DOCS_ROOT = join(process.cwd(), 'app', 'docs')

/** Every `page.tsx` under `app/docs`, found rather than listed. */
function docsPages(dir: string = DOCS_ROOT): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return docsPages(full)
    return entry === 'page.tsx' ? [full] : []
  })
}

/** `app/docs/(guides)/sandbox/page.tsx` → `/docs/sandbox`. Route groups add no segment. */
function routeOf(file: string): string {
  const segments = relative(join(process.cwd(), 'app'), file)
    .split(sep)
    .slice(0, -1)
    .filter((segment) => !/^\(.*\)$/.test(segment))
  return `/${segments.join('/')}`
}

/*
 * ── The documents the async pages fetch ────────────────────────────────────
 * Five of the nine pages are Server Components that read one of motir-core's
 * three published artifacts through `lib/docs.ts`. The stub below is keyed on
 * the URL rather than on the page, so a NEW page reusing any of these fetchers
 * is served without this file being touched — the same reason the walk exists.
 *
 * ⚠️ EVERY FIXTURE IS INVENTED AND DELIBERATELY NEUTRAL. It is served as the
 * page's data and lands in the text this file then asserts over, so a fixture
 * carrying one of the banned words would fail these pages for a sentence
 * nobody in this repository wrote. The `zq` prefix is the convention
 * `tests/docs/inlineSpacing.test.tsx` already uses for the same reason.
 */
const specFixture = {
  openapi: '3.1.0',
  info: { title: 'Motir API', version: '9.9.9' },
  paths: {
    '/api/public/zqthings': {
      get: { operationId: 'listZqthings', summary: 'List the zqthings.' },
    },
  },
}

const catalogueFixture = {
  endpoint: '/api/mcp',
  toolCount: 1,
  groups: [
    {
      permission: 'zqthing:browse',
      label: 'Browse zqthings',
      gates: 'Read zqthings and their detail.',
      grantedByDefault: true,
      tools: [
        { name: 'zqAlpha', permission: 'zqthing:browse', summary: 'Read one.' },
      ],
    },
  ],
}

const cliFixture = {
  packageName: '@zq/cli-fixture',
  packageVersion: '9.9.9',
  installCommand: 'npm install -g @zq/cli-fixture',
  nodeRequirement: '>=22',
  defaultServer: 'https://zq-fixture.test',
  commandCount: 1,
  commands: [
    {
      path: 'zqlogin',
      signature: '',
      invocation: 'motir zqlogin',
      description: 'Connect this terminal.',
      helpGroup: 'SETUP COMMANDS:',
      options: [],
    },
  ],
}

const DOCUMENTS = new Map<string, unknown>([
  [`${APP_ORIGIN}/api/openapi/v1.json`, specFixture],
  [`${APP_ORIGIN}/api/docs/mcp-tools.json`, catalogueFixture],
  [`${APP_ORIGIN}/api/docs/cli-commands.json`, cliFixture],
])

/*
 * ⚠️ TWO LEDGERS, AND THEY ARE WHY THE WALK IS NOT VACUOUS. Every async page
 * here CATCHES its fetch and renders a short "temporarily unreachable" arm
 * instead — so a page this file fails to feed does not go red, it renders three
 * sentences that contain none of the banned words and the walk stays green
 * while checking nothing.
 *
 * `unserved` catches the first way that happens: a page fetches a URL no
 * fixture answers. The red check then names the URL to add.
 *
 * `served` catches the second, which no list of URLs can: the URL is known and
 * the FIXTURE has gone stale, so the parse throws and the page degrades anyway.
 * Whenever a page fetched at all, the walk re-renders it with every fetch
 * failing and requires the two renders to DIFFER — which proves the served
 * document actually reached the page, and needs no threshold to say so. A
 * length floor was tried first and is the wrong instrument: it is a guess about
 * how much prose a page owes, and `/docs/api` renders 519 characters from a
 * one-operation fixture perfectly correctly.
 */
let unserved: string[] = []
let served: string[] = []

function stubFetch() {
  unserved = []
  served = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const url = String(input)
      const document = DOCUMENTS.get(url)
      if (document === undefined) {
        unserved.push(url)
        throw new Error(`no fixture for ${url}`)
      }
      served.push(url)
      return new Response(JSON.stringify(document), { status: 200 })
    }),
  )
}

/** Every fetch fails — the state each async page's fallback arm renders for. */
function stubUnreachable() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('unreachable')
    }),
  )
}

async function renderRoute(
  load: () => Promise<PageModule>,
): Promise<{ text: string; spaced: string }> {
  const Page = (await load()).default
  const { container } = render((await Page()) as React.ReactElement)
  return {
    text: container.textContent ?? '',
    spaced: spacedText(container.innerHTML),
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/*
 * The loader. The file-system walk above is the ONE census — these are the
 * files it found, imported by path — so there is no second list that could
 * disagree with it.
 *
 * (`import.meta.glob` was the first shape and is not used: typing it needs
 * `vite/client`, which is not resolvable here because Vite is a transitive
 * dependency of Vitest rather than a declared one, and adding a dependency to
 * type a test is a worse trade than importing by path.)
 */
type PageModule = { default: () => unknown }

function loaderFor(file: string): () => Promise<PageModule> {
  return () => import(/* @vite-ignore */ pathToFileURL(file).href)
}

describe('the terminology detector', () => {
  it('FIRES on the sentence that shipped, across the line break JSX wraps it at', () => {
    // Verbatim from `app/docs/(guides)/sandbox/page.tsx` at `3ca037b`,
    // including the source indentation that broke the phrase in two.
    const shipped =
      'A sandbox is a container you start on your own machine, holding a coding\n' +
      '        agent, the Motir CLI and your checkouts — and nothing else.'

    const found = bannedTerms(shipped)
    expect(found).toHaveLength(1)
    expect(found[0]).toContain('coding agent')
  })

  it('is the only mechanism that could have — a source grep misses that line', () => {
    // The card's third criterion, asserted rather than asserted-in-prose.
    const shipped =
      'A sandbox is a container you start on your own machine, holding a coding\n' +
      '        agent, the Motir CLI and your checkouts — and nothing else.'
    expect(sourceGrepMissesIt(shipped)).toBe(true)
  })

  it('FIRES on the other two words as well', () => {
    expect(bannedTerms('Motir is not a tracker.')[0]).toContain('tracker')
    expect(bannedTerms('Close the issue when it merges.')[0]).toContain('issue')
    expect(bannedTerms('Two issues and three trackers.')).toHaveLength(2)
  })

  it('permits the words that merely CONTAIN them', () => {
    // `\b` is doing this work; the cases are here so a later widening of the
    // pattern cannot silently start failing ordinary prose.
    expect(
      bannedTerms(
        'The issuer reissues a token; tracking a run; an agent that codes.',
      ),
    ).toEqual([])
  })

  it('SEES a phrase the element after it runs into, once the tags are spaced', () => {
    /*
     * The blind spot `spacedText` closes, measured rather than asserted. On a
     * heading immediately followed by a count, `textContent` yields
     * `coding agent1 tools` — and `\bagents?\b` is right not to match that,
     * which is why the fix is a second READING rather than a looser pattern.
     */
    const html = '<h1>MCP tools for your coding agent</h1><p>1 tools at …</p>'
    const asTextContent = 'MCP tools for your coding agent1 tools at …'

    expect(bannedTerms(asTextContent)).toEqual([])
    expect(bannedTerms(spacedText(html))[0]).toContain('coding agent')
  })
})

const PAGES = docsPages()

describe('every /docs page is found, not named', () => {
  it('the walk finds them — a walk that returns nothing passes vacuously', () => {
    /*
     * The same floor `tests/docs/pageMetadata.test.ts` puts under its own walk,
     * and it is the reason this file can be trusted to have checked anything: a
     * `readdirSync` that quietly returned an empty list would make every case
     * below disappear rather than fail.
     *
     * ⚠️ IT IS A FLOOR AND NOT THE ROUTE LIST, deliberately. Pinning the nine
     * routes here would read as a stronger check and would defeat the point —
     * adding a page would turn this red and the covered set would go back to
     * being a list somebody maintains. The readable inventory is the run output
     * itself: each route below is its own named case.
     */
    expect(PAGES.length).toBeGreaterThanOrEqual(9)
    expect(PAGES.map(routeOf)).toContain('/docs/sandbox')
  })
})

describe('no /docs page RENDERS a banned term', () => {
  for (const file of PAGES) {
    const route = routeOf(file)
    const load = loaderFor(file)

    it(`${route}`, async () => {
      stubFetch()
      const { text, spaced } = await renderRoute(load)

      // Prove the page got its data BEFORE reading its text — see the two
      // ledgers above. A degraded render passes the banned-term check for free.
      expect(unserved).toEqual([])
      if (served.length > 0) {
        stubUnreachable()
        expect(text).not.toBe((await renderRoute(load)).text)
      }

      // The criterion's reading, and then the same page with its element
      // boundaries spaced out — see `spacedText`.
      expect(bannedTerms(text)).toEqual([])
      expect(bannedTerms(spaced)).toEqual([])
    })
  }
})
