// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  PALETTE_IDS,
  PALETTE_REGISTRY,
  STYLE_IDS,
  STYLE_REGISTRY,
  TYPE_IDS,
  TYPE_REGISTRY,
} from '@motir/design-system'
import {
  CJK_FACE_LABEL_CLASS,
  CJK_LANGS,
  cjkAttribute,
  cjkFaces,
  cjkLangOf,
  defaultCjkFace,
} from '@/lib/cjkFaces'
import en from '@/messages/en.json'

/*
 * The `/design` rail in the reader's language (Yue, 2026-10-09): a zh, ja or
 * ko page picks its own fonts by name, and every chip row reads from the
 * catalogue. This holds the CSS to the face list, the face list to the
 * installed registry, and the English catalogue to the package's registries.
 */

const GLOBALS = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

describe('a CJK page offers its own fonts', () => {
  it('lists the three faces each set ships, sans first, by their own names', () => {
    expect(cjkFaces('zh').map((f) => f.family)).toEqual([
      'Noto Sans SC',
      'Noto Serif SC',
      'LXGW WenKai TC',
    ])
    expect(cjkFaces('ja').map((f) => f.family)).toEqual([
      'Noto Sans JP',
      'M PLUS Rounded 1c',
      'Noto Serif JP',
    ])
    expect(cjkFaces('ko').map((f) => f.family)).toEqual([
      'Noto Sans KR',
      'Nanum Gothic',
      'Noto Serif KR',
    ])
  })

  it('only zh, ja and ko pages get the row', () => {
    expect(cjkLangOf('zh')).toBe('zh')
    expect(cjkLangOf('ja')).toBe('ja')
    expect(cjkLangOf('ko')).toBe('ko')
    for (const latin of ['en', 'fr', 'de', 'pl']) {
      expect(cjkLangOf(latin)).toBeNull()
    }
  })

  it('draws each chip label in its face, through a class Tailwind can find', () => {
    const ids = CJK_LANGS.flatMap((lang) => cjkFaces(lang))
    expect(Object.keys(CJK_FACE_LABEL_CLASS).sort()).toEqual(
      ids.map((f) => f.id).sort(),
    )
    for (const face of ids) {
      expect(CJK_FACE_LABEL_CLASS[face.id]).toBe(
        `font-(family-name:${face.variable})`,
      )
    }
  })

  it('globals.css draws every pick, headings and body alike, and the default sans when none', () => {
    for (const lang of CJK_LANGS) {
      for (const face of cjkFaces(lang)) {
        const generic = face.role === 'serif' ? 'serif' : 'sans-serif'
        const selector = `[lang][${cjkAttribute(lang)}='${face.id}']:lang(${lang})`
        const at = GLOBALS.indexOf(selector)
        expect(at, selector).toBeGreaterThan(-1)
        const body = GLOBALS.slice(at, GLOBALS.indexOf('}', at))
        expect(body).toContain(
          `--font-script-sans: var(${face.variable}, ${generic});`,
        )
        expect(body).toContain(
          `--font-script-serif: var(${face.variable}, ${generic});`,
        )
        if (face.id === defaultCjkFace(lang)) {
          expect(GLOBALS).toContain(
            `[lang]:lang(${lang}):not([${cjkAttribute(lang)}]),\n${selector}`,
          )
        }
      }
    }
  })
})

describe('the rail’s English is the registries’ English', () => {
  const show = en.designShowcase as unknown as Record<
    string,
    Record<string, { name: string; tagline: string }>
  >
  it.each([
    ['styles', STYLE_IDS, STYLE_REGISTRY],
    ['palettes', PALETTE_IDS, PALETTE_REGISTRY],
    ['types', TYPE_IDS, TYPE_REGISTRY],
  ] as const)('%s', (key, ids, registry) => {
    const table = registry as Record<string, { name: string; tagline: string }>
    expect(Object.keys(show[key] ?? {})).toEqual([...ids])
    for (const id of ids) {
      expect(show[key]?.[id]).toEqual({
        name: table[id]?.name,
        tagline: table[id]?.tagline,
      })
    }
  })
})
