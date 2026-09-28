import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WatchLive } from '@/app/p/[identifier]/_components/WatchLive'

/*
 * "WATCH IT BEING BUILT" (MOTIR-6745; design MOTIR-6742 panel A and E). The one
 * door from the project page into the live project — and the cost is stated
 * BEFORE the click, in the consent screen's own words.
 */

const APP = 'https://app.test.motir.co'

describe('the Watch live entry', () => {
  it('names the project and links to its Board in the app, as a plain link', () => {
    const { container } = render(<WatchLive identifier="PROD" name="Prod" />)

    expect(
      screen.getByRole('heading', { name: 'Watch Prod being built' }),
    ).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Watch live/ })
    expect(link).toHaveAttribute('href', `${APP}/p/PROD/board`)
    // Exactly one link — and it is the only way in.
    expect(container.querySelectorAll('a')).toHaveLength(1)
  })

  it('states the cost the consent screen asks, before the click', () => {
    const { container } = render(<WatchLive identifier="PROD" name="Prod" />)
    const text = container.textContent!.replace(/\s+/g, ' ')

    expect(text).toContain('You’ll need a Motir account.')
    expect(text).toContain(
      'If you continue, your name and email will be visible to this project’s workspace Managers, along with when you visit.',
    )
  })

  it('renders without the project’s name when the overview could not be read', () => {
    render(<WatchLive identifier="PROD" name={null} />)

    expect(
      screen.getByRole('heading', { name: 'Watch this project being built' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Watch live/ })).toHaveAttribute(
      'href',
      `${APP}/p/PROD/board`,
    )
  })
})
