import type { ReactNode } from 'react'
import { siteMetadata } from './_components/siteMetadata'

/**
 * THE ROOT LAYOUT IS A PASS-THROUGH (MOTIR-7948).
 *
 * Every route lives under `app/[locale]`, and `app/[locale]/layout.tsx` is the
 * one that renders `<html lang>` — it is the only layout that knows the locale.
 * A root layout that ALSO rendered `<html>` would nest one document in another.
 * This is next-intl's App Router setup for a site that keeps a root
 * `app/not-found.tsx`: that page renders its own document, through the same
 * {@link SiteDocument} the locale layout uses.
 *
 * The metadata stays here so the global 404 — which sits under this layout and
 * no other — keeps today's English tags. The locale layout overrides it per
 * locale.
 */
export const metadata = siteMetadata('en')

export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
