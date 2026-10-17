import type { APIRequestContext } from '@playwright/test'

/**
 * The text of motir.co's sitemap, with the index followed (MOTIR-8842).
 *
 * `/sitemap.xml` on motir.co is a `<sitemapindex>` over `/sitemap-site.xml` and
 * `/sitemap-projects.xml`; a tenant host's is the project urlset itself. Either
 * way this returns every `<url>` a crawler would end up reading, as one string,
 * so a spec can keep asserting on "the sitemap".
 *
 * ⚠️ THE CHILDREN ARE FETCHED BY PATH, NOT BY THE `<loc>` THEY NAME. The index
 * names `https://motir.co/…` — the public origin the build was made for — and
 * the lane serves the same app at `localhost`, so following the absolute URL
 * would leave the lane. The request context's own base is the right host.
 */
export async function readSitemap(
  request: APIRequestContext,
  origin = '',
): Promise<string> {
  const index = await (await request.get(`${origin}/sitemap.xml`)).text()
  if (!index.includes('<sitemapindex')) return index
  const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]!).pathname,
  )
  const documents = await Promise.all(
    children.map(async (path) =>
      (await request.get(`${origin}${path}`)).text(),
    ),
  )
  return documents.join('\n')
}
