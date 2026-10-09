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
 * `localeDetection: false` and `localeCookie: false` until the cards that own
 * them switch them on — the proxy detection card (cookie → `Accept-Language`
 * → English for an unprefixed first visit) and the switcher card (the
 * remembered choice). With either on, an English visitor whose browser asks
 * for German would be moved off the address they typed, which is a behaviour
 * this card does not ship.
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
