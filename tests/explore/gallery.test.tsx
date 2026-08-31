import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { copy } from '@/lib/copy'
import { ExploreGallery } from '@/app/explore/_components/Gallery'
import type { ExploreQuery } from '@/lib/explore'

/*
 * The square's error state (MOTIR-4045). The API is now a network hop, so
 * failure is a REAL state, not a theoretical one: a `null` page (the loader's
 * `failed` arm) must render the error state rather than crash.
 */

const query: ExploreQuery = { rank: 'trending', window: 'week' }

const card = {
  identifier: 'DEMO',
  name: 'Demo project',
  org: { name: 'Acme', slug: 'acme' },
  description: 'A demo.',
  stats: { upvotes: 3, lastActivityAt: null },
}

describe('ExploreGallery', () => {
  it('renders the error state when the API read failed (page is null)', () => {
    render(
      <ExploreGallery
        basePath="/explore"
        query={query}
        page={null}
        heading="Trending"
      />,
    )
    expect(screen.getByText(copy.explore.errorTitle)).toBeTruthy()
    expect(screen.getByText(copy.explore.errorBody)).toBeTruthy()
  })

  it('renders the empty state when there are no public projects', () => {
    render(
      <ExploreGallery
        basePath="/explore"
        query={query}
        page={{ items: [], nextCursor: null }}
        heading="Trending"
      />,
    )
    expect(screen.getByText(copy.explore.emptyTitle)).toBeTruthy()
  })

  it('renders cards and the load-more link when there are results', () => {
    render(
      <ExploreGallery
        basePath="/explore"
        query={query}
        page={{ items: [card], nextCursor: 'next' }}
        heading="Trending public projects"
      />,
    )
    expect(screen.getByText('Demo project')).toBeTruthy()
    expect(screen.getByText(copy.explore.loadMore)).toBeTruthy()
  })
})
