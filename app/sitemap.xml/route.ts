import { SITE_ORIGIN } from '@/lib/siteOrigin'
import { SITEMAP_HEADERS, sitemapIndexXml } from '@/lib/sitemapXml'

/*
 * motir.co's `/sitemap.xml` — an INDEX over its two halves (MOTIR-8842).
 *
 * It reads nothing from the request, so `next build` writes it. A tenant host
 * never reaches it: `proxy.ts` rewrites that host's `/sitemap.xml` onto
 * `/sitemap-projects.xml`, whose urlset IS the tenant's whole sitemap.
 * Everything the two halves list is explained in `lib/sitemapEntries.ts`.
 */
/**
 * ⚠️ EXPLICIT, BECAUSE A ROUTE HANDLER'S `GET` IS REQUEST-RENDERED BY DEFAULT in
 * Next 15+. `/sitemap.xml` happens to be built anyway (Next special-cases the
 * name), `/sitemap-site.xml` is not — the build listed it `ƒ` until this line,
 * which `pnpm i18n:check-prerender` caught.
 */
export const dynamic = 'force-static'

export function GET(): Response {
  return new Response(
    sitemapIndexXml([
      `${SITE_ORIGIN}/sitemap-site.xml`,
      `${SITE_ORIGIN}/sitemap-projects.xml`,
    ]),
    { headers: SITEMAP_HEADERS },
  )
}
