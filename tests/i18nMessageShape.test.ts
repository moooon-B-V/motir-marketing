import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from '@formatjs/icu-messageformat-parser'
import { describe, expect, it } from 'vitest'
import { compareMessageShape } from '../scripts/i18n/messageShape'
import { flattenCatalogue } from '../scripts/i18n/sourceRecord'

/*
 * Ported from moooon-B-V/motir-core `tests/i18n-message-shape.test.ts` at
 * 8fd441b96719b42d7655c65021739308a687033d (MOTIR-7949), without its two
 * assertions about motir-core's own locales (that `zh` is among them, and that
 * the listing equals the app's locale list): this repository starts with no
 * translated catalogue, and the coverage gate that pins all ten is MOTIR-7967's.
 *
 * Every translated string keeps the ICU shape of its English source: the same
 * arguments, of the same kind, the same select options, plural branches valid
 * for the target language, and the same rich-text tags nested the same way.
 * `pnpm i18n:merge` refuses a batch entry that breaks one; this is the standing
 * gate over what is committed, so a hand edit to a catalogue meets the same
 * check. The locales are found by LISTING `messages/`, never by naming them.
 */

const ROOT = process.cwd()

/**
 * Committed strings that break the shape, keyed `<locale>:<key>`. Asserted
 * TIGHT in both directions, so the list can only shrink.
 */
const KNOWN_SHAPE_DEBT: Record<string, string> = {}

/**
 * en.json values that are NOT valid ICU, each with how it is handled. The site
 * renders every value with `format()` / `formatRich()` (`lib/copy.ts`), which
 * substitute `{name}` and nothing else — so a value can legitimately hold a
 * literal `<…>` that ICU would read as an unclosed tag. For such a value the
 * shape check compares the literal `{…}` and `<…>` tokens instead
 * (`compareRawTokens` in `messageShape.ts`): a translation must keep each one,
 * the same number of times. Asserted TIGHT, like the debt list.
 */
const NON_ICU_EN_KEYS: Record<string, string> = {
  'howItWorks.modules.3.paras.0':
    'a literal `<KEY>` in `motir run <KEY>`; rendered as plain text, checked by raw tokens',
}

const isCatalogue = (f: string) =>
  /^[a-z]{2,3}(-[A-Za-z0-9]+)?\.json$/.test(f) && f !== 'en.json'

function load(messages: string, locale: string) {
  return flattenCatalogue(
    JSON.parse(readFileSync(join(messages, `${locale}.json`), 'utf8')),
  )
}

/** Every shape violation under `rootDir/messages`, keyed `<locale>:<key>`. */
function violations(rootDir: string): Map<string, string> {
  const messages = join(rootDir, 'messages')
  const en = load(messages, 'en')
  const found = new Map<string, string>()
  for (const file of readdirSync(messages).filter(isCatalogue).sort()) {
    const locale = file.replace(/\.json$/, '')
    const target = load(messages, locale)
    for (const [key, source] of en) {
      const translated = target.get(key)
      if (translated === undefined) continue
      const v = compareMessageShape(source, translated, locale)
      if (v.length)
        found.set(`${locale}:${key}`, v.map((x) => x.detail).join('; '))
    }
  }
  return found
}

function nonIcuKeys(rootDir: string): string[] {
  const en = load(join(rootDir, 'messages'), 'en')
  return [...en]
    .filter(([, value]) => {
      try {
        parse(value, { requiresOtherClause: false })
        return false
      } catch {
        return true
      }
    })
    .map(([key]) => key)
}

describe('i18n message shape (MOTIR-7949)', () => {
  it('every translated string keeps its English source shape, apart from the listed debt', () => {
    const unlisted = [...violations(ROOT)].filter(
      ([k]) => !(k in KNOWN_SHAPE_DEBT),
    )
    expect(unlisted.map(([k, d]) => `${k}: ${d}`)).toEqual([])
  })

  it('every KNOWN_SHAPE_DEBT row still violates (the list only shrinks)', () => {
    const found = violations(ROOT)
    expect(Object.keys(KNOWN_SHAPE_DEBT).filter((k) => !found.has(k))).toEqual(
      [],
    )
  })

  it('every en.json value parses as ICU, except the listed ones', () => {
    expect(nonIcuKeys(ROOT)).toEqual(Object.keys(NON_ICU_EN_KEYS))
  })

  it('a listed non-ICU value still has its raw tokens checked', () => {
    const en = load(join(ROOT, 'messages'), 'en')
    const source = en.get('howItWorks.modules.3.paras.0')!
    expect(compareMessageShape(source, source, 'fr')).toEqual([])
    expect(
      compareMessageShape(source, source.replace('<KEY>', '<CLÉ>'), 'fr'),
    ).not.toEqual([])
  })

  describe('on a temp tree', () => {
    function run(files: Record<string, unknown>) {
      const dir = mkdtempSync(join(tmpdir(), 'i18n-shape-'))
      mkdirSync(join(dir, 'messages'))
      for (const [name, v] of Object.entries(files)) {
        writeFileSync(join(dir, 'messages', name), JSON.stringify(v))
      }
      try {
        return { found: violations(dir), nonIcu: nonIcuKeys(dir) }
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    }
    const en = { a: 'Hi {name}', b: 'Run <KEY>' }

    it('fails a translation that drops an argument', () => {
      const { found } = run({ 'en.json': en, 'xx.json': { a: 'Hallo' } })
      expect([...found.keys()]).toEqual(['xx:a'])
      expect(found.get('xx:a')).toContain('missing {name}')
    })

    it('passes a translation that keeps the shape', () => {
      const { found } = run({
        'en.json': en,
        'xx.json': { a: '{name}, hallo', b: 'Lauf <KEY>' },
      })
      expect([...found]).toEqual([])
    })

    it('names an en value that is not ICU', () => {
      expect(run({ 'en.json': en }).nonIcu).toEqual(['b'])
    })
  })
})
