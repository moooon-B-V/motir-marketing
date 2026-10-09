import {
  FONT_SET_REGISTRY,
  fontSetMemberVar,
  resolveFontSet,
  type FontSetId,
  type FontSetMember,
  type FontSetRole,
} from '@motir/design-system'

/*
 * THE CJK FONT A zh, ja OR ko VISITOR PICKS ON `/design` (Yue, 2026-10-09).
 *
 * The six Type pairings decide only the LATIN face of each role, so on a
 * Chinese, Japanese or Korean page they changed the English chip names and
 * nothing a reader of that language reads. Those pages offer their own fonts
 * instead, named directly: every face the installed font set lists for that
 * language. One pick draws all of that language's text, headings and body
 * alike, in the face. Nothing picked is the set's default sans, everywhere.
 *
 * `app/globals.css` draws each pick from the `data-cjk-<lang>` attribute that
 * `lib/useVisitAppearance.ts` writes on `<html>`, and
 * `tests/cjkFaces.test.ts` holds that CSS to this list.
 */

export type CjkLang = 'zh' | 'ja' | 'ko'

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

export const CJK_LANGS: readonly CjkLang[] = ['zh', 'ja', 'ko']

/** The `<html>` attribute carrying a language's pick. */
export const cjkAttribute = (lang: CjkLang) => `data-cjk-${lang}` as const

/** The page's CJK language, or null for a Latin-script page. */
export function cjkLangOf(locale: string): CjkLang | null {
  const set = resolveFontSet(locale)
  return set.cjk ? (set.lang as CjkLang) : null
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

/** The face drawn when nothing is picked: the set's default sans. */
export function defaultCjkFace(lang: CjkLang): string {
  return FONT_SET_REGISTRY[resolveFontSet(lang).id as FontSetId].roles.sans
    .default
}

/*
 * Each chip's label is drawn in its own face. Tailwind generates a class only
 * from a literal it finds in source, so the nine are written out; the test
 * holds them to `cjkFaces()`.
 */
export const CJK_FACE_LABEL_CLASS: Record<string, string> = {
  'noto-sans-sc': 'font-(family-name:--font-set-zh-Hans-sans-noto-sans-sc)',
  'noto-serif-sc': 'font-(family-name:--font-set-zh-Hans-serif-noto-serif-sc)',
  'lxgw-wenkai-tc':
    'font-(family-name:--font-set-zh-Hans-serif-lxgw-wenkai-tc)',
  'noto-sans-jp': 'font-(family-name:--font-set-ja-sans-noto-sans-jp)',
  'm-plus-rounded-1c':
    'font-(family-name:--font-set-ja-sans-m-plus-rounded-1c)',
  'noto-serif-jp': 'font-(family-name:--font-set-ja-serif-noto-serif-jp)',
  'noto-sans-kr': 'font-(family-name:--font-set-ko-sans-noto-sans-kr)',
  'nanum-gothic': 'font-(family-name:--font-set-ko-sans-nanum-gothic)',
  'noto-serif-kr': 'font-(family-name:--font-set-ko-serif-noto-serif-kr)',
}
