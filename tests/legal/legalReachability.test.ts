// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getLegalDocument,
  legalDocumentSlugs,
  listLegalDocuments,
} from '@/lib/legal/documents'
import sitemap from '@/app/sitemap'

/**
 * REACHABILITY AND FRONT-MATTER PARITY (Story MOTIR-3909 · MOTIR-4011).
 *
 * ⚠️ THE PROPERTY THIS PROTECTS IS "A DOCUMENT SHIPS BY EXISTING". The loader
 * globs `content/legal/` rather than enumerating slugs, and that is not
 * tidiness: the source repository's own card was written for SIX documents,
 * `model-providers.md` was added days later, and a hardcoded list of six would
 * have shipped a subprocessor page linking to a 404 — disclosing LESS than it
 * did before. So the guard is over the REAL directory, and it is what makes a
 * new document a file drop rather than an edit in four places.
 *
 * ⚠️ AND IT IS DRIVEN THROUGH THE REAL LOADER, not a fixture of one hand-written
 * document. That is the seam a unit test mocks away and the one that actually
 * broke: a document added and a route table not updated. A fixture cannot fail
 * that way.
 */

const LEGAL_DIR = join(process.cwd(), 'content', 'legal')

/** The directory, read the way the routes read it — the population, not a list. */
function slugsOnDisk(): string[] {
  return readdirSync(LEGAL_DIR)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3))
    .sort()
}

describe('every document in the directory is REACHABLE', () => {
  it('is not vacuous — the directory has the published set in it', () => {
    // A guard over an empty directory passes on every assertion below, which is
    // how a totality test dies quietly. Seven is what ships today; `>=` makes an
    // eighth document growth rather than a red suite.
    expect(slugsOnDisk().length).toBeGreaterThanOrEqual(7)
  })

  it('the loader returns EXACTLY the directory — no list can drift from it', () => {
    expect(legalDocumentSlugs().sort()).toEqual(slugsOnDisk())
  })

  it.each(slugsOnDisk())(
    '/legal/%s resolves to a document the route can render',
    (slug) => {
      // `getLegalDocument` returning null is precisely what the page 404s on, so
      // a non-null result IS the 200-shaped precondition.
      const doc = getLegalDocument(slug)
      expect(
        doc,
        `${slug} is on disk but the loader does not resolve it`,
      ).not.toBeNull()
      expect(doc!.title, `${slug} has no title`).not.toBe('')
      expect(doc!.body.trim(), `${slug} rendered an empty body`).not.toBe('')
    },
  )

  it('the SITEMAP carries every document — a page nobody can find is not published', async () => {
    // The sitemap builds its legal entries from `legalDocumentSlugs()`, so this
    // asserts the composition rather than a copied list. Removing a document
    // from the sitemap's source makes it red.
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)
    for (const slug of slugsOnDisk()) {
      expect(
        urls.some((url) => url.endsWith(`/legal/${slug}`)),
        `/legal/${slug} is on disk but absent from the sitemap`,
      ).toBe(true)
    }
  })
})

describe('front-matter parity — the convention the materiality rule rides on', () => {
  // ⚠️ THIS INTENT MOVED HERE WITH THE DOCUMENTS. `motir-core`'s
  // `legalVersionGuard.test.ts` asserted it while the files lived there; they
  // are here now, and the guard could not follow them as-is because that
  // repository reads a configured manifest rather than these files. What it was
  // protecting is unchanged: `motir-core`'s `isMaterialChange` treats a version
  // it cannot parse as MATERIAL, which would hold every signed-in reader — so an
  // unparseable version published here has a consequence two repositories away.
  const documents = listLegalDocuments()

  it('has documents to check', () => {
    expect(documents.length).toBeGreaterThanOrEqual(7)
  })

  it.each(documents.map((doc) => [doc.slug, doc.version] as const))(
    '%s carries a version that parses as <major>.<minor>.<patch> — got %s',
    (_slug, version) => {
      expect(/^\d+\.\d+\.\d+$/.test(version)).toBe(true)
    },
  )

  it.each(documents.map((doc) => [doc.slug] as const))(
    '%s carries a title',
    (slug) => {
      expect(getLegalDocument(slug)!.title).not.toBe('')
    },
  )

  it('every document parses its front matter at all', () => {
    // A file whose front matter is unterminated parses as ALL BODY, which is
    // silent: the title falls back to the slug and the version is empty. So the
    // check is that no document looks like that.
    const unparsed = documents
      .filter((doc) => doc.version === '' || doc.title === doc.slug)
      .map((doc) => doc.slug)
    expect(unparsed).toEqual([])
  })

  it('no document leaks the TBD sentinel into a rendered field', () => {
    // `effectiveDate` is mapped to null; the guard is that the literal never
    // survives into something a page prints.
    for (const doc of documents) {
      expect(doc.effectiveDate).not.toBe('TBD')
      expect(doc.title).not.toContain('TBD')
    }
  })

  it('every file on disk OPENS and CLOSES its front-matter block near the top', () => {
    // ⚠️ THE CLOSING DELIMITER IS THE HALF THAT MATTERS, and it was found by
    // trying to break this guard. `splitFrontMatter` looks for the NEXT
    // `\n---\n` ANYWHERE in the file — so a document whose closing `---` is
    // missing does not fail: it finds a horizontal rule further down, swallows
    // the prose between into "front matter", and still yields a plausible title
    // and version. Asserting only that the file STARTS with `---` passes on
    // exactly that, which is what the first version of this test did. So the
    // block is required to CLOSE where a block closes.
    for (const slug of slugsOnDisk()) {
      const lines = readFileSync(join(LEGAL_DIR, `${slug}.md`), 'utf8').split(
        '\n',
      )
      expect(lines[0], `${slug}.md does not open a front-matter block`).toBe(
        '---',
      )
      const close = lines.slice(1, 12).indexOf('---')
      expect(
        close,
        `${slug}.md does not close its front-matter block in the first 12 lines`,
      ).not.toBe(-1)
    }
  })
})
