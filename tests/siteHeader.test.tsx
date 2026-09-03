import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from '@/app/_components/SiteHeader'
import { copy } from '@/lib/copy'
import sitemap from '@/app/sitemap'
import { siteUrl } from '@/lib/siteOrigin'

// `app/sitemap.ts` and `app/robots.ts` read the request's host (MOTIR-4222),
// and `next/headers` throws outside a request scope. Empty headers read as
// the SITE's own host, which is what every case in this file is about; the
// per-host arms live in `tests/host/crawlSurface.test.ts`.
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

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

  it('Explore and Docs are now next/links — the bar is fully same-origin', () => {
    render(<SiteHeader />)
    // Explore and Docs moved onto motir.co (MOTIR-4045 / MOTIR-4046), so both
    // are site-relative (a `next/link`); nothing in the bar is cross-origin
    // except the app doors (Sign in / Start free).
    expect(
      within(bar())
        .getByRole('link', { name: copy.nav.explore })
        .getAttribute('href'),
    ).toBe('/explore')
    expect(
      within(bar())
        .getByRole('link', { name: copy.nav.docs })
        .getAttribute('href'),
    ).toBe('/docs')
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
  it('gains the /legal, /explore and /docs lines in the same changes that add the routes', async () => {
    // Awaited since MOTIR-4118 made the route dynamic. No API in this
    // environment, so the project entries are absent and the static list is
    // what remains — see `tests/entitySignal.test.ts` for that arm's own case.
    expect((await sitemap()).map((entry) => entry.url)).toEqual([
      siteUrl('/'),
      siteUrl('/design'),
      siteUrl('/explore'),
      siteUrl('/docs'),
      ...[
        '/docs/api',
        '/docs/api/getting-started',
        '/docs/api/stability',
        '/docs/mcp',
        '/docs/mcp/tools',
        '/docs/cli',
        '/docs/sandbox',
      ].map(siteUrl),
      siteUrl('/legal'),
      ...[
        'terms',
        'privacy',
        'cookies',
        'acceptable-use',
        'dpa',
        'subprocessors',
        'model-providers',
      ].map((slug) => siteUrl(`/legal/${slug}`)),
    ])
  })
})
