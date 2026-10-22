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
 *   bar   — the nav's text size and spacing. English sits its items a little
 *           closer (gap-4) so its bar keeps the full nav at 1280px. The full
 *           17px everywhere but
 *           the five languages whose nav runs longest (es, fr, it, pl, pt),
 *           which keep their own words ("Documentazione", not "Docs") and
 *           set them smaller instead, so their bar folds near the others'.
 */
export interface LadderClasses {
  bar: string
  setup: string
  nav: string
  wide: string
  menu: string
}

export const LADDER_CLASSES: Record<Locale, LadderClasses> = {
  en: {
    bar: 'gap-4 text-[17px]',
    setup: 'hidden min-[1483px]:inline-flex',
    nav: 'hidden min-[1266px]:flex',
    wide: 'hidden min-[1266px]:inline-flex',
    menu: 'min-[1266px]:hidden',
  },
  zh: {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1373px]:inline-flex',
    nav: 'hidden min-[1192px]:flex',
    wide: 'hidden min-[1192px]:inline-flex',
    menu: 'min-[1192px]:hidden',
  },
  'zh-tw': {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1373px]:inline-flex',
    nav: 'hidden min-[1192px]:flex',
    wide: 'hidden min-[1192px]:inline-flex',
    menu: 'min-[1192px]:hidden',
  },
  ja: {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1589px]:inline-flex',
    nav: 'hidden min-[1288px]:flex',
    wide: 'hidden min-[1288px]:inline-flex',
    menu: 'min-[1288px]:hidden',
  },
  ko: {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1368px]:inline-flex',
    nav: 'hidden min-[1173px]:flex',
    wide: 'hidden min-[1173px]:inline-flex',
    menu: 'min-[1173px]:hidden',
  },
  de: {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1652px]:inline-flex',
    nav: 'hidden min-[1358px]:flex',
    wide: 'hidden min-[1358px]:inline-flex',
    menu: 'min-[1358px]:hidden',
  },
  fr: {
    bar: 'gap-4 text-[14px]',
    setup: 'hidden min-[1744px]:inline-flex',
    nav: 'hidden min-[1422px]:flex',
    wide: 'hidden min-[1422px]:inline-flex',
    menu: 'min-[1422px]:hidden',
  },
  es: {
    bar: 'gap-4 text-[15px]',
    setup: 'hidden min-[1691px]:inline-flex',
    nav: 'hidden min-[1383px]:flex',
    wide: 'hidden min-[1383px]:inline-flex',
    menu: 'min-[1383px]:hidden',
  },
  it: {
    bar: 'gap-4 text-[15px]',
    setup: 'hidden min-[1618px]:inline-flex',
    nav: 'hidden min-[1302px]:flex',
    wide: 'hidden min-[1302px]:inline-flex',
    menu: 'min-[1302px]:hidden',
  },
  nl: {
    bar: 'gap-5 text-[17px]',
    setup: 'hidden min-[1562px]:inline-flex',
    nav: 'hidden min-[1294px]:flex',
    wide: 'hidden min-[1294px]:inline-flex',
    menu: 'min-[1294px]:hidden',
  },
  pl: {
    bar: 'gap-4 text-[15px]',
    setup: 'hidden min-[1634px]:inline-flex',
    nav: 'hidden min-[1341px]:flex',
    wide: 'hidden min-[1341px]:inline-flex',
    menu: 'min-[1341px]:hidden',
  },
  pt: {
    bar: 'gap-4 text-[15px]',
    setup: 'hidden min-[1656px]:inline-flex',
    nav: 'hidden min-[1353px]:flex',
    wide: 'hidden min-[1353px]:inline-flex',
    menu: 'min-[1353px]:hidden',
  },
}
