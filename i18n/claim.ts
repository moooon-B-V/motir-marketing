import { cache } from 'react'
import type { Locale } from './routing'

/**
 * The locale a request's locale tree has CLAIMED (MOTIR-7955) — written by
 * `claimLocale` in `i18n/locale.ts`, read by the server half of `useCopy()` /
 * `usePageLocale()` in `lib/copy.ts`.
 *
 * ⚠️ WHY NOT next-intl's OWN REQUEST CONFIG. Its server hooks (`useMessages`,
 * `useLocale`) read `getConfig()`, which React-caches its FIRST answer for the
 * whole request. The global `app/not-found.tsx` is rendered into every page's
 * payload and renders first (measured on `next dev`: before the locale layout
 * claims), so on a `/fr` page the first answer was English — and every server
 * component that read the catalogue through a hook got English after it. This
 * slot is read at the moment of the read, so a claim made later still counts.
 *
 * Kept apart from `i18n/locale.ts` so a client module can import the reader
 * without pulling `next-intl/server` into the browser.
 */
const slot = cache((): { locale?: Locale } => ({}))

export function claimedLocale(): Locale | undefined {
  return slot().locale
}

export function setClaimedLocale(locale: Locale): void {
  slot().locale = locale
}
