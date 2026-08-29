import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from '@/app/_components/SiteHeader'
import { copy } from '@/lib/copy'
import sitemap from '@/app/sitemap'
import { siteUrl } from '@/lib/siteOrigin'

/*
 * The nav entrance for `/design` (MOTIR-1043) — the site's FIRST internal
 * second route, and therefore the first nav item that can ever be current.
 *
 * ⚠️ BOTH BRANCHES. The bar and the `md:hidden` menu panel are two separate
 * branches of one component, which is exactly how a current-page treatment
 * ends up existing on desktop only — the design asset draws the open panel
 * (panel 4) rather than describing it, for that reason.
 */

const pathname = vi.hoisted(() => ({ value: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }))

afterEach(() => {
  pathname.value = '/'
})

function bar() {
  return screen.getAllByRole('navigation', { name: copy.nav.ariaLabel })[0]
}

describe('the Design nav entry', () => {
  it('ships in the desktop bar, beside Explore and Docs', () => {
    render(<SiteHeader />)
    const link = within(bar()).getByRole('link', { name: copy.nav.design })
    expect(link).toHaveAttribute('href', '/design')
  })

  it('is a next/link — the one internal destination in the bar other than the root', () => {
    render(<SiteHeader />)
    // `next/link` renders an `<a>`, but the tell that it is one is that the
    // href is site-RELATIVE: every other bar destination is a different origin,
    // where prefetching and client routing mean nothing.
    for (const label of [copy.nav.explore, copy.nav.docs]) {
      expect(
        within(bar()).getByRole('link', { name: label }).getAttribute('href'),
      ).toMatch(/^https?:\/\//)
    }
    expect(
      within(bar()).getByRole('link', { name: copy.nav.design }),
    ).toHaveAttribute('href', '/design')
  })

  it('exposes the current page to assistive technology on /design, and only there', () => {
    render(<SiteHeader />)
    expect(
      within(bar()).getByRole('link', { name: copy.nav.design }),
    ).not.toHaveAttribute('aria-current')

    pathname.value = '/design'
    screen.getByRole('banner')
    render(<SiteHeader />)
    const onPage = screen
      .getAllByRole('link', { name: copy.nav.design })
      .filter((el) => el.getAttribute('aria-current') === 'page')
    expect(onPage.length).toBeGreaterThan(0)
  })

  it('carries the SHIPPED current-page treatment — accent ink at weight 600', () => {
    /*
     * `ExploreTopBar`'s own pairing, and the number that turned it on: 0.1.0
     * measured 4.41:1 in dark (under AA) and the pinned 0.1.1 measures 5.76:1
     * (MOTIR-3872 / MOTIR-3874). `tests/aaMatrix.test.ts` re-measures it over
     * every palette; this asserts the page actually WEARS it.
     *
     * `font-semibold` is the non-colour channel WCAG 1.4.1 asks for, so it is
     * asserted beside the ink rather than left to the eye.
     */
    pathname.value = '/design'
    render(<SiteHeader />)
    const link = screen.getAllByRole('link', { name: copy.nav.design })[0]
    expect(link.className).toContain('text-(--el-accent-on-surface)')
    expect(link.className).toContain('font-semibold')
  })

  it('draws the treatment in the md:hidden panel TOO, not only on desktop', async () => {
    pathname.value = '/design'
    const user = userEvent.setup()
    render(<SiteHeader />)
    await user.click(screen.getByRole('button', { name: copy.nav.menu }))
    const panel = document.getElementById('site-menu')
    expect(panel).not.toBeNull()
    const link = within(panel as HTMLElement).getByRole('link', {
      name: copy.nav.design,
    })
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link.className).toContain('text-(--el-accent-on-surface)')
  })
})

describe('app/sitemap.ts', () => {
  it('gains the /design line in the same change that adds the route', () => {
    expect(sitemap().map((entry) => entry.url)).toEqual([
      siteUrl('/'),
      siteUrl('/design'),
    ])
  })
})
