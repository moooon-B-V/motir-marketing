import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { createElement } from 'react'
import { DocsDocument } from '@/app/[locale]/docs/_components/DocsDocument'
import {
  checkDocsTree,
  DocsDocumentError,
  documentInvariants,
  formatDocsDate,
  parseDocumentFile,
  readLedger,
  recordRevision,
  resolveDocsDocument,
  revisionOf,
  splitSlots,
  validateBody,
} from '@/lib/docsDocuments'

/*
 * MOTIR-8032 — the per-language /docs document form, proved on FIXTURES
 * (`tests/docs/fixtures/documents/`). No real /docs page renders through it yet;
 * `docsRevisions.test.ts` is the guard over the real tree.
 */

const GOOD = join(process.cwd(), 'tests/docs/fixtures/documents/good')
const BAD = join(process.cwd(), 'tests/docs/fixtures/documents/bad')
const [R1, R2] = readLedger('sample', GOOD).map((e) => e.revision) as [
  string,
  string,
]

const values = {
  tag: 'v9.9.9',
  site: 'https://example.test/guide',
  file: 'motir.config.json',
}
const slots = {
  install: createElement('pre', { 'data-testid': 'slot' }, 'npm i -g motir'),
}

async function html(
  locale: 'en' | 'de' | 'fr' | 'ja',
  root = GOOD,
  v = values,
) {
  const ui = await DocsDocument({
    slug: 'sample',
    locale,
    slots,
    values: v,
    root,
  })
  return render(ui).container
}

describe('resolveDocsDocument — the four outcomes and the throw', () => {
  it('en → en.md, no fallback', () => {
    const r = resolveDocsDocument('sample', 'en', GOOD)
    expect(r.fallback).toBeNull()
    expect(r.shownLocale).toBe('en')
    expect(r.document.file).toMatch(/sample\/en\.md$/)
    expect(r.document.source).toBeUndefined()
  })

  it("a translation made from the ledger's last revision is shown", () => {
    const r = resolveDocsDocument('sample', 'de', GOOD)
    expect(r.fallback).toBeNull()
    expect(r.shownLocale).toBe('de')
    expect(r.document.source).toBe(R2)
    expect(r.document.markdown).toContain('Beispielseite')
  })

  it('a translation made from an older revision falls back to en.md as stale', () => {
    const r = resolveDocsDocument('sample', 'fr', GOOD)
    expect(r).toMatchObject({ fallback: 'stale', shownLocale: 'en' })
    expect(r.document.file).toMatch(/en\.md$/)
  })

  it('no file for the locale falls back to en.md as missing', () => {
    expect(resolveDocsDocument('sample', 'ja', GOOD)).toMatchObject({
      fallback: 'missing',
      shownLocale: 'en',
    })
  })

  it('a source the ledger never held throws, naming the file and the revision', () => {
    expect(() => resolveDocsDocument('sample', 'ko', BAD)).toThrow(
      /ko\.md:1: source deadbeef0000 is not a revision of sample\/en\.md/,
    )
  })

  it('a missing English source throws', () => {
    expect(() => resolveDocsDocument('nope', 'en', GOOD)).toThrow(
      /does not exist/,
    )
  })

  it('a translation without front matter throws', () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-nofm-'))
    cpSync(GOOD, dir, { recursive: true })
    writeFileSync(join(dir, 'sample/de.md'), '# Ohne {#sample}\n')
    expect(() => resolveDocsDocument('sample', 'de', dir)).toThrow(
      /front matter `source: <revision>`/,
    )
  })
})

