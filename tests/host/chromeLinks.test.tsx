import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SiteShell } from '@/app/_components/SiteShell'
import { copy } from '@/lib/copy'
import {
  DESIGN,
  DOCS,
  EXPLORE,
  SITE_PATHS,
  SITE_ROOT,
} from '@/lib/destinations'
import { SITE_HOST, siteLinkFor, type PublicHost } from '@/lib/publicHost'
import { SITE_ORIGIN, siteUrl } from '@/lib/siteOrigin'

/*
 * THE SHARED CHROME'S SITE LINKS, ON EACH HOST KIND (MOTIR-4372).
 *
 * ⚠️ THE AXIS THIS FILE ADDS IS THE HOST KIND, NOT THE LINKS. Every link
 * asserted below was already covered — `tests/destinations.test.ts` pins each
 * constant and `tests/siteHeader.test.tsx` asserts the bar emits them — and the
 * whole `origin/main` suite passed with the defect present, because every one of
 * those cases asks the question ON `motir.co`, the one host where the answer was
 * right. The chrome renders byte-identically on a tenant host, where `/explore`,
 * `/docs`, `/design` and all three legal paths are 404s, so the markup a reader
 * compares between the two hosts shows AGREEMENT rather than a bug.
 *
 * `tests/host/tenantLinks.test.tsx` is this file's sibling and covers the
 * mirror question — a PROJECT's own paths on each host kind (`publicPathFor`).
 * Together they are the two halves of the per-host address model: where does a
 * project's page live, and where does the SITE's own page live.
 *
 * ⚠️ AND IT QUANTIFIES OVER `SITE_PATHS` RATHER THAN NAMING THREE LINKS. The
 * defect was not one wrong href — all seven were wrong, identically — so a test
 * that enumerates a subset proves nothing about the rest, and nothing at all
 * about the eighth site link somebody adds next year.
 */

const pathname = vi.hoisted(() => ({ value: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }))

afterEach(() => {
  pathname.value = '/'
})

const WORKSPACE: PublicHost = {
  kind: 'workspace',
  host: 'acme.motir.site',
  origin: 'https://acme.motir.site',
}
const CUSTOM: PublicHost = {
  kind: 'project',
  host: 'roadmap.acme.com',
  origin: 'https://roadmap.acme.com',
}

/** Every href the chrome emits, in document order, with the menu panel OPEN. */
async function chromeHrefs(host: PublicHost): Promise<string[]> {
  const user = userEvent.setup()
  const { container } = render(<SiteShell host={host}>content</SiteShell>)
  // The bar and the `md:hidden` panel are two branches rendering the same
  // items, which is exactly how a treatment ends up existing on desktop only
  // (`SiteHeader`'s own note). Opening the panel puts both in one sweep.
  await user.click(screen.getByRole('button', { name: copy.nav.menu }))
  return [...container.querySelectorAll('a[href]')].map((a) =>
    a.getAttribute('href')!,
  )
}

describe('on the site, the chrome is EXACTLY what it has always been', () => {
  it('emits every site path as the root-relative href it already was', async () => {
    const hrefs = await chromeHrefs(SITE_HOST)
    for (const path of SITE_PATHS) expect(hrefs).toContain(path)
  })

  it('introduces NO absolute URL on this host', async () => {
    // The card's fifth criterion, asserted rather than reasoned about: the fix
    // must be a no-op on `motir.co`. `SITE_ORIGIN` appearing in a chrome href
    // here would mean a redirect hop and a lost `next/link` on every page of
    // the marketing site, in exchange for nothing.
    const hrefs = await chromeHrefs(SITE_HOST)
    expect(hrefs.filter((h) => h.startsWith(SITE_ORIGIN))).toEqual([])
  })
})

