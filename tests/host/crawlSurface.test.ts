import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PUBLIC_ADDRESS_KIND_HEADER,
  PUBLIC_HOST_HEADER,
  PUBLIC_ORIGIN_HEADER,
} from '@/lib/publicHost'

/*
 * THE PER-HOST CRAWL SURFACE (MOTIR-4222) — `app/sitemap.ts` and
 * `app/robots.ts`, asked as three different hosts.
 *
 * ⚠️ ONE SENTENCE IS THE WHOLE RULE: a sitemap may only list URLs on its own
 * host. Everything below is that rule at three addresses — so a project whose
 * canonical has moved DISAPPEARS from `motir.co`'s sitemap and appears in its
 * own, rather than being duplicated across both or dropped from both.
 *
 * ⚠️ THE HOST IS SUPPLIED THROUGH `next/headers`, WHICH IS THE REAL SEAM. These
 * routes are functions with no arguments; the only thing that tells them which
 * host asked is the pair of headers `proxy.ts` forwards. Mocking the module is
 * how a test asks as somebody else — and it is also why the router's `forward`
 * arm exists at all: `/sitemap.xml` is a site-asset-shaped path, so before
 * MOTIR-4222 it was served with no headers and answered as `motir.co` on every
 * tenant host.
 */

const INDEX = {
  projects: [
    {
      identifier: 'MOTIR',
      updatedAt: '2026-09-02T00:00:00.000Z',
      primaryHost: 'motir.co',
    },
    {
      identifier: 'PROD',
      updatedAt: '2026-09-01T00:00:00.000Z',
      primaryHost: 'acme.motir.site',
    },
    {
      identifier: 'ROAD',
      updatedAt: '2026-08-31T00:00:00.000Z',
      primaryHost: 'roadmap.acme.com',
    },
  ],
  nextCursor: null,
}

/** Load the two routes with a request scope and a stubbed public index. */
async function crawlSurfaceAs(headers: Record<string, string>) {
  vi.resetModules()
  vi.doMock('next/headers', () => ({
    headers: async () => new Headers(headers),
  }))
  vi.stubGlobal('fetch', async () => Response.json(INDEX))

  const sitemap = (await import('@/app/sitemap')).default
  const robots = (await import('@/app/robots')).default
  return { entries: await sitemap(), robots: await robots() }
}