describe('stale by fixture edit — the English is edited and recorded', () => {
  it('the previously current translation becomes stale and renders under the note', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-stale-'))
    cpSync(GOOD, dir, { recursive: true })
    expect(resolveDocsDocument('sample', 'de', dir).fallback).toBeNull()

    const en = join(dir, 'sample/en.md')
    writeFileSync(
      en,
      readFileSync(en, 'utf8').replace('Intro with', 'A reworded intro with'),
    )
    expect(checkDocsTree(dir).join('\n')).toMatch(
      /is not the ledger's last entry/,
    )
    expect(
      recordRevision('sample', dir, new Date('2026-10-09T00:00:00Z')),
    ).toMatchObject({ recorded: true })
    expect(checkDocsTree(dir)).toEqual([])
    expect(recordRevision('sample', dir).recorded).toBe(false)

    expect(resolveDocsDocument('sample', 'de', dir).fallback).toBe('stale')
    const container = await html('de', dir)
    const note = container.querySelector('[role="note"]')
    expect(note?.textContent).toMatch(
      /Übersetzung dieser Seite wird gerade aktualisiert/,
    )
    expect(note?.closest('[lang]')).toBeNull()
    const body = container.querySelector('div[lang="en"]')
    expect(body?.textContent).toContain('A reworded intro with')
    expect(body?.contains(note!)).toBe(false)
    expect(
      container.querySelector('#sample')?.closest('[lang="en"]'),
    ).not.toBeNull()
  })

  it('a missing translation renders the same note above the English body', async () => {
    const container = await html('ja')
    expect(container.querySelector('[role="note"]')?.textContent).toMatch(
      /このページの翻訳は更新中です/,
    )
    expect(container.querySelector('div[lang="en"] #sample')).not.toBeNull()
  })

  it('English and a current translation render no note (design panel G)', async () => {
    expect((await html('en')).querySelector('[role="note"]')).toBeNull()
    const de = await html('de')
    expect(de.querySelector('[role="note"]')).toBeNull()
    expect(de.querySelector('[lang="en"]')).toBeNull()
  })
})

describe('load errors name the file and the line', () => {
  const check = (body: string) => () => validateBody(body, 'x/en.md', 1)

  it('a fenced code block', () => {
    expect(check('# T {#t}\n\n```sh\nrm -rf /\n```\n')).toThrow(
      /x\/en\.md:3: a fenced code block cannot appear/,
    )
    expect(check('# T {#t}\n\n~~~\nx\n~~~\n')).toThrow(/x\/en\.md:3:/)
  })

  it('a heading without an explicit anchor', () => {
    expect(check('# T {#t}\n\n## No anchor here\n')).toThrow(
      /x\/en\.md:3: heading has no explicit anchor/,
    )
    expect(check('# T {#Bad_Id}\n')).toThrow(/explicit anchor/)
  })

  it('a slot that is not alone on its line, and unknown placeholder syntax', () => {
    expect(check('# T {#t}\n\nText {{slot:a}} more\n')).toThrow(
      /x\/en\.md:3: a slot must be alone/,
    )
    expect(check('# T {#t}\n\n{{thing}}\n')).toThrow(
      /unknown `\{\{…\}\}` syntax/,
    )
  })

  it('a malformed front matter block', () => {
    expect(() =>
      parseDocumentFile('---\nsource: nope\n---\n# T {#t}\n', 'x/de.md'),
    ).toThrow(/exactly one line/)
    expect(() =>
      parseDocumentFile('---\nsource: aaaaaaaaaaaa\n', 'x/de.md'),
    ).toThrow(/not closed/)
    expect(
      parseDocumentFile('---\nsource: aaaaaaaaaaaa\n---\nbody\n', 'x').source,
    ).toBe('aaaaaaaaaaaa')
  })

  it('an English source with front matter', () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-enfm-'))
    cpSync(GOOD, dir, { recursive: true })
    writeFileSync(
      join(dir, 'sample/en.md'),
      `---\nsource: ${R1}\n---\n# T {#t}\n`,
    )
    expect(() => resolveDocsDocument('sample', 'en', dir)).toThrow(
      /carries no front matter/,
    )
  })

  it('a ledger that is not an array of revisions', () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-ledger-'))
    cpSync(GOOD, dir, { recursive: true })
    writeFileSync(join(dir, 'sample/revisions.json'), '{"a":1}')
    expect(() => readLedger('sample', dir)).toThrow(/JSON array/)
    writeFileSync(
      join(dir, 'sample/revisions.json'),
      '[{"revision":"zz","recordedAt":"x"}]',
    )
    expect(() => readLedger('sample', dir)).toThrow(/entry 0/)
    writeFileSync(join(dir, 'sample/revisions.json'), 'not json')
    expect(() => readLedger('sample', dir)).toThrow(/not valid JSON/)
  })
})

