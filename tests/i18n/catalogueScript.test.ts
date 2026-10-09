import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  existsSync,
} from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { check } from 'prettier'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GlossaryShapeError,
  loadGlossary,
  renderInstructions,
  validateGlossary,
} from '@/scripts/i18n/glossary'
import {
  arrayParentOf,
  buildCatalogue,
  classifyKeys,
  flattenCatalogue,
} from '@/scripts/i18n/sourceRecord'
import {
  baseline,
  extract,
  glossarySync,
  merge,
  runCatalogueCli,
  status,
  type Batch,
} from '@/scripts/i18n/catalogue'

// Ported from moooon-B-V/motir-core `tests/i18n/catalogueScript.test.ts` at
// 8fd441b96719b42d7655c65021739308a687033d (MOTIR-7949), with `merge`,
// `baseline` and the CLI awaited, and this repository's own cases at the end:
// the prettier-clean writer and `glossary-sync`.
//
// Story MOTIR-7730 · MOTIR-7745 — the catalogue script, run against a temp
// directory holding a small en catalogue, a glossary, a partial locale file and
// a source record. No network, no database, and `messages/` is never written.

let root: string
const cli = (...argv: string[]) => runCatalogueCli(argv, { rootDir: root, log })
const logs: string[] = []
const log = (line: string) => logs.push(line)

const EN = {
  a: { one: 'One {name}', two: 'Two items', three: 'Plan the Sprint' },
  b: { four: 'Four on Motir', five: 'Five <link>docs</link>' },
}

const GLOSSARY = {
  locale: 'xx',
  register: { formality: 'formal-xx', quotes: '«»', note: 'note-xx' },
  terms: {
    Motir: { translation: 'Motir', doNotTranslate: true, source: 'name' },
    Sprint: { translation: 'Sprint', source: 'decision' },
    'work item': {
      translation: 'werk',
      banned: ['kaart', 'ticket'],
      allowedSenses: 'payment card',
      source: 'ref',
    },
  },
}

