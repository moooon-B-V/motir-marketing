import { expect, test } from '@playwright/test'

/*
 * THE 404 ROOM, IN A REAL BROWSER (MOTIR-4193).
 *
 * ── ⚠️ WHY THIS IS ITS OWN SPEC AND NOT A ROW IN `e2e/routes.ts` ──────────
 *
 * `tests/mainLandmark.test.tsx` asserts that `SITE_ROUTES` is EXACTLY the set
 * of `app/**​/page.tsx` patterns it enumerates from disk. `app/not-found.tsx`
 * is not a `page.tsx` and serves no route pattern, so adding a 404 row to that
 * table would turn the `test` job red on the very assertion that keeps the
 * table honest. The 404 needs its own entry in the lane — which is this file —
 * and the design asset says so in as many words
 * (`motir-core/design/public-site/design-notes.md`, the second of MOTIR-4193's
 * two ordering traps).
 *
 * ── THE STATUS AND THE LANDMARK COUNT ARE TWO INDEPENDENT FAILURES ────────
 *
 * Before this card the page was `404` with **zero** `main` elements; a room
 * that rendered its own `<main>` inside `SiteShell` would give **two**. Only
 * the COUNT catches the second, and only the status catches the first — which
 * is the failure a `loading.tsx` introduced above any route that calls
 * `notFound()` would produce: the response head flushes at 200 and the 404
 * becomes a page that merely looks like one (MOTIR-3491, on the other host).
 * So both are asserted, on every arrival.
 *
 * ⚠️ Every wait is on an authoritative signal — the navigation response and a
 * rendered landmark — never a timeout, per the lane's own discipline.
 */

/*
 * THE FOUR ARRIVALS the design asset derives the room's doors from, and they
 * are not interchangeable: three of them throw `notFound()` from INSIDE a
 * segment whose layout renders its own `SiteShell`, and the fourth matches no
 * route at all. The nested three are the ones that would expose a second
 * landmark if Next kept the segment's layout around the boundary, so walking
 * only `/no-such-page` would assert the easy case and prove nothing about the
 * three URLs a real visitor actually arrives on.
 */
const ARRIVALS = [
  {
    what: 'a mistyped URL — no route matches at all',
    url: '/no-such-page',
  },
  {
    what: 'an unknown legal slug — notFound() under app/legal/layout.tsx',
    url: '/legal/no-such-document',
  },
  {
    what: 'an unlisted topic — notFound() under app/explore/layout.tsx',
    url: '/explore/topic/no-such-topic',
  },
  {
    what: 'a project that is not public — notFound() under app/p/[identifier]/layout.tsx',
    // The stub answers `STUB_NO_FIXTURE` (404) for an identifier it has no
    // fixture for, which is exactly the read the page turns into `notFound()`.
    url: '/p/NO-SUCH-PROJECT',
  },
] as const

for (const arrival of ARRIVALS) {
  test(`${arrival.url} — ${arrival.what}`, async ({ page }) => {
    const response = await page.goto(arrival.url)

    // A REAL 404, not a page that renders like one.
    expect(response?.status(), `${arrival.url} did not answer 404`).toBe(404)

    // The chrome supplies the landmark, and supplies exactly one of it.
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.locator('main')).toHaveCount(1)
  })
}

test('the room gives a lost visitor a way out — two doors, Explore first', async ({
  page,
}) => {
  /*
   * The defect this card exists for was not the missing landmark: it was that
   * NOTHING on the page linked anywhere, so the only way out of a 404 on
   * motir.co was the Back button. The doors are the deliverable, so they are
   * asserted rather than left to the landmark count.
   *
   * ── ⚠️ THE DOORS ARE ABSOLUTE NOW, ON EVERY HOST (MOTIR-4430) ───────────
   *
   * They used to be `/explore` and `/`. This room is worn by every host
   * `proxy.ts` serves — a tenant address that 404s a path, the tenant base
   * domain, any host the public contract does not know — and on those hosts
   * both of those paths belong to somebody else, so the two doors led back into
   * the room the visitor was already standing in. `app/not-found.tsx` is the
   * GLOBAL not-found boundary and may not read the request to tell the hosts
   * apart: a `headers()` read there makes the whole site dynamic (measured; the
   * file carries the route tables). So it spells both doors on the site origin,
   * which is the only spelling that works off the site and the same destination
   * on it.
   */
  const response = await page.goto('/no-such-page')
  expect(response?.status()).toBe(404)

  const room = page.getByRole('main')
  await expect(room).toBeVisible()

  const explore = room.getByRole('link', { name: 'Explore projects' })
  const home = room.getByRole('link', { name: 'Go to the homepage' })

  const exploreHref = await explore.getAttribute('href')
  const homeHref = await home.getAttribute('href')

  // Absolute, and on the SITE origin rather than on some other host.
  expect(new URL(exploreHref!).pathname).toBe('/explore')
  expect(new URL(homeHref!).pathname).toBe('/')
  expect(new URL(exploreHref!).origin).toBe(new URL(homeHref!).origin)

  // The ORDER is the design's whole argument about the count: the doors are a
  // RANKING, and Explore is first because three of the four arrivals wanted a
  // public project or to browse for one.
  await expect(room.getByRole('link')).toHaveCount(2)
  await expect(room.getByRole('link').first()).toHaveText('Explore projects')

  /*
   * And the destination WORKS — a door that renders and does not lead anywhere
   * is the same dead end in a different font.
   *
   * ⚠️ THE PATH IS WALKED ON THIS SERVER, NOT THE HREF. `lib/siteOrigin.ts`
   * defaults to `https://motir.co` and this lane does not override it, so
   * clicking the door would navigate to PRODUCTION from CI — the exact coupling
   * `e2e/stub/origin.ts` records having paid for once already. Overriding
   * `NEXT_PUBLIC_MOTIR_SITE_ORIGIN` for the lane was tried and reverted: ten
   * specs assert `https://motir.co` in a canonical, a sitemap or a JSON-LD
   * graph, and moving the site's origin under them would have been a far larger
   * change than this card. So the assertion above pins WHERE the door points
   * and this one pins that the destination serves.
   */
  const destination = await page.goto(new URL(exploreHref!).pathname)
  expect(destination?.status()).toBe(200)
  await expect(page).toHaveURL(/\/explore$/)
})

test('the chrome is there, and no nav item claims to be the current page', async ({
  page,
}) => {
  await page.goto('/no-such-page')

  // The header and footer the stock screen has none of.
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()

  // `isCurrent()` matches `/explore` and `/docs` and their prefixes; a 404 URL
  // is neither, so the accent treatment is absent BY DERIVATION. Asserted so a
  // later edit does not "fix" it by marking one.
  await expect(page.locator('[aria-current="page"]')).toHaveCount(0)
})
