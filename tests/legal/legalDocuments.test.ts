import { describe, expect, it } from 'vitest'
import {
  byPreferredOrder,
  getLegalDocument,
  legalDocumentSlugs,
  listLegalDocuments,
  parseLegalDocument,
} from '@/lib/legal/documents'

/**
 * The legal-document loader (MOTIR-4009) — a PORT of motir-core's
 * `tests/legal/legalDocuments.test.ts`, travelling with the parser it tests.
 *
 * Two halves, deliberately. `parseLegalDocument` is PURE, so every branch is
 * reachable from a string and the edge cases are tested exhaustively there.
 * The filesystem half is tested against the REAL `content/legal/` directory,
 * because the property that matters about it — "every published document has a
 * route" — is a claim about the actual tree and is worthless against a fixture.
 */

describe('parseLegalDocument', () => {
  const full = [
    '---',
    'title: Terms of Service',
    'version: 1.2.0',
    'effectiveDate: 2026-09-01',
    'status: approved',
    '---',
    '',
    '# Terms',
    'body text',
  ].join('\n')

  it('reads the front-matter keys and strips them from the body', () => {
    const doc = parseLegalDocument('terms', full)
    expect(doc).toMatchObject({
      slug: 'terms',
      title: 'Terms of Service',
      version: '1.2.0',
      effectiveDate: '2026-09-01',
      status: 'approved',
    })
    expect(doc.body).toBe('\n# Terms\nbody text')
    expect(doc.body).not.toContain('title:')
  })

  it('reads changeSummary when present, and reports its absence as null', () => {
    const withSummary = parseLegalDocument(
      'terms',
      [
        '---',
        'title: T',
        'version: 2.0.0',
        'changeSummary: Adds the hosted agent.',
        '---',
        '',
      ].join('\n'),
    )
    expect(withSummary.changeSummary).toBe('Adds the hosted agent.')

    expect(parseLegalDocument('terms', full).changeSummary).toBeNull()
    expect(
      parseLegalDocument(
        'terms',
        ['---', 'changeSummary:', '---', ''].join('\n'),
      ).changeSummary,
    ).toBeNull()
  })

  it('maps the TBD sentinel to null rather than passing it through', () => {
    const doc = parseLegalDocument('privacy', full.replace('2026-09-01', 'TBD'))
    expect(doc.effectiveDate).toBeNull()
    expect(JSON.stringify(doc)).not.toContain('TBD')
  })

  it('maps an absent or empty effectiveDate to null too', () => {
    expect(
      parseLegalDocument('x', '---\ntitle: X\n---\nbody').effectiveDate,
    ).toBeNull()
    expect(
      parseLegalDocument(
        'x',
        full.replace('effectiveDate: 2026-09-01', 'effectiveDate:'),
      ).effectiveDate,
    ).toBeNull()
  })

  it('falls back to the slug when there is no title, rather than an empty heading', () => {
    expect(
      parseLegalDocument('cookies', '---\nversion: 1.0.0\n---\nbody').title,
    ).toBe('cookies')
    expect(parseLegalDocument('cookies', '---\ntitle:\n---\nbody').title).toBe(
      'cookies',
    )
  })

  it('treats a file with no front matter as all body', () => {
    expect(parseLegalDocument('raw', '# Just a heading')).toMatchObject({
      title: 'raw',
      version: '',
      status: '',
      effectiveDate: null,
      body: '# Just a heading',
    })
  })

  it('treats an UNTERMINATED front-matter block as all body', () => {
    const doc = parseLegalDocument(
      'broken',
      '---\ntitle: Broken\nno closing fence',
    )
    expect(doc.title).toBe('broken')
    expect(doc.body).toContain('title: Broken')
  })

  it('ignores a front-matter line with no colon instead of throwing', () => {
    expect(
      parseLegalDocument('x', '---\ntitle: X\ngarbage line\nversion: 2\n---\nb')
        .version,
    ).toBe('2')
  })

  it('keeps a colon inside a value', () => {
    expect(
      parseLegalDocument('x', '---\ntitle: Motir: the terms\n---\nb').title,
    ).toBe('Motir: the terms')
  })
})

describe('byPreferredOrder', () => {
  const order = (...slugs: string[]) =>
    slugs
      .map((slug) => ({ slug }))
      .sort(byPreferredOrder)
      .map((d) => d.slug)

  it('puts known documents in the curated order, not alphabetically', () => {
    expect(order('subprocessors', 'terms', 'dpa', 'privacy')).toEqual([
      'terms',
      'privacy',
      'dpa',
      'subprocessors',
    ])
  })

  it('sorts an UNKNOWN document after every known one, and never drops it', () => {
    expect(order('zzz-new-policy', 'terms')).toEqual([
      'terms',
      'zzz-new-policy',
    ])
    expect(order('terms', 'aaa-new-policy')).toEqual([
      'terms',
      'aaa-new-policy',
    ])
  })

  it('sorts two unknown documents alphabetically between themselves', () => {
    expect(order('zebra', 'aardvark')).toEqual(['aardvark', 'zebra'])
  })
})

describe('the published legal set', () => {
  const docs = listLegalDocuments()

  it('is not vacuous, and every document carries a title and a version', () => {
    expect(docs.length).toBeGreaterThanOrEqual(6)
    for (const doc of docs) {
      expect(doc.title, `${doc.slug} has no title`).not.toBe(doc.slug)
      expect(doc.version, `${doc.slug} has no version`).not.toBe('')
      expect(doc.body.trim().length).toBeGreaterThan(0)
    }
  })

  it('routes every document — slugs and documents cannot disagree', () => {
    expect(legalDocumentSlugs()).toEqual(docs.map((d) => d.slug))
  })

  it('renders NO placeholder token on any page', () => {
    for (const doc of docs) {
      expect(doc.body, `${doc.slug} still carries a placeholder`).not.toMatch(
        /«REGISTERED ADDRESS»|«KVK NUMBER»/,
      )
    }
  })

  it('puts the known documents in preferred order and unknown ones after', () => {
    const known = docs
      .map((d) => d.slug)
      .filter((s) => s === 'terms' || s === 'privacy')
    expect(known).toEqual(['terms', 'privacy'])
  })

  it('resolves a real slug and refuses an unknown one', () => {
    expect(getLegalDocument('terms')?.slug).toBe('terms')
    expect(getLegalDocument('not-a-document')).toBeNull()
  })

  it('refuses a path-traversal slug rather than reading the file', () => {
    expect(getLegalDocument('../../package')).toBeNull()
    expect(getLegalDocument('../../../etc/passwd')).toBeNull()
  })
})
