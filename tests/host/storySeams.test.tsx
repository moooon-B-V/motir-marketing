import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  isOnPrimaryHost,
  publicUrlFor,
  readPublicHost,
  SITE_HOST,
  PUBLIC_ADDRESS_KIND_HEADER,
  PUBLIC_HOST_HEADER,
  PUBLIC_ORIGIN_HEADER,
} from '@/lib/publicHost'
import { resetHostResolutionCache, resolveHost } from '@/lib/hostResolution'
import { ProjectHeader } from '@/app/p/[identifier]/_components/ProjectHeader'
import { ProjectJsonLd } from '@/app/p/[identifier]/_components/JsonLd'
import type { PublicProjectOverviewDto } from '@/lib/publicProject'

/*
 * THE STORY'S SEAMS (MOTIR-4224) — the joins the two code cards' own units mock.
 *
 * ⚠️ WHAT MAKES THESE DIFFERENT FROM THE SUITES BESIDE THEM. `tests/host/
 * hostResolution.test.ts` stubs `fetch` and asks the decision function; `tests/
 * host/tenantLinks.test.tsx` hands a component a `PublicHost` and asks what it
 * emits. Each half can be right while the JOIN is wrong — a contract shape the
 * router parses into a resolution the renderer then reads differently is
 * invisible to both. So each case below starts from a RECORDED contract
 * payload, drives it through the real router code, and ends at a rendered DOM
 * or a real sitemap.
 *
 * ⚠️ THE FIXTURES ARE `e2e/fixtures/`'s SHAPES, RESTATED FOR NODE. The browser
 * lane's stub is an HTTP server started by Playwright; this lane is jsdom and
 * stubs `fetch` in-process, so it cannot reach that server. What it CAN share is
 * the shapes — and those are guarded in the PRODUCING repository
 * (`public-surface-hosts.md` §3), which is why nothing here asserts the contract
 * itself.
 */

const WORKSPACE_PAYLOAD = {
  kind: 'workspace',
  workspace: { name: 'moooon B.V.' },
  projects: [{ identifier: 'ACME', name: 'Acme Roadmap' }],
}
const ALIAS_PAYLOAD = { kind: 'alias', redirectTo: 'acme.motir.site' }

const project = (primary: string): PublicProjectOverviewDto => ({
  id: 'proj_1',
  name: 'Acme Roadmap',
  identifier: 'ACME',
  workspaceName: 'moooon B.V.',
  publicOverviewMd: null,
  publicTagline: null,
  publicTags: [],
  stats: {
    publicRequests: 1,
    upvotes: 2,
    planned: 3,
    shipped: 4,
    inProgress: 5,
  },
  links: {},
  viewerCanManage: false,
  addresses: { primary, alternates: [] },
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
  resetHostResolutionCache()
})

/* ── seam (a): contract → router → rendered page ──────────────────────────── */

describe('a recorded workspace resolution, driven to a rendered tab page', () => {
  it('produces host-relative hrefs AND the canonical in ONE pass', async () => {
    resetHostResolutionCache()
    vi.stubGlobal('fetch', async () =>
      Response.json(WORKSPACE_PAYLOAD, {
        headers: { 'cache-control': 'public, max-age=60' },
      }),
    )

    // 1. the ROUTER's read of the real contract shape
    const read = await resolveHost('acme.motir.site')
    expect(read.status).toBe('ok')

    const { routeForHost } = await import('@/lib/hostResolution')
    const route = routeForHost(
      read.status === 'ok'
        ? read.data
        : (() => {
            throw new Error('the recorded payload did not resolve')
          })(),
      '/ACME/board',
    )
    expect(route).toEqual({ action: 'rewrite', path: '/p/ACME/board' })

    // 2. the headers the router would then forward, read back as a page does
    const host = readPublicHost(
      new Headers({
        [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
        [PUBLIC_HOST_HEADER]: 'acme.motir.site',
        [PUBLIC_ORIGIN_HEADER]: 'https://acme.motir.site',
      }),
    )

    // 3. the RENDERED page — links and canonical together, which is the join
    const subject = project('https://acme.motir.site/ACME')
    render(<ProjectHeader project={subject} current="board" host={host} />)
    const { container } = render(<ProjectJsonLd project={subject} />)

    const nav = screen.getAllByRole('navigation', { name: 'Project' })[0]!
    expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/ACME',
    )
    expect(within(nav).getByRole('link', { name: 'Board' })).toHaveAttribute(
      'href',
      '/ACME/board',
    )

    const graph = JSON.parse(container.querySelector('script')!.innerHTML)
    expect(graph['@id']).toBe('https://acme.motir.site/ACME')
    expect(publicUrlFor(subject, 'board')).toBe(
      'https://acme.motir.site/ACME/board',
    )
  })
})

