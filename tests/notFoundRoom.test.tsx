import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import NotFound from '@/app/not-found'
import { copy } from '@/lib/copy'
import { EXPLORE } from '@/lib/destinations'

/*
 * THE 404 ROOM (MOTIR-4193) — the jsdom half.
 *
 * `e2e/specs/not-found.spec.ts` is the half that matters most, because the two
 * things this card is really about — that the response is a REAL 404 and that
 * the DOM carries exactly one landmark once Next has resolved the boundary —
 * are properties of a served document and cannot be observed here.
 *
 * What this file covers is the half a browser lane pays two minutes of build
 * time to reach: that the room reads its words from the CATALOGUE rather than
 * from the JSX, that both doors are same-origin paths built from the shipped
 * constants, and that the room renders no `<main>` of its own. Each of those
 * is a rule the design asset states and a later edit could quietly break with
 * every browser assertion still green.
 */

// The bar reads the pathname; a 404 URL matches no nav item, which is the
// point of the last assertion below.
vi.mock('next/navigation', () => ({ usePathname: () => '/no-such-page' }))

describe('the 404 room', () => {
  it('says what the design decided, from the copy catalogue', () => {
    render(<NotFound />)

    expect(screen.getByText(copy.notFound.eyebrow)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: copy.notFound.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(copy.notFound.lede)).toBeInTheDocument()
  })

  it('offers exactly TWO doors, Explore first, both same-origin', () => {
    render(<NotFound />)

    /*
     * The doors are a RANKING rather than a menu — the bar carries Explore /
     * Docs / Design and the footer carries all nine destinations, so the room
     * names the likeliest intent and lets the chrome carry the rest. A third
     * door added here is re-listing the nav one inch below the nav.
     */
    const room = screen.getByRole('main')
    const doors = within(room).getAllByRole('link')

    expect(doors).toHaveLength(2)
    expect(doors[0]).toHaveTextContent(copy.notFound.exploreDoor)
    expect(doors[0]).toHaveAttribute('href', EXPLORE)
    expect(doors[1]).toHaveTextContent(copy.notFound.homeDoor)
    expect(doors[1]).toHaveAttribute('href', '/')

    // Neither is built from `APP_ORIGIN`: both destinations live on THIS host,
    // so a cross-origin href here would send a lost visitor to a second site.
    for (const door of doors) {
      expect(door.getAttribute('href')).toMatch(/^\//)
    }
  })

  it('renders no `main` of its own — the chrome owns the landmark', () => {
    const { container } = render(<NotFound />)

    // One, and it is `SiteShell`'s: MOTIR-4169 moved the landmark up so no
    // page has to remember, and a second one is the defect that card removed.
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('wears the chrome the stock screen has none of', () => {
    render(<NotFound />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: copy.nav.skipToContent }),
    ).toBeInTheDocument()
  })

  it('marks no nav item current — a 404 URL is neither /explore nor /docs', () => {
    const { container } = render(<NotFound />)

    // A derivation from `isCurrent()`, not an omission. Asserted so a later
    // edit does not "fix" the missing accent by marking one.
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(0)
  })
})
