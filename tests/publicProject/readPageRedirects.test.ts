import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PROJECT_TABS, visitorViewUrl } from '@/lib/publicProject'
import {
  GET as boardGET,
  HEAD as boardHEAD,
} from '@/app/[locale]/p/[identifier]/board/route'
import { GET as itemsGET } from '@/app/[locale]/p/[identifier]/items/route'
import { GET as treeGET } from '@/app/[locale]/p/[identifier]/tree/route'
import { GET as roadmapGET } from '@/app/[locale]/p/[identifier]/roadmap/route'
import {
  GET as itemGET,
  HEAD as itemHEAD,
} from '@/app/[locale]/p/[identifier]/items/[key]/route'

/**
 * THE RETIRED READ PAGES (MOTIR-6743, Story MOTIR-6171). motir.co's board,
 * items, tree, roadmap and item pages answer a PERMANENT redirect (308) to the
 * same path on the app, where the Visitor's live views are
 * (`app.motir.co/p/<identifier>/<view>`, behind sign-in and a one-time consent).
 * The roadmap is included on purpose: it was the public feature-request board,
 * which the owner retired (motir-core `docs/decisions/public-request-board-retired.md`).
 *
 * The same handlers answer every customer-owned address, because the host router
 * rewrites `acme.motir.site/<IDENT>/board` and `roadmap.acme.com/board` onto
 * this `/p/[identifier]/**` tree (`lib/hostResolution.ts` `routeForHost`) — which
 * is why `Location` is always absolute on `APP_ORIGIN` and never on the tenant.
 */

const APP = 'https://app.test.motir.co'

const call = (
  handler: (
    req: Request,
    ctx: { params: Promise<{ identifier: string }> },
  ) => Promise<Response>,
  identifier: string,
  query = '',
) =>
  handler(new Request(`https://motir.co/p/${identifier}/x${query}`), {
    params: Promise.resolve({ identifier }),
  })

const callItem = (identifier: string, key: string, query = '') =>
  itemGET(
    new Request(`https://motir.co/p/${identifier}/items/${key}${query}`),
    {
      params: Promise.resolve({ identifier, key }),
    },
  )

// ⚠️ NO HANDLER READS THE PUBLIC API: every test here runs with `fetch` stubbed
// to throw, so a handler that tried to read before redirecting would fail rather
// than pass.
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('a retired read page must not read the public API')
    }),
  )
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('each retired read page answers 308 to the same path on the app', () => {
  it.each([
    ['board', boardGET],
    ['items', itemsGET],
    ['tree', treeGET],
    ['roadmap', roadmapGET],
  ] as const)('/p/MOTIR/%s', async (view, handler) => {
    const res = await call(handler, 'MOTIR')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe(`${APP}/p/MOTIR/${view}`)
    expect(await res.text()).toBe('')
  })

  it('/p/MOTIR/items/MOTIR-42 — the FULL identifier, passed through', async () => {
    const res = await callItem('MOTIR', 'MOTIR-42')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe(`${APP}/p/MOTIR/items/MOTIR-42`)
  })

  it('HEAD answers the same redirect as GET', async () => {
    const head = await boardHEAD(
      new Request('https://motir.co/p/MOTIR/board'),
      {
        params: Promise.resolve({ identifier: 'MOTIR' }),
      },
    )
    expect(head.status).toBe(308)
    expect(head.headers.get('location')).toBe(`${APP}/p/MOTIR/board`)
    const itemHead = await itemHEAD(
      new Request('https://motir.co/p/MOTIR/items/MOTIR-1'),
      { params: Promise.resolve({ identifier: 'MOTIR', key: 'MOTIR-1' }) },
    )
    expect(itemHead.headers.get('location')).toBe(
      `${APP}/p/MOTIR/items/MOTIR-1`,
    )
  })

  it('drops the query string — this host’s cursors mean nothing in the app', async () => {
    const items = await call(itemsGET, 'MOTIR', '?cursor=abc')
    expect(items.headers.get('location')).toBe(`${APP}/p/MOTIR/items`)
    const roadmap = await call(roadmapGET, 'MOTIR', '?bucket=planned&cursor=x')
    expect(roadmap.headers.get('location')).toBe(`${APP}/p/MOTIR/roadmap`)
    const item = await callItem('MOTIR', 'MOTIR-42', '?activity=all')
    expect(item.headers.get('location')).toBe(`${APP}/p/MOTIR/items/MOTIR-42`)
  })

  it('encodes an identifier and a key exactly once', async () => {
    // Next hands a handler its params DECODED, so a segment that needed encoding
    // arrives raw and is encoded once on the way out — never double-encoded.
    const res = await call(boardGET, 'A B/Ç')
    expect(res.headers.get('location')).toBe(`${APP}/p/A%20B%2F%C3%87/board`)
    const item = await callItem('A B', 'A B-7')
    expect(item.headers.get('location')).toBe(`${APP}/p/A%20B/items/A%20B-7`)
  })

  it('redirects an unknown project too — the app answers its not-found', async () => {
    const res = await call(boardGET, 'NOPE-XYZ')
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe(`${APP}/p/NOPE-XYZ/board`)
  })
})

describe('the tab list says who serves each tab', () => {
  it('marks Overview and Changelog site-served, the four read views app-served', () => {
    expect(PROJECT_TABS.map((t) => [t.segment, t.served])).toEqual([
      ['', 'site'],
      ['board', 'app'],
      ['items', 'app'],
      ['tree', 'app'],
      ['roadmap', 'app'],
      ['changelog', 'site'],
    ])
  })

  it('builds the app read-view URL in one place', () => {
    expect(visitorViewUrl('MOTIR', 'board')).toBe(`${APP}/p/MOTIR/board`)
    expect(visitorViewUrl('MOTIR', 'items', 'MOTIR-42')).toBe(
      `${APP}/p/MOTIR/items/MOTIR-42`,
    )
  })
})
