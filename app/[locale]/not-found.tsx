import { NotFoundRoom } from '@/app/_components/NotFoundRoom'
import { UNKNOWN_HOST } from '@/lib/publicHost'

/**
 * THE 404 ROOM IN THE PAGE'S LANGUAGE (MOTIR-7955).
 *
 * Every `notFound()` thrown inside a locale's tree — an unknown legal slug, an
 * unlisted topic, a project that is not public — and every unmatched path under
 * a locale (through `[...rest]`, beside this file) lands here. It sits inside
 * `app/[locale]/layout.tsx`, so it wears `<html lang>`, the font variables and
 * the provider of that locale, and the room's `useCopy()` reads that locale's
 * catalogue. The global `app/not-found.tsx` stays English and answers only what
 * no locale tree catches — the router's `/_host-unknown` among it.
 *
 * ⚠️ SYNCHRONOUS, AND IT READS NO REQUEST. `app/not-found.tsx`'s header records
 * the two measurements this file is bound by: a request read in a not-found
 * boundary turns the whole site dynamic, and a NESTED boundary made `async`
 * renders an empty 404 document. The locale arrives through the layout's
 * `setRequestLocale` and the provider, never through the request.
 * `tests/i18n/notFoundBoundary.test.ts` guards both.
 *
 * {@link UNKNOWN_HOST} for the same reason as the global boundary: the room may
 * not ask which host it is on, so it spells the site's paths absolutely.
 */
export default function LocaleNotFound() {
  return <NotFoundRoom host={UNKNOWN_HOST} />
}
