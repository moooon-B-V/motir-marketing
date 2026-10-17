import { siteSitemapEntries } from '@/lib/sitemapEntries'
import { SITEMAP_HEADERS, urlsetXml } from '@/lib/sitemapXml'

/**
 * ⚠️ EXPLICIT, BECAUSE A ROUTE HANDLER'S `GET` IS REQUEST-RENDERED BY DEFAULT in
 * Next 15+. `/sitemap.xml` happens to be built anyway (Next special-cases the
 * name), `/sitemap-site.xml` is not — the build listed it `ƒ` until this line,
 * which `pnpm i18n:check-prerender` caught.
 */
export const dynamic = 'force-static'

/**
 * motir.co's own pages, in every language (MOTIR-8842). Reads nothing from the
 * request, so it is built once and served as a file.
 */
export function GET(): Response {
  return new Response(urlsetXml(siteSitemapEntries()), {
    headers: SITEMAP_HEADERS,
  })
}