const asWorkspace = {
  [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
  [PUBLIC_HOST_HEADER]: 'acme.motir.site',
}
const asCustom = {
  [PUBLIC_ADDRESS_KIND_HEADER]: 'project',
  [PUBLIC_HOST_HEADER]: 'roadmap.acme.com',
}

afterEach(() => {
  vi.doUnmock('next/headers')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('the sitemap on motir.co', () => {
  it('lists a project whose primary IS motir.co, with its tabs', async () => {
    const { entries } = await crawlSurfaceAs({})
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://motir.co/p/MOTIR')
    expect(urls).toContain('https://motir.co/p/MOTIR/board')
  })

  it('OMITS a project whose primary is elsewhere — the card’s first criterion', async () => {
    const { entries } = await crawlSurfaceAs({})
    const urls = entries.join(' ')

    expect(urls).not.toContain('PROD')
    expect(urls).not.toContain('ROAD')
  })

  it('and keeps the site’s own static pages, which belong to it alone', async () => {
    const { entries } = await crawlSurfaceAs({})
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://motir.co/')
    expect(urls).toContain('https://motir.co/explore')
    expect(urls).toContain('https://motir.co/legal')
  })
})

describe('the sitemap on a workspace subdomain', () => {
  it('lists only that host’s projects, at HOST-RELATIVE paths', async () => {
    const { entries } = await crawlSurfaceAs(asWorkspace)
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://acme.motir.site/PROD')
    expect(urls).toContain('https://acme.motir.site/PROD/roadmap')
    // ⚠️ NOT `/p/PROD`. The sitemap entry and the page's own navigation go
    // through the SAME helper, so they cannot spell the address differently —
    // which is the way a sitemap normally goes stale.
    expect(urls.join(' ')).not.toContain('/p/PROD')
    expect(urls.join(' ')).not.toContain('MOTIR')
  })

  it('carries NONE of the marketing site’s pages', async () => {
    // A tenant host is a project's address, not a copy of motir.co — listing
    // this site's pages there asks a crawler to attribute them to that host.
    const { entries } = await crawlSurfaceAs(asWorkspace)
    const urls = entries.map((e) => e.url).join(' ')

    expect(urls).not.toContain('/explore')
    expect(urls).not.toContain('/legal')
    expect(urls).not.toContain('/docs')
  })
})

describe('the sitemap on a customer domain', () => {
  it('lists ONE project’s tabs, at the host’s root', async () => {
    const { entries } = await crawlSurfaceAs(asCustom)
    const urls = entries.map((e) => e.url)

    expect(urls).toContain('https://roadmap.acme.com/')
    expect(urls).toContain('https://roadmap.acme.com/board')
    expect(urls).toContain('https://roadmap.acme.com/changelog')
    expect(urls).toHaveLength(6) // the overview plus the five tabs, and nothing else
  })
})

describe('robots names THIS host’s sitemap', () => {
  it.each([
    ['motir.co', {}, 'https://motir.co'],
    ['a workspace subdomain', asWorkspace, 'https://acme.motir.site'],
    ['a customer domain', asCustom, 'https://roadmap.acme.com'],
  ])('%s', async (_label, headers, origin) => {
    // A customer domain whose robots.txt pointed at motir.co/sitemap.xml would
    // hand a crawler a document listing URLs on a host it did not ask about —
    // which the sitemap protocol refuses outright.
    const { robots } = await crawlSurfaceAs(headers)

    expect(robots.sitemap).toBe(`${origin}/sitemap.xml`)
    expect(robots.host).toBe(`${origin}/`)
    expect(robots.rules).toEqual({ userAgent: '*', allow: '/' })
  })
})

describe('a failed index read', () => {
  it('leaves motir.co its static entries rather than 500ing', async () => {
    vi.resetModules()
    vi.doMock('next/headers', () => ({ headers: async () => new Headers() }))
    vi.stubGlobal('fetch', async () => {
      throw new Error('ECONNREFUSED')
    })
    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()

    expect(entries.map((e) => e.url)).toContain('https://motir.co/')
  })

  it('and leaves a tenant host an EMPTY sitemap, not the site’s pages', async () => {
    // Short is recoverable — a crawler re-reads it. Emitting motir.co's pages
    // under a customer's host would not be.
    vi.resetModules()
    vi.doMock('next/headers', () => ({
      headers: async () => new Headers(asCustom),
    }))
    vi.stubGlobal('fetch', async () => {
      throw new Error('ECONNREFUSED')
    })
    const sitemap = (await import('@/app/sitemap')).default

    expect(await sitemap()).toEqual([])
  })
})

describe('the origin the router carries', () => {
  it('is USED rather than reconstructed — scheme and port included', async () => {
    // ⚠️ THE CASE THAT MADE THIS A HEADER. The browser lane reaches the app at
    // `http://acme.localhost:4318`; a `robots.txt` built as `https://${host}`
    // names `https://acme.localhost/sitemap.xml`, which resolves nowhere — in
    // the one file whose entire job is to hand a crawler a working address.
    const { robots, entries } = await crawlSurfaceAs({
      [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
      [PUBLIC_HOST_HEADER]: 'acme.localhost',
      [PUBLIC_ORIGIN_HEADER]: 'http://acme.localhost:4318',
    })

    expect(robots.sitemap).toBe('http://acme.localhost:4318/sitemap.xml')
    expect(entries.map((e) => e.url)).toEqual([])
  })

  it('falls back to https for a tenant host that arrives without one', async () => {
    const { robots } = await crawlSurfaceAs({
      [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
      [PUBLIC_HOST_HEADER]: 'acme.motir.site',
    })
    expect(robots.sitemap).toBe('https://acme.motir.site/sitemap.xml')
  })

  it('and REFUSES a value that is not an origin', async () => {
    // The headers are overwritten on every request the router handles, but a
    // request it never handled arrives with whatever was sent — and this value
    // ends up in a robots.txt and a sitemap, where a malformed one is worse
    // than the fallback it replaced.
    const { robots } = await crawlSurfaceAs({
      [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
      [PUBLIC_HOST_HEADER]: 'acme.motir.site',
      [PUBLIC_ORIGIN_HEADER]: 'javascript:alert(1)',
    })
    expect(robots.sitemap).toBe('https://acme.motir.site/sitemap.xml')
  })
})
