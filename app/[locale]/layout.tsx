import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { clientCopy, getCopy } from '@/lib/copy'
import { claimLocale } from '@/i18n/locale'
import { routing } from '@/i18n/routing'
import { SiteDocument } from '../_components/SiteDocument'
import { siteMetadata } from '../_components/siteMetadata'

/**
 * THE LOCALE LAYOUT (MOTIR-7948) — `<html lang>` and `og:locale` follow the
 * address, and every page below is prerendered once per locale.
 *
 * ── ⚠️ STATIC, AND THREE LINES KEEP IT SO ────────────────────────────────
 *
 *  • `generateStaticParams` names the eleven, so each one is built ahead of
 *    time rather than on first request.
 *  • `dynamicParams = false` makes any other first segment — `/sv/`, a typo —
 *    a 404 without a render, and keeps a request from minting a twelfth tree.
 *  • `setRequestLocale` tells next-intl the locale up front. Without it, any
 *    next-intl read below would ask the REQUEST for the locale, and a request
 *    read turns a static page dynamic — every page under this layout calls it
 *    too, for the same reason.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = Readonly<{
  children: ReactNode
  params: Promise<{ locale: string }>
}>

export async function generateMetadata({
  params,
}: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return siteMetadata(locale)
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  claimLocale(locale)
  // The provider hands the client components the catalogue `i18n/request.ts`
  // resolves for this locale — the same merged object the server reads — so
  // `useCopy()` in a `'use client'` module needs no locale prop (MOTIR-7950).
  // Only the namespaces client modules read travel; see the constant.
  // ⚠️ The locale and catalogue are NAMED, not read back from next-intl's
  // request slot: another tree in the same render can write that slot between
  // the claim above and a read after an `await` (`i18n/locale.ts`, MOTIR-7955).
  const clientMessages = clientCopy(await getCopy(locale))
  return (
    <SiteDocument lang={locale}>
      <NextIntlClientProvider locale={locale} messages={clientMessages}>
        {children}
      </NextIntlClientProvider>
    </SiteDocument>
  )
}
