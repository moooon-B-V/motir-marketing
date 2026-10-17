import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/siteOrigin'

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
 *
 * ⚠️ STATIC, AND motir.co'S ALONE (MOTIR-8842). It was request-rendered and
 * per-host (MOTIR-4222), and a request render is exactly what a crawler's hit
 * on `/robots.txt` should never cost: on 2026-10-17 it answered in 189.8 s while
 * the process was under. This file now reads nothing from the request, so
 * `next build` writes it once and the machine serves a file. A tenant address —
 * `acme.motir.site`, a customer domain — still needs its OWN host named in its
 * `robots.txt` and its own sitemap (a sitemap may only list URLs on its own
 * host), so `proxy.ts` rewrites `/robots.txt` on those hosts to
 * `app/robots-tenant.txt/route.ts`, which is the per-host half and the only
 * robots answer that still renders per request.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: `${SITE_ORIGIN}/`,
  }
}
