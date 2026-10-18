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
    setup: 'hidden min-[1507px]:inline-flex',
    nav: 'hidden min-[1290px]:flex',
    wide: 'hidden min-[1290px]:inline-flex',
    menu: 'min-[1290px]:hidden',
  },
  zh: {
    setup: 'hidden min-[1240px]:inline-flex',
    nav: 'hidden min-[1059px]:flex',
    wide: 'hidden min-[1059px]:inline-flex',
    menu: 'min-[1059px]:hidden',
  },
  ja: {
    setup: 'hidden min-[1589px]:inline-flex',
    nav: 'hidden min-[1288px]:flex',
    wide: 'hidden min-[1288px]:inline-flex',
    menu: 'min-[1288px]:hidden',
  },
  ko: {
    setup: 'hidden min-[1368px]:inline-flex',
    nav: 'hidden min-[1173px]:flex',
    wide: 'hidden min-[1173px]:inline-flex',
    menu: 'min-[1173px]:hidden',
  },
  de: {
    setup: 'hidden min-[1652px]:inline-flex',
    nav: 'hidden min-[1358px]:flex',
    wide: 'hidden min-[1358px]:inline-flex',
    menu: 'min-[1358px]:hidden',
  },
  fr: {
    setup: 'hidden min-[1821px]:inline-flex',
    nav: 'hidden min-[1499px]:flex',
    wide: 'hidden min-[1499px]:inline-flex',
    menu: 'min-[1499px]:hidden',
  },
  es: {
    setup: 'hidden min-[1718px]:inline-flex',
    nav: 'hidden min-[1410px]:flex',
    wide: 'hidden min-[1410px]:inline-flex',
    menu: 'min-[1410px]:hidden',
  },
  it: {
    setup: 'hidden min-[1634px]:inline-flex',
    nav: 'hidden min-[1318px]:flex',
    wide: 'hidden min-[1318px]:inline-flex',
    menu: 'min-[1318px]:hidden',
  },
  nl: {
    setup: 'hidden min-[1562px]:inline-flex',
    nav: 'hidden min-[1294px]:flex',
    wide: 'hidden min-[1294px]:inline-flex',
    menu: 'min-[1294px]:hidden',
  },
  pl: {
    setup: 'hidden min-[1650px]:inline-flex',
    nav: 'hidden min-[1357px]:flex',
    wide: 'hidden min-[1357px]:inline-flex',
    menu: 'min-[1357px]:hidden',
  },
  pt: {
    setup: 'hidden min-[1690px]:inline-flex',
    nav: 'hidden min-[1387px]:flex',
    wide: 'hidden min-[1387px]:inline-flex',
    menu: 'min-[1387px]:hidden',
  },
}