function write(rel: string, value: unknown): void {
  const file = join(root, rel)
  mkdirSync(join(file, '..'), { recursive: true })
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')
const readJson = (rel: string) =>
  JSON.parse(read(rel)) as Record<string, unknown>
const batches = () =>
  readdirSync(join(root, '.i18n-work/xx'))
    .sort()
    .map((f) => JSON.parse(read(`.i18n-work/xx/${f}`)) as Batch)
function fill(fn: (key: string, source: string) => string | undefined): void {
  for (const f of readdirSync(join(root, '.i18n-work/xx'))) {
    const b = JSON.parse(read(`.i18n-work/xx/${f}`)) as Batch
    for (const [k, v] of Object.entries(b.source)) {
      const t = fn(k, v)
      if (t !== undefined) b.target[k] = t
    }
    write(`.i18n-work/xx/${f}`, b)
  }
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'i18n-catalogue-'))
  logs.length = 0
  write('messages/en.json', EN)
  write('messages/glossary/xx.json', GLOSSARY)
  // The locale holds 2 of the 5 keys: one current, one stale.
  write('messages/xx.json', { a: { one: 'Uno {name}', two: 'Dos (viejo)' } })
  write('messages/sources/xx.json', {
    'a.one': 'One {name}',
    'a.two': 'Two old items',
  })
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('loadGlossary / renderInstructions', () => {
  it('throws ONE error naming the file and every bad path', async () => {
    write('messages/glossary/ja.json', {
      locale: 'ko',
      terms: {
        'work item': { translation: '' },
        Motir: { translation: 'Motir' },
      },
    })
    let error: unknown
    try {
      loadGlossary('ja', root)
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(GlossaryShapeError)
    const e = error as GlossaryShapeError
    expect(e.message).toContain('ja.json')
    expect(e.paths).toHaveLength(3)
    expect(e.message).toContain('locale')
    expect(e.message).toContain('register')
    expect(e.message).toContain('terms.work item.translation')
  })

  it('refuses a non-string banned list and an empty term set', async () => {
    expect(() =>
      validateGlossary(
        {
          locale: 'xx',
          register: {},
          terms: { a: { translation: 'b', banned: [1] } },
        },
        'xx',
        'f',
      ),
    ).toThrow(/banned/)
    expect(() =>
      validateGlossary({ locale: 'xx', register: {}, terms: {} }, 'xx', 'f'),
    ).toThrow(/terms/)
  })

  it('loads a well-formed glossary and renders every term, banned word, register and the verbatim rule', async () => {
    const g = loadGlossary('xx', root)
    const text = renderInstructions(g)
    for (const t of [
      'Motir',
      'Sprint',
      'werk',
      'kaart',
      'ticket',
      'formal-xx',
      '«»',
    ])
      expect(text).toContain(t)
    expect(text).toContain(
      'Keep every {placeholder}, every #, every plural/select option key and every <tag>',
    )
  })
})

describe('classifyKeys', () => {
  it('puts each key in exactly one class and lists the orphan', async () => {
    const en = flattenCatalogue({ m: 'M', s: 'S new', c: 'C', u: 'U' })
    const cat = flattenCatalogue({ s: 's', c: 'c', u: 'u', gone: 'g' })
    const rec = new Map([
      ['s', 'S old'],
      ['c', 'C'],
    ])
    expect(classifyKeys(en, cat, rec)).toEqual({
      missing: ['m'],
      stale: ['s'],
      current: ['c'],
      untracked: ['u'],
      orphans: ['gone'],
    })
  })
})

describe('extract', () => {
  it("cuts the missing and stale keys into batches, in en order, with the stale entry's previous", async () => {
    const r = extract({ rootDir: root, locale: 'xx', batchSize: 2, log })
    expect(r).toMatchObject({ missing: 3, stale: 1, untracked: 0, batches: 2 })
    const [b1, b2] = batches()
    expect(Object.keys(b1!.source)).toEqual(['a.two', 'a.three'])
    expect(Object.keys(b2!.source)).toEqual(['b.four', 'b.five'])
    expect(b1!.previous).toEqual({
      'a.two': { source: 'Two old items', translation: 'Dos (viejo)' },
    })
    expect(b1!.instructions).toContain('werk')
    expect(b1!.target).toEqual({})
  })

  it('narrows to namespaces when asked', async () => {
    extract({ rootDir: root, locale: 'xx', namespaces: ['b'], log })
    expect(Object.keys(batches()[0]!.source)).toEqual(['b.four', 'b.five'])
  })

  it('refuses --locale en', async () => {
    expect(
      await runCatalogueCli(['extract', '--locale', 'en'], {
        rootDir: root,
        log,
      }),
    ).not.toBe(0)
    expect(() => extract({ rootDir: root, locale: 'en' })).toThrow(
      /source of truth/,
    )
  })

  it('leaves an untracked key out unless --include-untracked', async () => {
    write('messages/sources/xx.json', { 'a.two': 'Two old items' }) // a.one now untracked
    extract({ rootDir: root, locale: 'xx', log })
    expect(Object.keys(batches()[0]!.source)).not.toContain('a.one')
    extract({ rootDir: root, locale: 'xx', includeUntracked: true, log })
    expect(Object.keys(batches()[0]!.source)).toContain('a.one')
  })
})

describe('merge', () => {
  it('writes what passes, rejects what does not, warns on banned words', async () => {
    extract({ rootDir: root, locale: 'xx', log })
    fill(
      (key) =>
        ({
          'a.two': 'Dos elementos', // stale re-fill
          'a.three': 'Planea el Sprint', // good missing value
          'b.four': 'Cuatro en Motor', // "Motir" translated → rejected
          'b.five': 'Cinco <link>docs</link> kaart', // banned word → warning, written
        })[key],
    )
    // A value for a CURRENT key and one missing a placeholder, added by hand.
    const b = batches()[0]!
    b.target['a.one'] = 'Otro {name}'
    write('.i18n-work/xx/batch-001.json', b)
    const before = readJson('messages/xx.json')

    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.merged.sort()).toEqual(['a.three', 'a.two', 'b.five'])
    expect(r.rejected.map((x) => x.key).sort()).toEqual(['a.one', 'b.four'])
    expect(r.rejected.find((x) => x.key === 'a.one')!.reasons.join()).toContain(
      'already current',
    )
    expect(
      r.rejected.find((x) => x.key === 'b.four')!.reasons.join(),
    ).toContain('Motir')
    expect(r.warned).toEqual([{ key: 'b.five', word: 'kaart' }])
    expect(r.exitCode).toBe(1)

    const cat = readJson('messages/xx.json') as {
      a: Record<string, string>
      b: Record<string, string>
    }
    expect(cat.a['one']).toBe(
      (before as { a: Record<string, string> }).a['one'],
    )
    expect(cat.a['two']).toBe('Dos elementos')
    expect(Object.keys(cat)).toEqual(['a', 'b'])
    expect(Object.keys(cat.a)).toEqual(['one', 'two', 'three'])
    expect(read('messages/xx.json')).toMatch(/^\{\n {2}"a"/)
    expect(read('messages/xx.json').endsWith('}\n')).toBe(true)

    const recText = read('messages/sources/xx.json')
    expect(JSON.parse(recText)).toEqual({
      'a.one': 'One {name}',
      'a.two': 'Two items',
      'a.three': 'Plan the Sprint',
      'b.five': 'Five <link>docs</link>',
    })
    expect(recText).toMatch(/^\{\n {2}"a\.one"/)
    expect(recText.endsWith('}\n')).toBe(true)
  })

  it('rejects a value missing a placeholder, a translated "Sprint", and records nothing for them', async () => {
    extract({ rootDir: root, locale: 'xx', log })
    fill(
      (key) =>
        ({ 'a.three': 'Planea la iteración', 'b.five': 'Cinco docs' })[key],
    )
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.rejected.map((x) => x.key).sort()).toEqual(['a.three', 'b.five'])
    expect(
      r.rejected.find((x) => x.key === 'a.three')!.reasons.join(),
    ).toContain('Sprint')
    expect(
      r.rejected.find((x) => x.key === 'b.five')!.reasons.join(),
    ).toContain('link')
    expect(JSON.parse(read('messages/sources/xx.json'))).not.toHaveProperty(
      'a.three',
    )
  })

  it('passes a re-run once the rejected entries are fixed, without refusing what the first run wrote', async () => {
    extract({ rootDir: root, locale: 'xx', log })
    fill((key, source) => (key === 'b.five' ? 'Cinco docs' : `XX ${source}`))
    expect((await merge({ rootDir: root, locale: 'xx', log })).exitCode).toBe(1)
    fill((key, source) =>
      key === 'b.five' ? 'Cinco <link>docs</link>' : `XX ${source}`,
    )
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.rejected).toEqual([])
    expect(r.merged).toEqual(['b.five'])
    expect(r.exitCode).toBe(0)
  })

  it('rejects an entry whose en value changed between extract and merge', async () => {
    extract({ rootDir: root, locale: 'xx', log })
    fill((key) => (key === 'b.four' ? 'Cuatro en Motir' : undefined))
    write('messages/en.json', {
      ...EN,
      b: { ...EN.b, four: 'Four, reworded, on Motir' },
    })
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.rejected[0]!.reasons.join()).toContain('en changed since extract')
    expect(JSON.parse(read('messages/sources/xx.json'))).not.toHaveProperty(
      'b.four',
    )
  })

  it('drops an orphan key from the catalogue and the record, and lists it', async () => {
    write('messages/xx.json', {
      a: { one: 'Uno {name}', two: 'Dos', gone: 'x' },
    })
    write('messages/sources/xx.json', {
      'a.one': 'One {name}',
      'a.gone': 'Gone',
    })
    extract({ rootDir: root, locale: 'xx', log })
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.orphans).toEqual(['a.gone'])
    expect(readJson('messages/xx.json')).not.toHaveProperty('a.gone')
    expect(JSON.parse(read('messages/sources/xx.json'))).not.toHaveProperty(
      'a.gone',
    )
  })
})

