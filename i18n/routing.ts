import { defineRouting } from 'next-intl/routing'

/**
 * THE LOCALE LIST (Story MOTIR-7737 · MOTIR-7948) — the ONE place motir.co's
 * languages are named. Every sibling card imports {@link LOCALES} and
 * {@link Locale} from here rather than spelling the eleven again.
 *
 * ── `as-needed` ──────────────────────────────────────────────────────────
 *
 * English keeps every address it has today, unprefixed; the other ten sit
 * under `/<locale>/…`. So no published link, crawler entry or test URL moves,
 * and `/en/…` is a redirect to the unprefixed spelling rather than a second
 * address for the same page.
 *
 * ── ⚠️ DETECTION AND THE COOKIE ARE OFF HERE, AND THAT IS A SCOPE LINE ───
 *
 * `localeDetection: false` and `localeCookie: false`, and they stay off: the
 * proxy does its own detection (`lib/localeDetection.ts`, MOTIR-7951), and the
 * header's switcher writes the remembered-choice cookie itself
 * (`lib/languageSwitch.ts`, MOTIR-7953). next-intl's middleware never runs on
 * a tenant host, so neither could be its job.
 */
export const LOCALES = [
  'en',
  'zh',
  'ja',
  'ko',
  'de',
  'fr',
  'es',
  'it',
  'nl',
  'pl',
  'pt',
] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  localeDetection: false,
  localeCookie: false,
})

/**
 * The OpenGraph `og:locale` for each locale — a language_TERRITORY pair, which
 * is the form the protocol defines. The territory is the market each catalogue
 * is written for: Simplified Chinese is `zh_CN`, Portuguese is Brazil's.
 */
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  it: 'it_IT',
  nl: 'nl_NL',
  pl: 'pl_PL',
  pt: 'pt_BR',
}

/**
 * Each language's name in its own script (MOTIR-7953) — what the header's
 * language switcher lists. NOT catalogue strings: 日本語 reads 日本語 on every
 * page, so these live once, beside the locale list, rather than in eleven
 * catalogues. `Record<Locale, …>` makes the list total over the locales at
 * compile time.
 */
export const LOCALE_ENDONYMS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
}

/**
 * THE HEADER'S GIVE-WAY LADDER, per locale (MOTIR-7947 revision 2 · MOTIR-7953).
 * The narrowest viewport, in px, at which each rung of the bar fits:
 *
 *   a — brand · nav · Copy setup prompt · Sign in · Start free · globe
 *   b — Copy setup prompt has left; below `b` the nav and Sign in fold into
 *       the Menu panel (brand · Start free · globe · Menu)
 *
 * German and Japanese run longer than English, so the widths are MEASURED per
 * locale rather than set by shared breakpoints, which overflowed the English
 * bar between 768px and ~1100px. en, de and ja are the design's measurements
 * (de and ja on placeholder copy). The others borrow the nearest measured
 * script — the CJK locales take ja's, the Latin ones de's, the widest — until
 * their catalogue cards measure their own; a borrowed width errs wide, which
 * folds the bar early rather than letting it wrap.
 *
 * `app/_components/headerLadder.ts` turns these into the static class strings
 * Tailwind can see, and `tests/headerLadder.test.ts` holds the two together.
 */
export const HEADER_LADDER: Record<Locale, { a: number; b: number }> = {
  en: { a: 1364, b: 1148 },
  zh: { a: 1488, b: 1173 },
  ja: { a: 1488, b: 1173 },
  ko: { a: 1488, b: 1173 },
  de: { a: 1560, b: 1314 },
  fr: { a: 1560, b: 1314 },
  es: { a: 1560, b: 1314 },
  it: { a: 1560, b: 1314 },
  nl: { a: 1560, b: 1314 },
  pl: { a: 1560, b: 1314 },
  pt: { a: 1560, b: 1314 },
}
