import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

/**
 * next-intl's per-request configuration (MOTIR-7948).
 *
 * ⚠️ EVERY LOCALE READS THE ENGLISH CATALOGUE FOR NOW. This card builds the
 * eleven addresses and nothing else; the catalogue-reader card replaces the
 * `messages` source below with a per-locale read that falls back to English.
 * Until then `/ja/` is a Japanese address rendering English words, which is
 * the scaffolding state the story plans for.
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
    messages: (await import('../messages/en.json')).default,
  }
})
