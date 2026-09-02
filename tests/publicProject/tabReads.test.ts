import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ROADMAP_BUCKETS,
  loadBoard,
  loadChangelog,
  loadItems,
  loadRoadmap,
  loadRoadmapColumn,
  loadTreeLevel,
  pagedTabHref,
} from '@/lib/publicProject'

/*
 * The five tab reads (MOTIR-4116) — what each one ASKS FOR.
 *
 * The shapes are the producing repository's to guard (`public-surface-hosts.md`
 * §3). What belongs here is the REQUEST: each tab's paging coordinate is a
 * different one, and getting any of them wrong produces a page that renders
 * fine and pages wrongly — the failure mode a type checker cannot see.
 */

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
})
afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

const pathOf = (call = 0) =>
  new URL(fetchMock.mock.calls[call]?.[0] as string).pathname +
  new URL(fetchMock.mock.calls[call]?.[0] as string).search

describe('each tab reads its own endpoint', () => {
  it('board — no paging coordinate at all', async () => {
    await loadBoard('ACME')
    expect(pathOf()).toBe('/api/public/p/ACME/board')
  })

  it('items — cursor, omitted on the first page', async () => {
    await loadItems('ACME')
    expect(pathOf()).toBe('/api/public/p/ACME/items')

    fetchMock.mockClear()
    await loadItems('ACME', 'wi_42')
    expect(pathOf()).toBe('/api/public/p/ACME/items?cursor=wi_42')
  })

  it('changelog — cursor, same shape', async () => {
    await loadChangelog('ACME', 'c_9')
    expect(pathOf()).toBe('/api/public/p/ACME/changelog?cursor=c_9')
  })

  it('tree — OFFSET and parentId, not a cursor', async () => {
    // A level is a stable sibling set, so the endpoint pages by offset. Sending
    // a cursor here would be silently ignored and the level would never advance.
    await loadTreeLevel('ACME')
    expect(pathOf()).toBe('/api/public/p/ACME/tree')

    fetchMock.mockClear()
    await loadTreeLevel('ACME', { parentId: 'wi_1', offset: 50 })
    expect(pathOf()).toBe('/api/public/p/ACME/tree?parentId=wi_1&offset=50')
  })

  it('tree — an offset of 0 is omitted rather than sent', async () => {
    await loadTreeLevel('ACME', { offset: 0 })
    expect(pathOf()).toBe('/api/public/p/ACME/tree')
  })

  it('roadmap — the WHOLE tab carries neither parameter', async () => {
    // ⚠️ The endpoint serves the tab only when BOTH are absent. Sending an
    // empty `bucket=` would be an unknown bucket, which is a 400.
    await loadRoadmap('ACME')
    expect(pathOf()).toBe('/api/public/p/ACME/roadmap')
  })

  it('roadmap column — BOTH parameters, never one', async () => {
    // The signature requires both, so the ambiguous call cannot be written: a
    // bucket with no cursor is MISSING_ROADMAP_CURSOR, not "start from the top".
    await loadRoadmapColumn('ACME', 'planned', 'abc')
    expect(pathOf()).toBe(
      '/api/public/p/ACME/roadmap?bucket=planned&cursor=abc',
    )
  })
})

describe('the roadmap buckets', () => {
  it('are the four the contract names, in display order', () => {
    expect(ROADMAP_BUCKETS.map((b) => b.key)).toEqual([
      'submitted',
      'planned',
      'in_progress',
      'done',
    ])
  })
})

describe('pagedTabHref — the no-JS pager’s target', () => {
  it('is a real URL on this site, carrying the coordinate', () => {
    expect(pagedTabHref('ACME', 'items', { cursor: 'wi_9' })).toBe(
      '/p/ACME/items?cursor=wi_9',
    )
  })

  it('drops undefined parameters rather than emitting empty ones', () => {
    // `?parentId=&offset=3` would be an EMPTY parentId, which the endpoint reads
    // as the root level — so the pager would silently jump back to the top.
    expect(
      pagedTabHref('ACME', 'tree', { parentId: undefined, offset: '3' }),
    ).toBe('/p/ACME/tree?offset=3')
  })

  it('has no query string at all when nothing is carried', () => {
    expect(pagedTabHref('ACME', 'tree', {})).toBe('/p/ACME/tree')
  })

  it('encodes the identifier and the values', () => {
    expect(pagedTabHref('A B', 'items', { cursor: 'a b' })).toBe(
      '/p/A%20B/items?cursor=a+b',
    )
  })
})
