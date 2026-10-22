import {
  FONT_SET_REGISTRY,
  fontSetMemberVar,
  resolveFontSet,
  type FontSetId,
  type FontSetMember,
  type FontSetRole,
} from '@motir/design-system'

/*
 * THE CJK FONT A zh, zh-tw, ja OR ko VISITOR PICKS ON `/design` (Yue, 2026-10-09).
 * zh-tw (Traditional, Taiwan) joined in MOTIR-9248, drawn under `:lang(zh-TW)`.
 *
 * The six Type pairings decide only the LATIN face of each role, so on a
 * Chinese, Japanese or Korean page they changed the English chip names and
 * nothing a reader of that language reads. Those pages offer their own fonts
 * instead, named directly: every face the installed font set lists for that
 * language. One pick draws all of that language's text, headings and body
 * alike, in the face. Nothing picked is the language's site default, on every
 * page: LXGW WenKai for Chinese, Simplified and Traditional alike (Yue,
 * 2026-10-09), the set's default sans for
 * Japanese and Korean.
 *
 * `app/globals.css` draws each pick from the `data-cjk-<lang>` attribute that
 * `lib/useVisitAppearance.ts` writes on `<html>`, and
 * `tests/cjkFaces.test.ts` holds that CSS to this list.
 */

export type CjkLang = 'zh' | 'zh-tw' | 'ja' | 'ko'

export interface CjkFace {
  /** The registry member id, which is also the attribute value. */
  id: string
  /** The font's own name, shown as the chip. */
  family: string
  /** The registry role the face is listed under. */
  role: Exclude<FontSetRole, 'mono'>
  /** The custom property `app/fonts.ts` loads the face under. */
  variable: string
}

export const CJK_LANGS: readonly CjkLang[] = ['zh', 'zh-tw', 'ja', 'ko']

/** The `<html>` attribute carrying a language's pick. */
export const cjkAttribute = (lang: CjkLang) => `data-cjk-${lang}` as const

/**
 * The CJK language each CJK set draws. Keyed by set id, not by the set's `lang`:
 * the Traditional set's `lang` is the BCP 47 `zh-TW`, which is no `CjkLang`.
 */
const CJK_LANG_OF_SET: Partial<Record<FontSetId, CjkLang>> = {
  'zh-Hans': 'zh',
  'zh-Hant': 'zh-tw',
  ja: 'ja',
  ko: 'ko',
}

/** The page's CJK language, or null for a Latin-script page. */
export function cjkLangOf(locale: string): CjkLang | null {
  const set = resolveFontSet(locale)
  return set.cjk ? (CJK_LANG_OF_SET[set.id as FontSetId] ?? null) : null
}

/** Every face a language's set lists for its sans and serif roles, sans first. */
export function cjkFaces(lang: CjkLang): CjkFace[] {
  const set = resolveFontSet(lang)
  return (['sans', 'serif'] as const).flatMap((role) =>
    (set.roles[role].members as readonly FontSetMember[])
      .filter((member) => member.family !== null && !member.sameFaceAs)
      .map((member) => ({
        id: member.id,
        family: member.family as string,
        role,
        variable: fontSetMemberVar(
          set.id as FontSetId,
          role,
          member.id,
        ) as string,
      })),
  )
}

/** Where motir.co departs from the font set's own default sans. */
const SITE_DEFAULT_FACE: Partial<Record<CjkLang, string>> = {
  zh: 'lxgw-wenkai-tc',
  'zh-tw': 'lxgw-wenkai-tc',
}

/** The face drawn when nothing is picked, on every page of that language. */
export function defaultCjkFace(lang: CjkLang): string {
  return (
    SITE_DEFAULT_FACE[lang] ??
    FONT_SET_REGISTRY[resolveFontSet(lang).id as FontSetId].roles.sans.default
  )
}

/*
 * Each chip's label is drawn in its own face. Tailwind generates a class only
 * from a literal it finds in source, so the twelve are written out; the test
 * holds them to `cjkFaces()`. Keyed `<lang>/<member id>`: LXGW WenKai TC is a
 * member of both Chinese sets, under a different variable in each.
 */
export const CJK_FACE_LABEL_CLASS: Record<string, string> = {
  'zh/noto-sans-sc': 'font-(family-name:--font-set-zh-Hans-sans-noto-sans-sc)',
  'zh/noto-serif-sc':
    'font-(family-name:--font-set-zh-Hans-serif-noto-serif-sc)',
  'zh/lxgw-wenkai-tc':
    'font-(family-name:--font-set-zh-Hans-serif-lxgw-wenkai-tc)',
  'zh-tw/noto-sans-tc':
    'font-(family-name:--font-set-zh-Hant-sans-noto-sans-tc)',
  'zh-tw/noto-serif-tc':
    'font-(family-name:--font-set-zh-Hant-serif-noto-serif-tc)',
  'zh-tw/lxgw-wenkai-tc':
    'font-(family-name:--font-set-zh-Hant-serif-lxgw-wenkai-tc)',
  'ja/noto-sans-jp': 'font-(family-name:--font-set-ja-sans-noto-sans-jp)',
  'ja/m-plus-rounded-1c':
    'font-(family-name:--font-set-ja-sans-m-plus-rounded-1c)',
  'ja/noto-serif-jp': 'font-(family-name:--font-set-ja-serif-noto-serif-jp)',
  'ko/noto-sans-kr': 'font-(family-name:--font-set-ko-sans-noto-sans-kr)',
  'ko/nanum-gothic': 'font-(family-name:--font-set-ko-sans-nanum-gothic)',
  'ko/noto-serif-kr': 'font-(family-name:--font-set-ko-serif-noto-serif-kr)',
}

/** The label class of one language's face. */
export const cjkFaceLabelClass = (lang: CjkLang, id: string) =>
  CJK_FACE_LABEL_CLASS[`${lang}/${id}`]
