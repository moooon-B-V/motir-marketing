import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { claimedLocale, setClaimedLocale } from './claim'
import { routing, type Locale } from './routing'

/*
 * ⚠️ ONE REQUEST, TWO LANGUAGES (MOTIR-7955).
 *
 * Two trees render in every page's request and want different locales: the
 * page's own (`fr` under `/fr`) and the GLOBAL `app/not-found.tsx`, which Next
 * renders into EVERY page's payload and which must say `en` — with no locale
 * set, next-intl reads the request, and a request read turns a static page
 * dynamic. When that boundary wrote `en` unconditionally, it overwrote `/fr`'s
 * locale for whatever read after it: measured on `next dev`, `/fr/design`'s
 * provider said `en` and the French 404 room's doors led to `/explore`.
 *
 * So the locale tree CLAIMS the request ({@link claimLocale}, into
 * `i18n/claim.ts`, which the catalogue readers read) and the global boundary
 * only writes English when nothing has claimed ({@link defaultLocaleUnlessClaimed}).
 */

/** The locale tree's write: this request renders in `locale`. */
export function claimLocale(locale: Locale): void {
  setClaimedLocale(locale)
  setRequestLocale(locale)
}

/** The global 404's write: English, unless a locale tree already claimed. */
export function defaultLocaleUnlessClaimed(): void {
  if (claimedLocale() === undefined) setRequestLocale(routing.defaultLocale)
}

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
  claimLocale(known)
  return known
}
