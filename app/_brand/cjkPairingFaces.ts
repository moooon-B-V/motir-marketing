import type { FontSetRole, TypeId } from '@motir/design-system'

/*
 * WHICH CJK FACE EACH TYPE PAIRING DRAWS WITH (Yue, 2026-10-09).
 *
 * A Type pairing (`[data-type]` in the installed `theme.css`) only decides the
 * LATIN face of each role. The Han, kana and hangul behind it come from the
 * font set's `[lang]:lang(…)` block, which names one default member per role
 * and never looks at the pairing. So on `/zh/design`, moving the 字体 picker
 * restyled the English chip names and left every Chinese character as it was,
 * and an all-sans pairing such as Grotesk drew its headlines in Noto Serif.
 *
 * This table is what each pairing means in each CJK set: which face its
 * headline role (`--font-serif`) and its body role (`--font-sans`) draw their
 * script glyphs from. `app/globals.css` writes it as `--font-script-*`
 * overrides, and `tests/cjkPairingFaces.test.ts` holds that CSS to this table
 * and every face named here to the installed registry. A slot left out keeps
 * the set's default member for that role. The mono role is not mapped: no set
 * carries a CJK monospace face.
 */

export type CjkSetId = 'zh-Hans' | 'ja' | 'ko'

/** A face: the registry role it is listed under, and its member id. */
export type CjkFace = readonly [role: FontSetRole, member: string]

export type CjkSlots = Partial<Record<'serif' | 'sans', CjkFace>>

export const CJK_SETS: readonly CjkSetId[] = ['zh-Hans', 'ja', 'ko']

/** The `:lang()` each set's block matches. */
export const CJK_SET_LANG: Record<CjkSetId, string> = {
  'zh-Hans': 'zh',
  ja: 'ja',
  ko: 'ko',
}

const NOTO_SANS: Record<CjkSetId, CjkFace> = {
  'zh-Hans': ['sans', 'noto-sans-sc'],
  ja: ['sans', 'noto-sans-jp'],
  ko: ['sans', 'noto-sans-kr'],
}

/** Sans headlines: the headline role draws from the set's default sans. */
const allSans = (set: CjkSetId): CjkSlots => ({ serif: NOTO_SANS[set] })

export const CJK_PAIRING_FACES: Record<TypeId, Record<CjkSetId, CjkSlots>> = {
  // The house pairing — serif headlines over a sans body — is the sets'
  // defaults exactly.
  motir: { 'zh-Hans': {}, ja: {}, ko: {} },
  // All-sans and structural: sans headlines, and where a set has a second
  // sans, the whole page takes it, so the pick is visible in that language.
  'motir-sans': {
    'zh-Hans': allSans('zh-Hans'),
    ja: {
      serif: ['sans', 'm-plus-rounded-1c'],
      sans: ['sans', 'm-plus-rounded-1c'],
    },
    ko: { serif: ['sans', 'nanum-gothic'], sans: ['sans', 'nanum-gothic'] },
  },
  // Mono throughout: no CJK mono face exists, so the nearest voice is the
  // plain sans for headlines and body alike.
  'motir-mono': {
    'zh-Hans': allSans('zh-Hans'),
    ja: allSans('ja'),
    ko: allSans('ko'),
  },
  // The site's own look. Space Grotesk headlines are a sans, so the script
  // glyphs beside them are the set's sans too.
  grotesk: {
    'zh-Hans': allSans('zh-Hans'),
    ja: allSans('ja'),
    ko: allSans('ko'),
  },
  // A characterful display serif: in Chinese, LXGW WenKai's brush-written
  // kaiti; ja and ko keep their serif defaults.
  editorial: {
    'zh-Hans': { serif: ['serif', 'lxgw-wenkai-tc'] },
    ja: {},
    ko: {},
  },
  'mono-technical': {
    'zh-Hans': allSans('zh-Hans'),
    ja: allSans('ja'),
    ko: allSans('ko'),
  },
}
