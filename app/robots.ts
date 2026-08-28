import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteOrigin'

/*
 * motir.co's `robots.txt` (MOTIR-1154 · 8.3.7).
 *
 * ⚠️ THIS FILE IS A FLIP, NOT A CREATION, AND THE FLIP IS THE DELIVERABLE.
 * MOTIR-1455 shipped it as `disallow: /` deliberately — its deploy was a
 * one-page placeholder, and a thin "coming soon" indexed at the apex is worse
 * than nothing — and named this card as the one that would open it. The landing
 * shipping (MOTIR-1152) and the landing being INDEXABLE are two different
 * events; this is the second one.
 *
 * ⚠️ AND THE FILE CHANGING IS NOT THE CHANGE BEING LIVE. `robots.txt` is served
 * by the Fly deployment, which is cut by `ci.yml`'s `deploy` job on a push to
 * `main` — so the criterion this card is measured against is a read of
 * `https://motir.co/robots.txt` AFTER the merge, not a read of this file.
 *
 * Nothing is disallowed: the site is one public page and there is no private
 * surface to hold back. `sitemap` points at the sibling route, absolutely — the
 * spec requires an absolute URL there, which is the reason `SITE_ORIGIN` exists
 * as a module rather than as a literal in two files.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: siteUrl('/sitemap.xml'),
    host: siteUrl('/'),
  }
}
