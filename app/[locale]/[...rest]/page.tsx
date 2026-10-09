import { notFound } from 'next/navigation'
import { enterLocale } from '@/i18n/locale'

/**
 * EVERY UNMATCHED PATH UNDER A LOCALE (MOTIR-7955) — `/fr/no-such-page`, and
 * the unprefixed `/no-such-page` that the locale middleware rewrites onto
 * `/en/no-such-page`.
 *
 * Next sends a path that matches no route to the GLOBAL `app/not-found.tsx`,
 * which is English by construction. A catch-all that throws `notFound()` turns
 * the miss into a `notFound()` INSIDE the locale's tree, so the nearest
 * boundary is `app/[locale]/not-found.tsx` and the room speaks the locale.
 * next-intl's App Router guide prescribes exactly this pair.
 *
 * It sorts after every real route, so it answers only what nothing else does.
 */
export default async function UnmatchedPath({
  params,
}: {
  params: Promise<{ locale: string; rest: string[] }>
}) {
  await enterLocale(params)
  notFound()
}
