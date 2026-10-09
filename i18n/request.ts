import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { getCopy } from '@/lib/copy'
import { routing } from './routing'

/**
 * next-intl's per-request configuration (MOTIR-7948, MOTIR-7950).
 *
 * `messages` is the locale's catalogue with English filled in per missing key
 * (`getCopy`), so `useMessages()` — and through it `useCopy()` — returns the
 * same complete object on the server and, via the locale layout's
 * `NextIntlClientProvider`, in the browser. A locale with no catalogue file
 * gets English whole.
 *
 * An unknown locale falls back to English rather than throwing: the
 * `[locale]` layout already answers 404 for a segment that is not one of the
 * eleven, so the only way here with a bad value is a caller outside a route.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale
  return {
    locale,
    messages: await getCopy(locale),
  }
})
