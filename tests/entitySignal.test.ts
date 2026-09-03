import { readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { BRAND_ACCENT_HEX, waveBandSvg } from '@motir/brand'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import {
  buildRootJsonLd,
  ORGANIZATION_ID,
  SAME_AS,
  WEBSITE_ID,
} from '@/app/_components/RootJsonLd'
import { copy } from '@/lib/copy'

// `app/sitemap.ts` and `app/robots.ts` read the request's host (MOTIR-4222),
// and `next/headers` throws outside a request scope. Empty headers read as
// the SITE's own host, which is what every case in this file is about; the
// per-host arms live in `tests/host/crawlSurface.test.ts`.
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

/*
 * The entity signal (MOTIR-1154 · 8.3.7).
 *
 * ⚠️ WHAT THESE CAN AND CANNOT SAY. They assert the SHAPE the repository emits:
 * that the graph carries both nodes and joins them, that `robots` allows crawl
 * and names an absolute sitemap, that the sitemap lists the site's own URL, and
 * that the committed logomark is still the mark `@motir/brand` draws. They say
 * NOTHING about `https://motir.co/robots.txt` or `https://motir.co/sitemap.xml`,
 * which are served by the Fly deployment and only change when `main` is merged
 * and released. Those two acceptance criteria are read live, against the
 * deployed host, and no test in this repository can stand in for them.
 */

describe('robots', () => {
  // ⚠️ AWAITED NOW. MOTIR-4222 made this route per-host — it is served at every
  // address the renderer answers for, and each must name ITS OWN sitemap. With
  // no router headers in this harness it answers as `motir.co`, which is what
  // the three assertions below are about; the per-host arms are covered in
  // `tests/host/crawlSurface.test.ts`.
  let result: Awaited<ReturnType<typeof robots>>
  beforeAll(async () => {
    result = await robots()
  })

  it('ALLOWS crawl — this file existing is not the deliverable, the flip is', () => {
    // MOTIR-1455 shipped it as `disallow: /` on purpose and named this card as
    // the one that opens it. A regression here re-hides the whole site.
    expect(result.rules).toEqual({ userAgent: '*', allow: '/' })
    expect(JSON.stringify(result)).not.toContain('disallow')
  })

  it('references the sitemap ABSOLUTELY', () => {
    expect(result.sitemap).toBe('https://motir.co/sitemap.xml')
  })

  it('declares the canonical host', () => {
    expect(result.host).toBe('https://motir.co/')
  })
})

describe('sitemap', () => {
  // ⚠️ AWAITED, AND THE PROJECT ENTRIES ARE ABSENT HERE BY CONSTRUCTION.
  // MOTIR-4118 made this route dynamic: it enumerates public projects from
  // motir-core's index. There is no API in this environment, so
  // `loadAllPublicProjects` returns nothing and the sitemap falls back to its
  // static entries — which is the FAILED-INDEX arm, asserted below as its own
  // case rather than left as an accident of the harness.
  let entries: Awaited<ReturnType<typeof sitemap>>
  beforeAll(async () => {
    entries = await sitemap()
  })

  it('lists every page the site serves, absolutely', () => {
    // `/design` joined the root in MOTIR-1043; `/legal` and the seven documents
    // joined in MOTIR-4009, read from the same directory the routes glob.
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://motir.co/',
      'https://motir.co/design',
      'https://motir.co/explore',
      'https://motir.co/docs',
      'https://motir.co/docs/api',
      'https://motir.co/docs/api/getting-started',
      'https://motir.co/docs/api/stability',
      'https://motir.co/docs/mcp',
      'https://motir.co/docs/mcp/tools',
      'https://motir.co/docs/cli',
      'https://motir.co/docs/sandbox',
      // MOTIR-4227 — the customer-facing address guide.
      'https://motir.co/docs/public-address',
      'https://motir.co/legal',
      'https://motir.co/legal/terms',
      'https://motir.co/legal/privacy',
      'https://motir.co/legal/cookies',
      'https://motir.co/legal/acceptable-use',
      'https://motir.co/legal/dpa',
      'https://motir.co/legal/subprocessors',
      'https://motir.co/legal/model-providers',
    ])
  })

  it('lists no URL the site does not serve', () => {
    // The footer omits Product / Pricing / Blog / About because those pages do
    // not exist; a sitemap that names them would hand a crawler four 404s.
    for (const entry of entries) {
      expect(entry.url.startsWith('https://motir.co/')).toBe(true)
    }
  })

  it('still returns the static entries, and a list, when the index read FAILS', () => {
    // MOTIR-4118's own requirement, and the reason it matters: a crawler
    // re-reads a short sitemap, and backs off one that errors — taking the
    // site's crawl budget with it. The project pages are reachable from
    // `/explore`, which is in this list, so a failed index is a delay and not a
    // hole.
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.some((entry) => entry.url.includes('/p/'))).toBe(false)
  })
})