describe('status', () => {
  it('reports 0 missing and 0 stale after a full merge, then stale after an en edit', async () => {
    extract({ rootDir: root, locale: 'xx', log })
    fill((key, source) =>
      source
        .replace('Two items', 'Dos')
        .replace('Four on Motir', 'Cuatro en Motir'),
    )
    expect((await merge({ rootDir: root, locale: 'xx', log })).exitCode).toBe(0)
    const ok = status({ rootDir: root, locale: 'xx', log })
    expect(ok.locales[0]).toMatchObject({ missing: 0, stale: 0, current: 5 })
    expect(status({ rootDir: root, check: true, log }).exitCode).toBe(0)

    write('messages/en.json', {
      ...EN,
      a: { ...EN.a, two: 'Two items, reworded' },
    })
    const after = status({ rootDir: root, locale: 'xx', log })
    expect(after.locales[0]).toMatchObject({ stale: 1, staleKeys: ['a.two'] })
    expect(
      status({ rootDir: root, locale: 'xx', check: true, log }).exitCode,
    ).toBe(1)
    expect(
      await runCatalogueCli(['status', '--check'], { rootDir: root, log }),
    ).toBe(1)
  })
})

describe('baseline', () => {
  it('refuses without --confirm and writes nothing; with it, records the untracked keys only', async () => {
    write('messages/sources/xx.json', { 'a.two': 'Two old items' })
    const before = read('messages/sources/xx.json')
    expect(
      (await baseline({ rootDir: root, locale: 'xx', log })).exitCode,
    ).toBe(1)
    expect(read('messages/sources/xx.json')).toBe(before)

    const r = await baseline({
      rootDir: root,
      locale: 'xx',
      confirm: true,
      log,
    })
    expect(r).toEqual({ recorded: 1, exitCode: 0 })
    expect(JSON.parse(read('messages/sources/xx.json'))).toEqual({
      'a.one': 'One {name}',
      'a.two': 'Two old items', // stale stays stale
    })
  })

  it('never touches a missing file it was not asked about', async () => {
    expect(existsSync(join(root, 'messages/sources/zz.json'))).toBe(false)
  })
})

