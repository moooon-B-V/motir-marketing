import type { Locale } from '@/i18n/routing'

/*
 * THE GIVE-WAY LADDER AS CLASS STRINGS (MOTIR-7947 revision 2 · MOTIR-7953).
 *
 * `HEADER_LADDER` in `i18n/routing.ts` holds the widths; this holds them
 * spelled as Tailwind classes. ⚠️ THE STRINGS ARE WRITTEN OUT, NOT BUILT:
 * Tailwind finds a class by scanning source text, so `min-[${b}px]:flex` would
 * never be generated. `tests/headerLadder.test.ts` reads every width back out
 * of these strings and fails when the two disagree.
 *
 * Per rung:
 *   setup — Copy setup prompt, shown from `a`
 *   nav   — the nav, shown from `b`
 *   wide  — Sign in, shown from `b`
 *   menu  — the Menu button and its panel, gone from `b`
 */
export interface LadderClasses {
  setup: string
  nav: string
  wide: string
  menu: string
}

const LATIN_WIDE: LadderClasses = {
  setup: 'hidden min-[1560px]:inline-flex',
  nav: 'hidden min-[1314px]:flex',
  wide: 'hidden min-[1314px]:inline-flex',
  menu: 'min-[1314px]:hidden',
}

const CJK: LadderClasses = {
  setup: 'hidden min-[1488px]:inline-flex',
  nav: 'hidden min-[1173px]:flex',
  wide: 'hidden min-[1173px]:inline-flex',
  menu: 'min-[1173px]:hidden',
}

export const LADDER_CLASSES: Record<Locale, LadderClasses> = {
  en: {
    setup: 'hidden min-[1364px]:inline-flex',
    nav: 'hidden min-[1148px]:flex',
    wide: 'hidden min-[1148px]:inline-flex',
    menu: 'min-[1148px]:hidden',
  },
  zh: CJK,
  ja: CJK,
  ko: CJK,
  de: LATIN_WIDE,
  fr: LATIN_WIDE,
  es: LATIN_WIDE,
  it: LATIN_WIDE,
  nl: LATIN_WIDE,
  pl: LATIN_WIDE,
  pt: LATIN_WIDE,
}