describe('the root JSON-LD graph', () => {
  const graph = buildRootJsonLd()
  const nodes = graph['@graph'] as Record<string, unknown>[]
  const org = nodes.find((node) => node['@type'] === 'Organization')!
  const site = nodes.find((node) => node['@type'] === 'WebSite')!

  it('is a schema.org graph carrying BOTH root entities', () => {
    expect(graph['@context']).toBe('https://schema.org')
    expect(nodes).toHaveLength(2)
    expect(org).toBeDefined()
    expect(site).toBeDefined()
  })

  it('names the Organization, its logo and its parent legal entity', () => {
    expect(org['@id']).toBe(ORGANIZATION_ID)
    expect(org.name).toBe('Motir')
    expect(org.url).toBe('https://motir.co/')
    expect(org.logo).toBe('https://motir.co/motir-mark.svg')
    expect(org.description).toBe(copy.meta.description)
    expect(org.parentOrganization).toEqual({
      '@type': 'Organization',
      name: 'moooon B.V.',
    })
  })

  it('lists only sameAs profiles that EXIST — a 404 there is an anti-signal', () => {
    // Product Hunt / G2 / AlternativeTo are MOTIR-1156's deliverable and none of
    // them has been created. When one lands it is one line in `SAME_AS`.
    expect(org.sameAs).toEqual(['https://github.com/moooon-B-V'])
    expect(SAME_AS).not.toContain('')
  })

  it('JOINS the two nodes rather than duplicating the Organization', () => {
    expect(site['@id']).toBe(WEBSITE_ID)
    expect(site.publisher).toEqual({ '@id': ORGANIZATION_ID })
  })

  it('points the SearchAction at the square on THIS host', () => {
    const action = site.potentialAction as Record<string, unknown>
    const target = action.target as Record<string, unknown>
    expect(action['@type']).toBe('SearchAction')
    // The square moved onto motir.co (MOTIR-4045), so the SearchAction targets
    // THIS host's search, not the app origin it used to point at.
    expect(target.urlTemplate).toBe(
      'https://motir.co/explore?q={search_term_string}',
    )
    expect(action['query-input']).toBe('required name=search_term_string')
  })

  it('serialises without throwing and carries no undefined values', () => {
    const json = JSON.stringify(graph)
    expect(json).not.toContain('undefined')
    expect(JSON.parse(json)).toEqual(graph)
  })
})

describe('the committed logomark', () => {
  it('is byte-identical to what @motir/brand draws', () => {
    // The mark lives in ONE place. This file is a build output of that place,
    // so a hand-edit here — or a change to the path upstream — fails rather
    // than quietly making motir.co advertise a different logo to search
    // engines than the one the site renders.
    const committed = readFileSync(
      path.join(process.cwd(), 'public', 'motir-mark.svg'),
      'utf8',
    )
    expect(committed).toBe(
      `${waveBandSvg({ size: 512, fill: BRAND_ACCENT_HEX })}\n`,
    )
  })
})
