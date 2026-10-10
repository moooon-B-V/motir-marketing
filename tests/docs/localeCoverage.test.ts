import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LOCALES, type Locale } from '@/i18n/routing'
import { getCopy } from '@/lib/copy'
import {
  documentInvariants,
  listSlugs,
  parseDocumentFile,
  recordRevision,
  resolveDocsDocument,
  type DocumentInvariants,
} from '@/lib/docsDocuments'
import { DOCS_CATALOGUE_ONLY_ROUTES, DOCS_ROUTES } from '@/lib/docsSurfaces'
import {
  docsPages,
  fallbackProblems,
  firstDifference,
  pageFileOf,
  renderDocsRoute,
  routeOf,
  slugOf,
  stubDocsFetch,
} from '@/tests/helpers/docsRoutes'
import { setDocsRootOverride } from '@/tests/helpers/docsRootOverride'

// Case 18 renders the shipped page over a temporary copy of `content/docs/`.
vi.mock('@/lib/docsDocuments', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/docsDocuments')>()
  const { docsRootOverride } = await import('@/tests/helpers/docsRootOverride')
  return {
    ...real,
    resolveDocsDocument: (slug: string, locale: never, root?: string) =>
      real.resolveDocsDocument(slug, locale, root ?? docsRootOverride()),
  }
})

/*
 * THE /docs DOCUMENT POPULATION, ONE PER ROUTE PER LANGUAGE (MOTIR-8051,
 * cases 1–5 and 18) — the shipped files, measured, not the mechanism on invented
 * ones (`docsDocuments.test.ts` and `docsRevisions.test.ts` own that).
 *
 * Locales come from `LOCALES` and routes from `DOCS_ROUTES`, so an added
 * locale or page is covered with no edit here.
 *
 * ⚠️ STALENESS IS A STATE, NOT A FAILURE (case 4). A translation made from an
 * older English revision shows the English under the "being updated" note;
 * that is the designed behaviour of editing an `en.md`, so the run REPORTS the
 * pairs and stays green. What fails is what no editing can excuse: a file that
 * does not exist, or a `source` the ledger never held.
 */

const OTHER_LOCALES = LOCALES.filter((locale) => locale !== 'en')
const DOCUMENT_ROUTES = DOCS_ROUTES.filter(
  (route) => !DOCS_CATALOGUE_ONLY_ROUTES.includes(route),
)
const slugs = (routes: string[]) => routes.map((route) => slugOf(route)!)

const contentFile = (slug: string, locale: Locale) =>
  join('content', 'docs', slug, `${locale}.md`)

afterEach(() => {
  setDocsRootOverride(undefined)
  vi.unstubAllGlobals()
})

describe('the route census (case 1)', () => {
  const walked = docsPages().map(routeOf)

  it('walks pages at all — a census of nothing proves nothing', () => {
    expect(walked.length).toBeGreaterThanOrEqual(9)
    expect(DOCS_ROUTES.length).toBeGreaterThanOrEqual(9)
  })

  it('DOCS_ROUTES is exactly the routes app/[locale]/docs serves', () => {
    expect(
      DOCS_ROUTES.filter((route) => !walked.includes(route)),
      'in DOCS_ROUTES with no page',
    ).toEqual([])
    expect(
      walked.filter((route) => !DOCS_ROUTES.includes(route)),
      'a page missing from DOCS_ROUTES (lib/docsSurfaces.ts)',
    ).toEqual([])
  })
})

describe('a document exists for every route in every language (case 2)', () => {
  it('has routes to check', () => {
    expect(DOCUMENT_ROUTES.length).toBeGreaterThanOrEqual(8)
  })

  it('fails on any route with no English source or no translation, naming slug and locale', () => {
    const missing = slugs(DOCUMENT_ROUTES).flatMap((slug) =>
      LOCALES.filter((locale) => !existsSync(contentFile(slug, locale))).map(
        (locale) =>
          `${slug} has no ${locale}.md (${contentFile(slug, locale)})`,
      ),
    )
    expect(missing).toEqual([])
  })

  it('the tree holds no document for a route that is not one', () => {
    expect(listSlugs().sort()).toEqual(slugs(DOCUMENT_ROUTES).sort())
  })
})

describe('the catalogue-only routes have no authored prose (case 3)', () => {
  const noEnglish = DOCS_ROUTES.filter(
    (route) => !existsSync(contentFile(slugOf(route) ?? '', 'en')),
  )

  it('is exactly the routes with no en.md', () => {
    expect([...DOCS_CATALOGUE_ONLY_ROUTES].sort()).toEqual(
      [...noEnglish].sort(),
    )
    expect(DOCS_CATALOGUE_ONLY_ROUTES.length).toBeGreaterThan(0)
  })

  it.each(DOCS_CATALOGUE_ONLY_ROUTES)(
    '%s renders no sentence of any en.md',
    async (route) => {
      stubDocsFetch()
      const page = await renderDocsRoute(pageFileOf(route), 'en')
      const rendered = page.text.replace(/\s+/g, ' ')
      page.unmount()

      const authored = slugs(DOCUMENT_ROUTES).flatMap((slug) =>
        sentencesOf(readFileSync(contentFile(slug, 'en'), 'utf8')),
      )
      expect(authored.length).toBeGreaterThan(100)
      expect(
        authored.filter((sentence) => rendered.includes(sentence)),
      ).toEqual([])
    },
  )
})