// ── Story gate MOTIR-7760: the paths the cases above do not walk ──────────────
// Added to bring the script and its model to the project's per-file coverage
// floor; each case still asserts behaviour a person running the script meets.

describe('glossary edge shapes (MOTIR-7760)', () => {
  it('refuses a glossary that is not an object, a term that is not one, and a missing file', async () => {
    expect(() => validateGlossary([], 'xx', 'f')).toThrow(
      /\(root\): not an object/,
    )
    expect(() =>
      validateGlossary(
        { locale: 'xx', register: {}, terms: { a: 'b' } },
        'xx',
        'f',
      ),
    ).toThrow(/terms\.a: not an object/)
    expect(() => loadGlossary('zz', root)).toThrow(GlossaryShapeError)
    expect(() => loadGlossary('zz', root)).toThrow(/\(file\)/)
  })

  it('renders a bare register and a banned list with no allowed sense', async () => {
    const text = renderInstructions(
      validateGlossary(
        {
          locale: 'xx',
          register: {},
          terms: { board: { translation: 'tablero', banned: ['b'] } },
        },
        'xx',
        'f',
      ),
    )
    expect(text).not.toContain('Formality')
    expect(text).not.toContain('Quotation marks')
    expect(text).toContain('- For "board" never write: b.')
    expect(text).not.toContain('Allowed senses')
  })
})

describe('the catalogue model (MOTIR-7760)', () => {
  const en = { a: { list: ['x', 'y'] }, b: 'top' }

  it('flattens arrays per element and rebuilds them only when complete', async () => {
    expect([...flattenCatalogue(['p', 'q']).entries()]).toEqual([
      ['0', 'p'],
      ['1', 'q'],
    ])
    expect(arrayParentOf(en, 'a.list.1')).toBe('a.list')
    expect(arrayParentOf(en, 'b')).toBeNull()
    expect(
      buildCatalogue(
        en,
        new Map([
          ['a.list.0', 'X'],
          ['a.list.1', 'Y'],
        ]),
      ),
    ).toEqual({ a: { list: ['X', 'Y'] } })
    // Half an array is not written; nothing at all builds an empty catalogue.
    expect(buildCatalogue(en, new Map([['a.list.0', 'X']]))).toEqual({})
  })

  it('lists a key only the record still holds as an orphan', async () => {
    const c = classifyKeys(
      new Map([['b', 'top']]),
      new Map(),
      new Map([
        ['b', 'top'],
        ['gone', 'Gone'],
      ]),
    )
    expect(c).toMatchObject({ missing: ['b'], orphans: ['gone'] })
    // With no record at all, a held key is untracked and nothing is an orphan.
    expect(
      classifyKeys(new Map([['b', 'top']]), new Map([['b', 'arriba']]), null),
    ).toMatchObject({
      untracked: ['b'],
      orphans: [],
    })
  })

  it('finds the array a key sits in when the catalogue itself is an array', async () => {
    expect(arrayParentOf(['x', ['y', 'z']] as never, '1.0')).toBe('1')
  })
})