describe('rendering', () => {
  it('an unresolved slot or value throws at render', async () => {
    await expect(
      DocsDocument({
        slug: 'sample',
        locale: 'en',
        slots: {},
        values,
        root: GOOD,
      }),
    ).rejects.toThrow(/no slot named "install"/)
    await expect(
      DocsDocument({
        slug: 'sample',
        locale: 'en',
        slots,
        values: { tag: 'v1', site: '/' },
        root: GOOD,
      }),
    ).rejects.toThrow(/no value named "file"/)
  })

  it('a value must be a plain one-line string', async () => {
    await expect(
      DocsDocument({
        slug: 'sample',
        locale: 'en',
        slots,
        values: { ...values, tag: 'a`b' },
        root: GOOD,
      }),
    ).rejects.toThrow(/plain one-line string/)
  })

  it('a value renders in a paragraph, an inline code span and a link destination — the same for en and a translation', async () => {
    for (const locale of ['en', 'de'] as const) {
      const c = await html(locale)
      expect(c.textContent).toContain('v9.9.9')
      expect(c.querySelector('code:not(pre code)')).not.toBeNull()
      expect(
        [...c.querySelectorAll('code')].map((n) => n.textContent),
      ).toContain('motir.config.json')
      expect(
        c.querySelector('a[href="https://example.test/guide"]'),
      ).not.toBeNull()
    }
  })

  it('headings carry exactly their {#id}, identical between English and the translation', async () => {
    const ids = async (l: 'en' | 'de') =>
      [...(await html(l)).querySelectorAll('h1,h2,h3')].map((h) => h.id)
    expect(await ids('en')).toEqual(['sample', 'next-steps'])
    expect(await ids('de')).toEqual(await ids('en'))
    expect((await html('en')).querySelector('h1')?.textContent).toBe(
      'Sample page',
    )
  })

  it('slot content is byte-identical in both, because both come from the one map', async () => {
    const slot = async (l: 'en' | 'de') =>
      (await html(l)).querySelector('[data-testid="slot"]')?.outerHTML
    expect(await slot('en')).toBe(
      '<pre data-testid="slot">npm i -g motir</pre>',
    )
    expect(await slot('de')).toBe(await slot('en'))
  })

  it("a root-relative link keeps the reader's language; an external one opens out", async () => {
    expect(
      (await html('de')).querySelector('a[href="/de/docs/api#start"]'),
    ).not.toBeNull()
    const dir = mkdtempSync(join(tmpdir(), 'docs-ext-'))
    cpSync(GOOD, dir, { recursive: true })
    const en = join(dir, 'sample/en.md')
    writeFileSync(
      en,
      `${readFileSync(en, 'utf8')}\nSee [Docker](https://docker.com).\n`,
    )
    const ui = await DocsDocument({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: dir,
    })
    const link = render(ui).container.querySelector(
      'a[href="https://docker.com"]',
    )
    expect(link?.getAttribute('target')).toBe('_blank')
  })
})

