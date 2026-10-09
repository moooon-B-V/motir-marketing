import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from './routing'

/** The `params` every route under `app/[locale]` receives. */
export type LocaleParams = Promise<{ locale: string }>

/** The props of a page or layout whose only dynamic segment is the locale. */
export interface LocalePageProps {
  params: LocaleParams
}

/**
 * Read the page's locale from its `params` and hand it to next-intl
 * (MOTIR-7948) — the one line every statically rendered page and layout under
 * `app/[locale]` starts with.
 *
 * ⚠️ IT IS WHAT KEEPS THE PAGE STATIC. next-intl's server reads otherwise ask
 * the REQUEST which locale is in use, and a request read moves a prerendered
 * route to `ƒ`. Layouts and pages render in parallel, so the locale layout
 * calling it does not cover the page: each one calls it for itself, as
 * next-intl's static-rendering guide prescribes.
 *
 * An unknown value cannot reach here — the locale layout's
 * `dynamicParams = false` answers 404 first — so the fallback is a type
 * narrowing, not a behaviour.
 */
export async function enterLocale(
  params: Promise<{ locale?: string }>,
): Promise<Locale> {
  const { locale } = await params
  const known = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale
  setRequestLocale(known)
  return known
}
