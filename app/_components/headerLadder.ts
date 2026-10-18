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

export const LADDER_CLASSES: Record<Locale, LadderClasses> = {
  en: {
    setup: 'hidden min-[1396px]:inline-flex',
    nav: 'hidden min-[1179px]:flex',
    wide: 'hidden min-[1179px]:inline-flex',
    menu: 'min-[1179px]:hidden',
  },
  zh: {
    setup: 'hidden min-[1152px]:inline-flex',
    nav: 'hidden min-[971px]:flex',
    wide: 'hidden min-[971px]:inline-flex',
    menu: 'min-[971px]:hidden',
  },
  ja: {
    setup: 'hidden min-[1518px]:inline-flex',
    nav: 'hidden min-[1217px]:flex',
    wide: 'hidden min-[1217px]:inline-flex',
    menu: 'min-[1217px]:hidden',
  },
  ko: {
    setup: 'hidden min-[1281px]:inline-flex',
    nav: 'hidden min-[1086px]:flex',
    wide: 'hidden min-[1086px]:inline-flex',
    menu: 'min-[1086px]:hidden',
  },
  de: {
    setup: 'hidden min-[1562px]:inline-flex',
    nav: 'hidden min-[1268px]:flex',
    wide: 'hidden min-[1268px]:inline-flex',
    menu: 'min-[1268px]:hidden',
  },
  fr: {
    setup: 'hidden min-[1718px]:inline-flex',
    nav: 'hidden min-[1396px]:flex',
    wide: 'hidden min-[1396px]:inline-flex',
    menu: 'min-[1396px]:hidden',
  },
  es: {
    setup: 'hidden min-[1597px]:inline-flex',
    nav: 'hidden min-[1289px]:flex',
    wide: 'hidden min-[1289px]:inline-flex',
    menu: 'min-[1289px]:hidden',
  },
  it: {
    setup: 'hidden min-[1513px]:inline-flex',
    nav: 'hidden min-[1197px]:flex',
    wide: 'hidden min-[1197px]:inline-flex',
    menu: 'min-[1197px]:hidden',
  },
  nl: {
    setup: 'hidden min-[1480px]:inline-flex',
    nav: 'hidden min-[1212px]:flex',
    wide: 'hidden min-[1212px]:inline-flex',
    menu: 'min-[1212px]:hidden',
  },
  pl: {
    setup: 'hidden min-[1533px]:inline-flex',
    nav: 'hidden min-[1240px]:flex',
    wide: 'hidden min-[1240px]:inline-flex',
    menu: 'min-[1240px]:hidden',
  },
  pt: {
    setup: 'hidden min-[1584px]:inline-flex',
    nav: 'hidden min-[1281px]:flex',
    wide: 'hidden min-[1281px]:inline-flex',
    menu: 'min-[1281px]:hidden',
  },
}