describe('extract / merge edge paths (MOTIR-7760)', () => {
  it('keeps an array whole when a batch boundary falls inside it', async () => {
    write('messages/en.json', { ...EN, c: { list: ['x', 'y', 'z'] } })
    extract({ rootDir: root, locale: 'xx', batchSize: 1, log })
    const withList = batches().find((b) => 'c.list.0' in b.source)!
    expect(Object.keys(withList.source)).toEqual([
      'c.list.0',
      'c.list.1',
      'c.list.2',
    ])
  })

  it('a merge with nothing extracted writes nothing and still reports the gaps', async () => {
    rmSync(join(root, 'messages/xx.json'))
    rmSync(join(root, 'messages/sources/xx.json'))
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r).toMatchObject({
      merged: [],
      rejected: [],
      stillMissing: 5,
      exitCode: 0,
    })
    expect(existsSync(join(root, 'messages/xx.json'))).toBe(false)
  })

  it('rejects a key en does not hold, an empty value and an untracked key; skips an empty batch', async () => {
    write('messages/sources/xx.json', { 'a.two': 'Two old items' }) // a.one untracked
    write('.i18n-work/xx/batch-001.json', {
      locale: 'xx',
      instructions: '',
      source: { 'a.one': 'One {name}', 'a.three': 'Plan the Sprint' },
      previous: {},
      target: { 'a.zzz': 'nope', 'a.three': '', 'a.one': 'Otro {name}' },
    })
    // A batch with no target, and a file whose JSON is null, contribute nothing.
    write('.i18n-work/xx/batch-002.json', {
      locale: 'xx',
      source: {},
      previous: {},
    })
    writeFileSync(join(root, '.i18n-work/xx/batch-003.json'), 'null\n')
    const r = await merge({ rootDir: root, locale: 'xx', log })
    const reasons = Object.fromEntries(
      r.rejected.map((x) => [x.key, x.reasons.join(' | ')]),
    )
    expect(reasons['a.zzz']).toBe('not a key in en.json')
    expect(reasons['a.three']).toBe('empty or not a string')
    expect(reasons['a.one']).toContain(
      'untracked (extract with --include-untracked)',
    )
    expect(r.merged).toEqual([])
  })

  it('accepts an untracked key from a batch extracted with --include-untracked', async () => {
    write('messages/sources/xx.json', { 'a.two': 'Two old items' })
    extract({ rootDir: root, locale: 'xx', includeUntracked: true, log })
    fill((key) => (key === 'a.one' ? 'Otro {name}' : undefined))
    const r = await merge({ rootDir: root, locale: 'xx', log })
    expect(r.merged).toEqual(['a.one'])
    expect(JSON.parse(read('messages/sources/xx.json'))).toHaveProperty(
      'a.one',
      'One {name}',
    )
  })

  it('baseline with no record yet records every untracked key', async () => {
    rmSync(join(root, 'messages/sources/xx.json'))
    expect(
      await baseline({ rootDir: root, locale: 'xx', confirm: true, log }),
    ).toEqual({
      recorded: 2,
      exitCode: 0,
    })
  })
})

describe('the command line (MOTIR-7760)', () => {
  it('runs each command and answers with its exit code', async () => {
    expect(
      await cli(
        'extract',
        '--locale',
        'xx',
        '--batch-size',
        '2',
        '--namespaces',
        'a,',
        '--include-untracked',
      ),
    ).toBe(0)
    expect(Object.keys(batches()[0]!.source)).toEqual(['a.two', 'a.three'])
    expect(await cli('merge', '--locale', 'xx')).toBe(0)
    expect(await cli('baseline', '--locale', 'xx')).toBe(1)
    expect(await cli('baseline', '--locale', 'xx', '--confirm')).toBe(0)
    expect(await cli('status')).toBe(0)
  })

  it('prints the usage for an unknown command, and refuses a bad or missing locale with 2', async () => {
    expect(await cli()).toBe(2)
    expect(logs.at(-1)).toMatch(/^usage: catalogue\.ts/)
    expect(await cli('merge')).toBe(2)
    expect(logs.at(-1)).toBe('error: --locale is required')
    expect(await cli('merge', '--locale', 'X!')).toBe(2)
    expect(logs.at(-1)).toBe('error: not a locale code: X!')
  })

  it('answers 1 for a failure that is not a usage error', async () => {
    rmSync(join(root, 'messages/en.json'))
    expect(await cli('status')).toBe(1)
    expect(logs.at(-1)).toMatch(/^error: .*en\.json not found$/)
  })

  it('logs to the console when no logger is given', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    try {
      expect(await runCatalogueCli([], { rootDir: root })).toBe(2)
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/^usage: /))
    } finally {
      spy.mockRestore()
    }
  })
})