describe('the docs treatment of every element a document may use', () => {
  it('renders headings, lists, emphasis and tables with their anchors and classes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-rich-'))
    cpSync(GOOD, dir, { recursive: true })
    const en = join(dir, 'sample/en.md')
    writeFileSync(
      en,
      [
        '# Rich {#rich}',
        '',
        '### Third {#third}',
        '',
        '#### Fourth {#fourth}',
        '',
        '- one **bold** item',
        '- two',
        '',
        '1. first',
        '2. second',
        '',
        '| Name | Value |',
        '| --- | --- |',
        '| `a` | b |',
        '',
        '{{slot:install}}',
        '',
      ].join('\n'),
    )
    const ui = await DocsDocument({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: dir,
    })
    const c = render(ui).container
    expect([...c.querySelectorAll('h1,h3,h4')].map((h) => h.id)).toEqual([
      'rich',
      'third',
      'fourth',
    ])
    expect(c.querySelectorAll('ul > li')).toHaveLength(2)
    expect(c.querySelectorAll('ol > li')).toHaveLength(2)
    expect(c.querySelector('strong')?.textContent).toBe('bold')
    expect(c.querySelectorAll('th')).toHaveLength(2)
    expect(c.querySelectorAll('td')).toHaveLength(2)
  })
})

describe('documentInvariants', () => {
  const en = documentInvariants(
    resolveDocsDocument('sample', 'en', GOOD).document.markdown,
  )
  const de = documentInvariants(
    resolveDocsDocument('sample', 'de', GOOD).document.markdown,
  )

  it('lists slots, values, inline code, hrefs and anchors in document order', () => {
    expect(en).toEqual({
      slots: ['install'],
      values: ['tag', 'site', 'file'],
      inlineCode: ['motir run', 'motir login', '{{value:file}}'],
      hrefs: ['/docs/api#start', '{{value:site}}'],
      anchors: ['sample', 'next-steps'],
    })
  })

  it('a faithful translation has the same invariants', () => {
    expect(de).toEqual(en)
  })

  it('a translation that alters one inline code span is reported as differing', () => {
    const tampered = documentInvariants(
      resolveDocsDocument('sample', 'de', GOOD).document.markdown.replace(
        '`motir login`',
        '`motir anmelden`',
      ),
    )
    expect(tampered).not.toEqual(en)
    expect(tampered.inlineCode[1]).toBe('motir anmelden')
  })
})

describe('the helpers', () => {
  it('revisionOf is 12 hex and normalises line endings', () => {
    expect(revisionOf('a\nb\n')).toMatch(/^[0-9a-f]{12}$/)
    expect(revisionOf('a\r\nb\r\n')).toBe(revisionOf('a\nb\n'))
    expect(revisionOf('a\nb\n')).not.toBe(revisionOf('a\nc\n'))
  })

  it('splitSlots splits at slot lines only', () => {
    expect(splitSlots('one\n\n{{slot:a}}\n\ntwo\n{{slot:b}}')).toEqual([
      { kind: 'markdown', text: 'one\n' },
      { kind: 'slot', name: 'a' },
      { kind: 'markdown', text: '\ntwo' },
      { kind: 'slot', name: 'b' },
    ])
  })

  it('a date is formatted per locale, never in English on a German page', () => {
    expect(formatDocsDate('de', '2026-10-06')).toBe('6. Oktober 2026')
    expect(formatDocsDate('en', '2026-10-06')).toBe('October 6, 2026')
    expect(formatDocsDate('ja', '2026-10-06')).toBe('2026年10月6日')
  })

  it('checkDocsTree is clean on the good tree and names the never-existed source on the bad one', () => {
    expect(checkDocsTree(GOOD)).toEqual([])
    const problems = checkDocsTree(BAD)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toMatch(
      /ko\.md:1: source deadbeef0000 is not a revision of sample\/en\.md — it never existed/,
    )
  })

  it('DocsDocumentError carries the file and line', () => {
    const e = new DocsDocumentError('a/b.md', 'bad', 7)
    expect([e.file, e.line, e.message]).toEqual(['a/b.md', 7, 'a/b.md:7: bad'])
  })
})
