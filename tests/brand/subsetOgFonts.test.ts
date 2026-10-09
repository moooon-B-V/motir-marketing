// @vitest-environment node
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { FONT_SET_REGISTRY, LOCALE_FONT_SET } from '@motir/design-system'
import { describe, expect, it } from 'vitest'
import {
  blobSha,
  css2Url,
  drawnStrings,
  isSfnt,
  OG_CJK_LOCALES,
  OG_WEIGHTS,
  subsetText,
  truetypeUrl,
  type Manifest,
} from '@/scripts/brand/subset-og-fonts'

/*
 * MOTIR-7972 — the subset cutter's pure helpers, and the committed subsets
 * against what it promises: a TrueType/OpenType signature, a size that stays a
 * subset, and the font set's own default face. Whether each subset still
 * COVERS its catalogue is `tests/ogFonts.test.ts`'s check, by cmap.
 */

const DIR = join(process.cwd(), 'app', '_brand', 'og-fonts')
const manifest = JSON.parse(
  readFileSync(join(DIR, 'manifest.json'), 'utf8'),
) as Manifest

describe('the helpers', () => {
  it('takes the three drawn strings, in key order', () => {
    expect(
      drawnStrings({
        meta: { title: 'T' },
        landing: { hero: { headline: 'H' } },
        footer: { tagline: 'G' },
      }),
    ).toEqual(['T', 'H', 'G'])
    expect(() => drawnStrings({ meta: {} })).toThrow(/meta\.title/)
  })

  it('cuts each distinct non-whitespace character once, sorted', () => {
    expect(subsetText(['計画 と 計画', 'ab a'])).toBe('abと画計')
  })

  it('names a blob the way git does', () => {
    const file = join(process.cwd(), 'messages', 'en.json')
    expect(blobSha(readFileSync(file))).toBe(
      execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim(),
    )
  })

  it('asks CSS2 for one family, weight and text, and reads its truetype src', () => {
    const url = new URL(css2Url('Noto Sans JP', 700, '計画'))
    expect(url.searchParams.get('family')).toBe('Noto Sans JP:wght@700')
    expect(url.searchParams.get('text')).toBe('計画')
    expect(
      truetypeUrl(
        "@font-face { src: url(https://fonts.gstatic.com/x) format('truetype'); }",
      ),
    ).toBe('https://fonts.gstatic.com/x')
    expect(() => truetypeUrl("src: url(x) format('woff2')")).toThrow(/found 0/)
  })

  it('accepts TrueType and OpenType bytes, nothing else', () => {
    expect(isSfnt(Uint8Array.from([0, 1, 0, 0, 9]))).toBe(true)
    expect(isSfnt(Buffer.from('OTTOxx'))).toBe(true)
    expect(isSfnt(Buffer.from('wOF2xx'))).toBe(false)
  })
})

describe('the committed subsets', () => {
  it('are one file per CJK locale and weight', () => {
    expect(manifest.files.map((f) => f.file).sort()).toEqual(
      OG_CJK_LOCALES.flatMap((l) =>
        OG_WEIGHTS.map((w) => `${l}-${w}.ttf`),
      ).sort(),
    )
  })

  it.each(manifest.files.map((f) => [f.file, f] as const))(
    '%s is a TrueType subset of the set’s default sans face',
    (file, entry) => {
      const bytes = readFileSync(join(DIR, file))
      expect(isSfnt(bytes)).toBe(true)
      expect(statSync(join(DIR, file)).size).toBeLessThan(200 * 1024)
      const sans = FONT_SET_REGISTRY[LOCALE_FONT_SET[entry.locale]].roles.sans
      const member = sans.members.find((m) => m.id === sans.default)
      expect(entry.family).toBe(member?.family)
      expect(entry.catalogue).toBe(`messages/${entry.locale}.json`)
    },
  )
})