// ── motir-marketing's own cases (MOTIR-7949) ─────────────────────────────────

describe('the writer leaves prettier nothing to change', () => {
  it('writes a catalogue and a record that pass prettier --check, an array of strings included', async () => {
    write('messages/en.json', { ...EN, c: { list: ['Plan', 'Build', 'Ship'] } })
    extract({ rootDir: root, locale: 'xx', log })
    fill((key, source) => `XX ${source}`)
    expect(
      (await merge({ rootDir: root, locale: 'xx', log })).rejected,
    ).toEqual([])
    const catalogue = read('messages/xx.json')
    // JSON.stringify would put each element on its own line; prettier does not.
    expect(catalogue).toContain('"list": ["XX Plan", "XX Build", "XX Ship"]')
    for (const rel of ['messages/xx.json', 'messages/sources/xx.json']) {
      expect(await check(read(rel), { filepath: join(root, rel) })).toBe(true)
    }
  })
})

describe('glossary-sync', () => {
  let from: string
  const README =
    '# Catalogue glossaries\n\nMirrored from moooon-B-V/motir-core@0000000.\n'
  const git = (...args: string[]) =>
    execFileSync(
      'git',
      ['-C', from, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args],
      {
        encoding: 'utf8',
      },
    )
  const writeFrom = (rel: string, text: string) => {
    mkdirSync(join(from, 'messages/glossary'), { recursive: true })
    writeFileSync(join(from, 'messages/glossary', rel), text)
  }

  beforeEach(() => {
    from = mkdtempSync(join(tmpdir(), 'i18n-core-'))
    git('init', '-q')
    writeFrom(
      'xx.json',
      `${JSON.stringify({ ...GLOSSARY, register: { note: 'new' } }, null, 2)}\n`,
    )
    writeFrom(
      'yy.json',
      `${JSON.stringify({ ...GLOSSARY, locale: 'yy' }, null, 2)}\n`,
    )
    writeFrom('README.md', 'not copied')
    git('add', '.')
    git('commit', '-q', '-m', 'glossary')
    writeFileSync(join(root, 'messages/glossary/README.md'), README)
    write('messages/glossary/zz.json', { ...GLOSSARY, locale: 'zz' })
  })

  afterEach(() => {
    rmSync(from, { recursive: true, force: true })
  })

  it('copies every glossary byte for byte, records the commit, and reports each change', async () => {
    const sha = git('rev-parse', 'HEAD').trim()
    expect(await cli('glossary-sync', '--from', from)).toBe(0)
    for (const file of ['xx.json', 'yy.json']) {
      expect(read(`messages/glossary/${file}`)).toBe(
        readFileSync(join(from, 'messages/glossary', file), 'utf8'),
      )
    }
    expect(existsSync(join(root, 'messages/glossary/zz.json'))).toBe(false)
    expect(read('messages/glossary/README.md')).toBe(
      README.replace('0000000', sha),
    )
    expect(logs).toEqual([
      `glossary mirrored from motir-core@${sha}`,
      '  added   yy.json',
      '  changed xx.json',
      '  removed zz.json',
      '  updated README.md (Mirrored from)',
    ])

    // A second run finds nothing to do.
    logs.length = 0
    const again = glossarySync({ rootDir: root, from, log })
    expect(again).toMatchObject({
      added: [],
      changed: [],
      removed: [],
      readmeChanged: false,
    })
    expect(logs.at(-1)).toBe('  no glossary changed')
  })

  it('refuses an invalid glossary before writing anything', async () => {
    writeFrom(
      'yy.json',
      JSON.stringify({ locale: 'yy', register: {}, terms: {} }),
    )
    const before = read('messages/glossary/xx.json')
    expect(await cli('glossary-sync', '--from', from)).toBe(1)
    expect(logs.at(-1)).toMatch(/yy\.json: invalid glossary/)
    expect(read('messages/glossary/xx.json')).toBe(before)
    expect(read('messages/glossary/README.md')).toBe(README)
  })

  it('refuses a missing --from, a directory with no glossary, and a README with no mirror line', async () => {
    expect(await cli('glossary-sync')).toBe(2)
    expect(await cli('glossary-sync', '--from', root + '/nowhere')).toBe(2)
    writeFileSync(join(root, 'messages/glossary/README.md'), '# no line\n')
    expect(await cli('glossary-sync', '--from', from)).toBe(1)
    expect(logs.at(-1)).toMatch(/no "Mirrored from" line/)
  })
})