/** The prose sentences (five words or more, no marker) of a document, markup removed. */
function sentencesOf(markdown: string): string[] {
  return markdown
    .split('\n')
    .filter((line) => !/^\s*(\{\{|\||#)/.test(line))
    .flatMap((line) =>
      line
        .replace(/^\s*(?:[-*>]|\d+\.)\s+/, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[*_`]/g, '')
        .split(/(?<=[.!?])\s+/),
    )
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter(
      (sentence) => !sentence.includes('{{') && sentence.split(' ').length >= 5,
    )
}

describe('staleness is reported, never failed (case 4)', () => {
  const stale: string[] = []

  it('every translation resolves to its own or to a stale English — never missing, never a throw', () => {
    const problems: string[] = []
    for (const slug of slugs(DOCUMENT_ROUTES)) {
      for (const locale of OTHER_LOCALES) {
        try {
          const { fallback } = resolveDocsDocument(slug, locale)
          if (fallback === 'stale') stale.push(`${locale}: ${slug}`)
          else if (fallback !== null)
            problems.push(`${slug}/${locale}: fallback "${fallback}"`)
        } catch (error) {
          // An unknown revision is `docs:revisions check`'s failure; here too.
          problems.push(`${slug}/${locale}: ${(error as Error).message}`)
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('prints the stale pairs per locale', () => {
    const report = OTHER_LOCALES.map((locale) => {
      const pages = stale
        .filter((entry) => entry.startsWith(`${locale}: `))
        .map((entry) => entry.slice(locale.length + 2))
      return `  ${locale}  ${pages.length === 0 ? 'current' : `STALE ${pages.join(', ')}`}`
    }).join('\n')
    console.info(`/docs translations against the English ledger:\n${report}`)
    // The report is the output; this only proves it covered every locale.
    expect(report.split('\n')).toHaveLength(OTHER_LOCALES.length)
  })
})

function invariantsOf(slug: string, locale: Locale): DocumentInvariants {
  const file = contentFile(slug, locale)
  return documentInvariants(
    parseDocumentFile(readFileSync(file, 'utf8'), file).body,
  )
}

describe('a translation keeps what must stay identical (case 5)', () => {
  it('firstDifference names the first index, and a length difference counts', () => {
    expect(firstDifference(['a', 'b'], ['a', 'b'])).toBe(-1)
    expect(firstDifference(['a', 'b'], ['a', 'c'])).toBe(1)
    expect(firstDifference(['a'], ['a', 'b'])).toBe(1)
  })

  for (const slug of slugs(DOCUMENT_ROUTES)) {
    it.each(OTHER_LOCALES)(
      `${slug} [%s] matches the English invariants`,
      (locale) => {
        const english = invariantsOf(slug, 'en')
        const translated = invariantsOf(slug, locale)
        const differences = (
          Object.keys(english) as (keyof DocumentInvariants)[]
        ).flatMap((field) => {
          const at = firstDifference(english[field], translated[field])
          return at === -1
            ? []
            : [
                `${slug}/${locale}.md ${field} differs at index ${at}: en ${JSON.stringify(english[field][at])} vs ${locale} ${JSON.stringify(translated[field][at])}`,
              ]
        })
        expect(differences).toEqual([])
      },
    )
  }
})

describe('the stale path works on the shipped documents (case 18)', () => {
  function staleRoot(): { root: string; edited: string } {
    const root = mkdtempSync(join(tmpdir(), 'docs-stale-'))
    cpSync('content/docs', root, { recursive: true })
    const file = join(root, 'sandbox', 'en.md')
    const lines = readFileSync(file, 'utf8').split('\n')
    const at = lines.findIndex((line) => /^[A-Z][^#{|>*`-].*\.$/.test(line))
    expect(at).toBeGreaterThan(-1)
    const edited = 'This paragraph was edited after the translations were made.'
    lines[at] = `${lines[at]} ${edited}`
    writeFileSync(file, lines.join('\n'))
    // The ledger's `record`, against the temporary tree.
    expect(recordRevision('sandbox', root).recorded).toBe(true)
    return { root, edited }
  }

  it('resolves German stale for the edited page and every other page current', () => {
    const { root } = staleRoot()
    expect(resolveDocsDocument('sandbox', 'de', root).fallback).toBe('stale')
    expect(resolveDocsDocument('sandbox', 'de', root).shownLocale).toBe('en')
    for (const slug of slugs(DOCUMENT_ROUTES).filter((s) => s !== 'sandbox')) {
      expect(resolveDocsDocument(slug, 'de', root).fallback, slug).toBeNull()
    }
  })

  it('renders /de/docs/sandbox as the German note above an English body marked lang="en"', async () => {
    const { root, edited } = staleRoot()
    setDocsRootOverride(root)
    stubDocsFetch()
    const page = await renderDocsRoute(pageFileOf('/docs/sandbox'), 'de')
    const note = page.container.querySelector('[role="note"]')
    const english = page.container.querySelector('[lang="en"]')
    expect(note?.textContent).toBe(
      (await getCopy('de')).docs.notes.beingUpdated,
    )
    expect(note?.textContent).not.toBe(
      (await getCopy('en')).docs.notes.beingUpdated,
    )
    expect(english, 'an English region').not.toBeNull()
    expect(english?.textContent).toContain(edited)
    // Note above, English beneath, nothing in German outside the note.
    expect(
      fallbackProblems(
        page.container,
        (await getCopy('de')).docs.notes.beingUpdated,
      ),
    ).toEqual([])
    page.unmount()
  })
})
