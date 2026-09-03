import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/siteOrigin'
import { legalDocumentSlugs } from '@/lib/legal/documents'
import { PROJECT_TABS, loadAllPublicProjects } from '@/lib/publicProject'
import {
  currentHost,
  currentOrigin,
  publicPathFor,
  requestPublicHost,
} from '@/lib/publicHost'

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
 * ⚠️ NO LONGER STATIC — MOTIR-4118, and the note it replaces said the opposite.
 * It read: "STATIC, unlike motir-core's. That one is `force-dynamic` because it
 * reads a database the image build cannot reach (MOTIR-2490); this one reads a
 * build-time constant, so prerendering it is correct and costs nothing at
 * request time." That was true while every entry was a constant. This file now
 * also enumerates PUBLIC PROJECTS from motir-core's public index, which is a
 * network read — so it is `force-dynamic`, for the same reason motir-core's is
 * and not a different one. `SITE_ORIGIN` is still a `NEXT_PUBLIC_*` value baked
 * in by `next build`, so the URLs are the real ones either way.
 *
 * ⚠️ IT IS PER-HOST NOW (MOTIR-4222), AND THE RULE HAS ONE SENTENCE:
 * **a sitemap may only list URLs on its own host.** So this file lists exactly
 * the projects whose CANONICAL is the host being asked — `primaryHost` on the
 * index row is the field that says so — at the paths that host serves them at.
 * Three consequences, each of them the point rather than a side effect:
 *
 *   • a project whose primary moves to a customer domain DISAPPEARS from
 *     `motir.co/sitemap.xml` and appears in that domain's own;
 *   • a workspace subdomain's sitemap lists only that workspace's projects, at
 *     `/<identifier>` rather than `/p/<identifier>`;
 *   • a customer domain's lists ONE project's tabs, at the host's root.
 *
 * The STATIC entries — the landing, /explore, /docs, /legal — belong to
 * `motir.co` alone and are emitted only there. A tenant host is a project's
 * address, not a copy of the marketing site, and listing this site's pages in a
 * customer's sitemap would ask a crawler to attribute them to that host.
 *
 * ⚠️ A FAILED INDEX READ EMITS THE STATIC ENTRIES AND A 200. `loadAllPublicProjects`
 * never throws and returns what it has. A sitemap that briefly loses its project
 * pages is recoverable — a crawler re-reads it — while one that 500s is not:
 * search engines back off a sitemap that errors, and the whole site's crawl
 * budget goes with it. The project pages are also reachable from `/explore`,
 * which is itself in this list, so a short sitemap is a delay rather than a hole.
 */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await requestPublicHost()
  const origin = currentOrigin(host)
  const thisHost = currentHost(host)

  // The projects, and their tab paths — every crawlable URL THIS HOST has.
  // `/p/<id>/requests/new` is deliberately absent: it is a `noindex` doorway
  // (MOTIR-4117), and a sitemap that listed it would be asking a crawler to
  // index a page the page itself refuses.
  const { projects } = await loadAllPublicProjects()
  const projectEntries: MetadataRoute.Sitemap = projects
    .filter((project) => project.primaryHost === thisHost)
    .flatMap((project) => {
      const lastModified = new Date(project.updatedAt)
      return PROJECT_TABS.map((tab) => ({
        // ⚠️ ONE EXPRESSION FOR ALL THREE HOST KINDS. `publicPathFor` is the
        // same helper every rendered link goes through, so a sitemap entry and
        // the page's own navigation cannot spell the address differently —
        // which is the way a sitemap normally goes stale.
        url: `${origin}${publicPathFor(host, project.identifier, tab.segment)}`,
        lastModified,
        changeFrequency: 'daily' as const,
        // The project's own page outranks its tabs — it is the one a shared link
        // and /explore's cards point at.
        priority: tab.segment ? 0.5 : 0.8,
      }))
    })

  // A tenant host's sitemap ENDS here: the static entries below are this
  // marketing site's own pages.
  if (host.kind !== 'site') return projectEntries

  return [
    ...projectEntries,
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
    {
      // The square (MOTIR-4045). Its per-topic landing pages are dynamic (read
      // from the public API) and are reached through the square's own crawlable
      // `/explore/topic/<slug>` links, so they are not enumerated here.
      url: siteUrl('/explore'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      // The docs surfaces (MOTIR-4046). The API reference is dynamic (fetches
      // the served OpenAPI document) but is still a stable, crawlable URL.
      url: siteUrl('/docs'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...[
      '/docs/api',
      '/docs/api/getting-started',
      '/docs/api/stability',
      '/docs/mcp',
      '/docs/mcp/tools',
      '/docs/cli',
      '/docs/sandbox',
      '/docs/public-address',
    ].map((path) => ({
      url: siteUrl(path),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    {
      url: siteUrl('/legal'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // A legal document ships by EXISTING in `content/legal/`, so the sitemap
    // reads the same directory the routes do rather than carrying a second list
    // that could drift from it. `legalDocumentSlugs()` is the glob the routes
    // use, so a document added later reaches the sitemap without an edit here.
    ...legalDocumentSlugs().map((slug) => ({
      url: siteUrl(`/legal/${slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ]
}
