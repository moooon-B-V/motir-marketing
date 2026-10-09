'use client'

import { usePathname } from 'next/navigation'
import { LOCALES } from './routing'

/**
 * The address with its locale taken off (MOTIR-7948) — `/ja/docs/mcp` and
 * `/docs/mcp` both read `/docs/mcp` — for the chrome that marks the current
 * page.
 *
 * ⚠️ NEXT'S OWN `usePathname` DISAGREES WITH ITSELF ACROSS HYDRATION. A
 * dynamic page reached through the locale rewrite renders on the server with
 * the REWRITTEN path (`/en/docs/mcp`) and hydrates in the browser with the one
 * the visitor typed (`/docs/mcp`). The docs rail compared both to `/docs/mcp`,
 * so the server marked nothing current and the browser marked a link: React
 * error 418, the whole page re-rendered on the client, and the browser lane's
 * `/docs/mcp/tools` spec lost its element mid-scroll three runs in four.
 * Stripping the prefix gives both sides the same answer.
 *
 * Not next-intl's `usePathname`: that one reads the locale from
 * `NextIntlClientProvider`, which this tree does not mount yet.
 */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/')
  if (!(LOCALES as readonly string[]).includes(first ?? '')) return pathname
  return `/${rest.join('/')}`
}

export function useSitePathname(): string {
  return stripLocale(usePathname() ?? '/')
}