describe.each([
  ['a workspace subdomain', WORKSPACE],
  ['a customer domain', CUSTOM],
])('on %s', (_label, host) => {
  it('emits every site path ABSOLUTELY, on the site origin', async () => {
    const hrefs = await chromeHrefs(host)
    for (const path of SITE_PATHS) {
      expect(hrefs).toContain(siteLinkFor(host, path))
      expect(hrefs).toContain(new URL(path, `${SITE_ORIGIN}/`).toString())
    }
  })

  it('emits NO root-relative href at all — the regression signal', async () => {
    /*
     * The criterion the card measures with `curl … | grep -oE 'href="[^"]*"'`,
     * asked of the chrome alone (the shell is rendered with inert children, so
     * every href here is the chrome's own).
     *
     * ⚠️ ASSERTED AS A COUNT OVER THE WHOLE SET, not as the absence of three
     * URLs. A root-relative href in this chrome resolves against the TENANT
     * host, which serves that workspace's projects and nothing else — so it is
     * a 404 whatever it spells, including one added after this test was
     * written. `#main` is the skip link and is a fragment, not a path.
     */
    const hrefs = await chromeHrefs(host)
    expect(hrefs.filter((h) => h.startsWith('/'))).toEqual([])
  })

  it('sends the brand lockup HOME, not to the tenant’s own root', async () => {
    // Both `SiteHeader` and `SiteFooter` described this link as "motir.co's own
    // root" while emitting `/`, which on these two host kinds is the WORKSPACE's
    // root or the PROJECT's. The prose was the intent; the href was not.
    const hrefs = await chromeHrefs(host)
    const home = siteLinkFor(host, SITE_ROOT)
    expect(home).toBe(`${SITE_ORIGIN}/`)
    expect(hrefs.filter((h) => h === home)).toHaveLength(2)
  })

  it('marks NO nav item current, whatever the path happens to spell', async () => {
    /*
     * A workspace whose project identifier is `explore` is served at
     * `acme.motir.site/explore`. A current-page test that compares the pathname
     * to the item's path alone would light Explore up there — on a page that is
     * a customer's project, not this site's directory. `isCurrent` asks the host
     * kind first, so the answer is false by construction rather than by luck.
     */
    pathname.value = EXPLORE
    const { container } = render(<SiteShell host={host}>content</SiteShell>)
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0)
  })

  it('keeps the app doors exactly as they were — already absolute, already elsewhere', async () => {
    // The card names these as the SHAPE of the fix: `/sign-in`, `/sign-up` and
    // the follow CTA were absolute and worked, on every host. Nothing here
    // touches them, and this says so.
    const { container } = render(<SiteShell host={host}>content</SiteShell>)
    const bar = within(screen.getByRole('banner'))
    expect(bar.getByRole('link', { name: copy.nav.signIn })).toHaveAttribute(
      'href',
      expect.stringContaining('/sign-in'),
    )
    expect(
      [...container.querySelectorAll('a[href]')].filter((a) =>
        a.getAttribute('href')!.includes('github.com'),
      ),
    ).toHaveLength(1)
  })
})

describe('siteLinkFor', () => {
  it('is a no-op on the site and absolute everywhere else', () => {
    for (const path of [SITE_ROOT, EXPLORE, DOCS, DESIGN, '/legal/terms']) {
      expect(siteLinkFor(SITE_HOST, path)).toBe(path)
      expect(siteLinkFor(WORKSPACE, path)).toBe(
        new URL(path, `${SITE_ORIGIN}/`).toString(),
      )
    }
  })

  it('builds from `lib/siteOrigin.ts`, so a preview build links its OWN site', () => {
    /*
     * ⚠️ ASSERTED AGAINST `siteUrl()` RATHER THAN AGAINST `https://motir.co`.
     * The site origin has a DEFAULT (`lib/siteOrigin.ts` explains why it does
     * and `appOrigin` does not), so it is the production value in this suite —
     * which means a literal expectation here would pass just as well if the
     * helper had hardcoded the string, and a preview deployment's chrome would
     * send every visitor to production. Comparing the two functions is what
     * says the override is honoured.
     */
    expect(siteLinkFor(WORKSPACE, EXPLORE)).toBe(siteUrl(EXPLORE))
    expect(siteLinkFor(CUSTOM, SITE_ROOT)).toBe(siteUrl(SITE_ROOT))
  })
})
