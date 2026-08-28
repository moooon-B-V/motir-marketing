import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
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
  const result = robots()

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
  const entries = sitemap()

  it('lists the site root, absolutely', () => {
    expect(entries.map((entry) => entry.url)).toEqual(['https://motir.co/'])
  })

  it('lists no URL the site does not serve', () => {
    // The footer omits Product / Pricing / Blog / About because those pages do
    // not exist; a sitemap that names them would hand a crawler four 404s.
    for (const entry of entries) {
      expect(entry.url.startsWith('https://motir.co/')).toBe(true)
    }
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

  it('points the SearchAction at the shipped /explore search', () => {
    const action = site.potentialAction as Record<string, unknown>
    const target = action.target as Record<string, unknown>
    expect(action['@type']).toBe('SearchAction')
    // Built from the ONE configured motir-core origin, never a literal — the
    // vitest env pins a non-production value precisely so this can say so.
    expect(target.urlTemplate).toBe(
      'https://app.test.motir.co/explore?q={search_term_string}',
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
