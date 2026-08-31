// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  buildExploreHref,
  hasActiveFilters,
  parseExploreSearchParams,
} from '@/lib/explore'

/*
 * The square's URL-param model (MOTIR-4045) — a port of motir-core's
 * `exploreParams`. Every navigable state (rank tab, window, search, topic,
 * cursor) is a real crawlable URL param, so the param logic is the correctness
 * boundary: a tab/filter/search change must reset the cursor, and defaults must
 * be omitted so the canonical URL of the default view is a bare `/explore`.
 */

describe('parseExploreSearchParams', () => {
  it('normalises junk rank/window to the default and passes q/category/cursor through', () => {
    const q = parseExploreSearchParams({
      rank: 'nonsense',
      window: 'nonsense',
      q: '  motir  ',
      category: 'design',
      cursor: 'opaque',
    })
    expect(q.rank).toBe('trending')
    expect(q.window).toBe('week')
    expect(q.search).toBe('motir')
    expect(q.category).toBe('design')
    expect(q.cursor).toBe('opaque')
  })

  it('an explicit category override wins over the URL param', () => {
    const q = parseExploreSearchParams(
      { category: 'other' },
      { category: 'design' },
    )
    expect(q.category).toBe('design')
  })

  it('empty params yield the default query', () => {
    const q = parseExploreSearchParams({})
    expect(q).toEqual({
      search: undefined,
      category: undefined,
      rank: 'trending',
      window: 'week',
      cursor: undefined,
    })
  })
})

describe('buildExploreHref', () => {
  const base = {
    search: undefined,
    category: undefined,
    rank: 'trending' as const,
    window: 'week' as const,
    cursor: undefined,
  }

  it('the default view is a bare /explore', () => {
    expect(buildExploreHref('/explore', base)).toBe('/explore')
  })

  it('composes a rank switch and drops the default window', () => {
    expect(buildExploreHref('/explore', base, { rank: 'popular' })).toBe(
      '/explore?rank=popular',
    )
  })

  it('a rank/tab change RESETS the cursor', () => {
    const withCursor = { ...base, cursor: 'abc' }
    expect(buildExploreHref('/explore', withCursor, { rank: 'recent' })).toBe(
      '/explore?rank=recent',
    )
  })

  it('a "load more" step keeps the cursor', () => {
    expect(buildExploreHref('/explore', base, { cursor: 'abc' })).toBe(
      '/explore?cursor=abc',
    )
  })

  it('a topic page path composes its category via the base path', () => {
    const topic = { ...base, category: 'design' }
    expect(
      buildExploreHref('/explore/topic/design', topic, { search: 'x' }),
    ).toBe('/explore/topic/design?q=x&category=design')
  })
})

describe('hasActiveFilters', () => {
  it('is true only when a narrowing filter (search or topic) is active', () => {
    expect(
      hasActiveFilters({
        search: undefined,
        category: undefined,
        rank: 'trending',
        window: 'week',
      }),
    ).toBe(false)
    expect(
      hasActiveFilters({
        search: 'x',
        category: undefined,
        rank: 'trending',
        window: 'week',
      }),
    ).toBe(true)
    expect(
      hasActiveFilters({
        search: undefined,
        category: 'design',
        rank: 'trending',
        window: 'week',
      }),
    ).toBe(true)
  })
})
