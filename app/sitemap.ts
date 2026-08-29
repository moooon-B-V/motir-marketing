import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteOrigin'

/*
 * motir.co's sitemap (MOTIR-1154 · 8.3.7), served at `/sitemap.xml`.
 *
 * ⚠️ NEW HERE, AND NOT motir-core's. That repository has an `app/sitemap.ts`
 * of its own and this card must not touch it: it lists the APPLICATION's public
 * surface — every public project, its tabs, the square and its topic pages —
 * read from the database at request time, at `app.motir.co`. This one lists the
 * MARKETING site's, which is a different host with a different content set. The
 * "already shipped" inventory this card inherited is motir-core's; none of it
 * is reusable here.
 *
 * ⚠️ TWO ENTRIES. It was one — the landing's own footer deliberately omits
 * Product, Pricing, Blog and About because those pages do not exist
 * (`design/marketing/design-notes.md`), and a sitemap listing URLs that 404 is
 * worse than a short one. The line above this one asked that "when a second
 * page lands it adds its line here, in the same change that adds the route";
 * MOTIR-1043 is that change and `/design` is that route. The rule is unchanged
 * and still binds the third page.
 *
 * STATIC, unlike motir-core's. That one is `force-dynamic` because it reads a
 * database the image build cannot reach (MOTIR-2490); this one reads a
 * build-time constant, so prerendering it is correct and costs nothing at
 * request time. `SITE_ORIGIN` is a `NEXT_PUBLIC_*` value baked in by
 * `next build`, which is why the prerendered URL is the real one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: siteUrl('/design'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