/* ── seam (b): the index's primaryHost → the sitemap ──────────────────────── */

describe('the crawl index’s primaryHost, driven into the sitemap', () => {
  const INDEX = {
    projects: [
      {
        identifier: 'MOTIR',
        updatedAt: '2026-09-02T00:00:00.000Z',
        primaryHost: 'motir.co',
      },
      {
        identifier: 'ACME',
        updatedAt: '2026-09-01T00:00:00.000Z',
        primaryHost: 'acme.motir.site',
      },
    ],
    nextCursor: null,
  }

  async function sitemapAs(headers: Record<string, string>) {
    vi.resetModules()
    vi.doMock('next/headers', () => ({
      headers: async () => new Headers(headers),
    }))
    vi.stubGlobal('fetch', async () => Response.json(INDEX))
    const sitemap = (await import('@/app/sitemap')).default
    const entries = await sitemap()
    vi.doUnmock('next/headers')
    return entries.map((e) => e.url)
  }

  it('includes on the host that owns the canonical and omits on the one that does not', async () => {
    // ⚠️ ONE ROW, TWO HOSTS, AND IT MUST APPEAR IN EXACTLY ONE. Asserted as a
    // pair rather than as two independent cases, because the failure that
    // matters is "in both" or "in neither" — either of which passes a
    // single-host test.
    const onSite = await sitemapAs({})
    const onTenant = await sitemapAs({
      [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
      [PUBLIC_HOST_HEADER]: 'acme.motir.site',
      [PUBLIC_ORIGIN_HEADER]: 'https://acme.motir.site',
    })

    expect(onSite.some((u) => u.includes('ACME'))).toBe(false)
    expect(onTenant.some((u) => u.includes('ACME'))).toBe(true)

    expect(onSite).toContain('https://motir.co/p/MOTIR')
    expect(onTenant.some((u) => u.includes('MOTIR'))).toBe(false)
  })

  it('and a host the contract knows nothing about lists nothing at all', async () => {
    // The arm neither code card's units reach: a sitemap asked as a host with
    // no projects. Empty is the answer — NOT this site's static pages, which
    // would attribute motir.co's content to somebody else's domain.
    expect(
      await sitemapAs({
        [PUBLIC_ADDRESS_KIND_HEADER]: 'project',
        [PUBLIC_HOST_HEADER]: 'stranger.example',
        [PUBLIC_ORIGIN_HEADER]: 'https://stranger.example',
      }),
    ).toEqual([])
  })
})

/* ── seam (c): an alias resolution → the 301 ──────────────────────────────── */

describe('a recorded alias resolution, driven through the router to the 301', () => {
  it('answers 301 to the live host, path and query preserved', async () => {
    resetHostResolutionCache()
    const resolveHostMock = vi.fn(async () => ({
      status: 'ok' as const,
      data: ALIAS_PAYLOAD as never,
    }))
    vi.resetModules()
    vi.doMock('@/lib/hostResolution', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@/lib/hostResolution')>()),
      resolveHost: resolveHostMock,
    }))
    try {
      const { proxy } = await import('@/proxy')
      const { NextRequest } = await import('next/server')
      const res = await proxy(
        new NextRequest('https://old.motir.site/ACME/items?cursor=w9', {
          headers: { host: 'old.motir.site' },
        }),
      )

      expect(res.status).toBe(301)
      const location = new URL(res.headers.get('location')!)
      expect(location.host).toBe('acme.motir.site')
      expect(location.pathname).toBe('/ACME/items')
      expect(location.search).toBe('?cursor=w9')
    } finally {
      vi.doUnmock('@/lib/hostResolution')
      vi.resetModules()
    }
  })
})

/* ── the branch the cards' own units left ─────────────────────────────────── */

describe('a subject DTO from a motir-core that predates `addresses`', () => {
  it('renders with today’s canonical and redirects NOWHERE', async () => {
    // ⚠️ A ROLLING DEPLOY IS A REAL STATE, not a hypothetical: the two
    // repositories deploy separately by decision (AMENDMENT 2 §E), so for the
    // length of one release this renderer talks to a motir-core that does not
    // send the field. `project.addresses.primary` on `undefined` is a TypeError
    // inside `generateMetadata`, which 500s the page instead of degrading it.
    const legacy = { identifier: 'ACME' }

    expect(publicUrlFor(legacy)).toBe('https://motir.co/p/ACME')
    expect(publicUrlFor(legacy, 'board')).toBe('https://motir.co/p/ACME/board')
    // Absent means "this host is canonical", so nothing redirects — a
    // missing-field redirect would send visitors somewhere chosen by a bug.
    expect(isOnPrimaryHost(legacy, SITE_HOST)).toBe(true)
  })
})
