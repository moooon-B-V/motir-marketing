import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  loadBoard,
  loadChangelog,
  loadItems,
  loadProject,
  loadRequest,
  loadRoadmap,
  loadTreeLevel,
  loadWorkItem,
} from '@/lib/publicProject'
import { SITE_HOST } from '@/lib/publicHost'
import { ProjectHeader } from '@/app/p/[identifier]/_components/ProjectHeader'
import { WorkItemRow } from '@/app/p/[identifier]/_components/Rows'

/*
 * THE SEAM THE UNITS MOCK (MOTIR-4121).
 *
 * ⚠️ WHY THIS SUITE EXISTS AT ALL. Every other test in this directory mocks
 * `fetch` and hands the module a shape someone typed — which means the module
 * and its tests were written from the SAME assumption, and a drift between that
 * assumption and what `motir-core` really returns is invisible to both. This
 * suite drives the RECORDED responses instead, all the way to the props a
 * component receives.
 *
 * ⚠️ THE FIXTURES ARE THE BROWSER LANE'S OWN, deliberately — `e2e/fixtures/`,
 * one set, not a second copy that could drift from the first. They are shaped
 * from motir-core's published contract, and the CONTRACT is guarded in the
 * producing repository (`public-surface-hosts.md` §3): a contract test living
 * only in the consumer reports the break after it has shipped. So nothing here
 * asserts the contract — it asserts that OUR module turns the contract's shapes
 * into the props our components render, which is the half that lives here.
 */

const FIXTURES = join(process.cwd(), 'e2e', 'fixtures')
const recorded = (name: string) =>
  JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as unknown

const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

const serve = (name: string) =>
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => recorded(name),
  })

describe('a recorded response reaches the props a component renders', () => {
  it('the project subject → the hero', async () => {
    serve('project.json')
    const read = await loadProject('MOTIR')
    if (read.status !== 'ok') throw new Error('fixture did not parse as ok')

    render(<ProjectHeader project={read.data} current="" />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Motir' }),
    ).toBeVisible()
    expect(screen.getByText('moooon B.V.')).toBeVisible()
    // The stat block is where a renamed key shows up as a blank rather than a
    // crash — `128` here is `stats.publicRequests` surviving the whole path.
    expect(screen.getByText('128')).toBeVisible()
    expect(screen.getByText('1,204')).toBeVisible()
  })

  it('a board card → a work-item row', async () => {
    serve('board.json')
    const read = await loadBoard('MOTIR')
    if (read.status !== 'ok') throw new Error('fixture did not parse as ok')

    const card = read.data.columns[0]?.cards[0]
    expect(card, 'the recorded board has no cards').toBeDefined()

    render(<WorkItemRow identifier="MOTIR" item={card!} host={SITE_HOST} />)
    expect(screen.getByRole('link', { name: card!.title })).toHaveAttribute(
      'href',
      `/p/MOTIR/items/${card!.identifier}`,
    )
  })

  it('the epic-privacy marker survives the whole path', async () => {
    // The field is OPTIONAL in the contract and absent on most rows, which is
    // exactly the shape a restatement drops. If it stopped arriving, a private
    // epic would render as an ordinary empty one.
    serve('board.json')
    const read = await loadBoard('MOTIR')
    if (read.status !== 'ok') throw new Error('fixture did not parse as ok')

    const hidden = read.data.columns
      .flatMap((c) => c.cards)
      .find((c) => c.childrenHidden)
    expect(hidden, 'the recorded board has no private epic').toBeDefined()

    render(<WorkItemRow identifier="MOTIR" item={hidden!} host={SITE_HOST} />)
    expect(screen.getByText('Children are not public.')).toBeVisible()
  })
})

describe('every recorded shape parses, field for field', () => {
  const cases: Array<[string, string, () => Promise<unknown>]> = [
    ['project', 'project.json', () => loadProject('MOTIR')],
    ['board', 'board.json', () => loadBoard('MOTIR')],
    ['items', 'items.json', () => loadItems('MOTIR')],
    ['tree level', 'tree.json', () => loadTreeLevel('MOTIR')],
    ['roadmap', 'roadmap.json', () => loadRoadmap('MOTIR')],
    ['changelog', 'changelog.json', () => loadChangelog('MOTIR')],
    [
      'work item',
      'item-detail.json',
      () => loadWorkItem('MOTIR', 'MOTIR-4115'),
    ],
    [
      'request',
      'request-detail.json',
      () => loadRequest('MOTIR', 'MOTIR-4051'),
    ],
  ]

  for (const [name, fixture, call] of cases) {
    it(`${name} — every key the module declares is present in the recording`, async () => {
      serve(fixture)
      const read = (await call()) as { status: string; data?: unknown }

      expect(read.status).toBe('ok')
      // A key the module reads but the recording lacks arrives as `undefined`
      // and renders as a blank — the drift this suite is for. Comparing the
      // parsed object to the file catches a module that silently dropped one.
      expect(read.data).toEqual(recorded(fixture))
    })
  }
})

describe('the CURSOR round trip — a page-two read carries what page one returned', () => {
  it('items', async () => {
    serve('items.json')
    const first = await loadItems('MOTIR')
    if (first.status !== 'ok') throw new Error('fixture did not parse as ok')
    expect(first.data.nextCursor).toBeTruthy()

    fetchMock.mockClear()
    serve('items-page2.json')
    const second = await loadItems('MOTIR', first.data.nextCursor!)

    // The cursor page one HANDED BACK is the one page two ASKS WITH. A pager
    // that dropped it returns page one again, which looks like a working pager.
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      `cursor=${encodeURIComponent(first.data.nextCursor!)}`,
    )
    if (second.status !== 'ok') throw new Error('fixture did not parse as ok')
    expect(second.data.items[0]?.identifier).not.toBe(
      first.data.items[0]?.identifier,
    )
    // …and the walk terminates rather than cycling.
    expect(second.data.nextCursor).toBeNull()
  })

  it('a roadmap column', async () => {
    serve('roadmap.json')
    const tab = await loadRoadmap('MOTIR')
    if (tab.status !== 'ok') throw new Error('fixture did not parse as ok')

    const column = tab.data.columns.find((c) => c.nextCursor)
    expect(column, 'no recorded column pages').toBeDefined()
    expect(column!.nextCursor).toBeTruthy()
  })
})
