import { expect, test, type Page } from '@playwright/test'
import { CUSTOM_ORIGIN, SITE_ORIGIN, TENANT_ORIGIN } from '../stub/origin'

/*
 * THE CHROME ON A TENANT HOST (MOTIR-4372) — the half no jsdom test can reach.
 *
 * `tests/host/chromeLinks.test.tsx` asks the DOM what the chrome EMITS on each
 * host kind. This asks a browser what the network actually DID, which is the
 * only place two of the card's criteria live:
 *
 *   • A 404 is a property of a request, not of a string. The bug's own evidence
 *     was `hey.motir.site/explore → 404`, and nothing that renders markup can
 *     observe that.
 *   • The costly half was never a click at all. `/explore`, `/docs` and
 *     `/design` were same-origin `next/link`s, so Next RSC-PREFETCHED all three
 *     ON RENDER — three 404s per tenant page load, before the visitor touched
 *     anything. A prefetch is invisible in the DOM and invisible in a snapshot;
 *     it exists only as a request.
 *
 * ⚠️ ASSERTED AS A COUNT, NOT AS THE ABSENCE OF THREE URLS — the card says so in
 * terms, and it is the difference between a guard and a fixture. A fourth site
 * link added to the chrome next year is covered by these assertions the day it
 * is added; a list of three would report green about it for ever.
 */

/** The marketing paths this site serves and a tenant host does not. */
const MARKETING_PATHS = ['/explore', '/docs', '/design', '/legal']

/** Every response at 400 or above, as `status url`, for a legible diff. */
function recordFailures(page: Page): string[] {
  const seen: string[] = []
  page.on('response', (res) => {
    if (res.status() >= 400) seen.push(`${res.status()} ${res.url()}`)
  })
  return seen
}

/** Every distinct HOST the page reached, in the order first reached. */
function recordHosts(page: Page): string[] {
  const seen: string[] = []
  page.on('request', (req) => {
    const host = new URL(req.url()).host
    if (!seen.includes(host)) seen.push(host)
  })
  return seen
}

/**
 * Load, then let the page finish being a page.
 *
 * ⚠️ THE WAIT IS THE MEASUREMENT HERE, not pacing. A prefetch is issued after
 * hydration, so a spec that asserted at `load` would observe the exact request
 * set the bug did not produce and pass with the defect present. `networkidle`
 * is the obvious instrument and is the one Playwright warns against — on an app
 * that polls it never settles, and the failure is a timeout that reads like a
 * broken page. A bounded settle says the same thing and can only ever be
 * over-generous: everything here is served by a standalone Next server on
 * loopback.
 */
async function loadAndSettle(page: Page, url: string) {
  const response = await page.goto(url)
  await page.waitForLoadState('load')
  await page.waitForTimeout(1500)
  return response
}

/** Every href in the served document. */
function hrefsOf(page: Page): Promise<string[]> {
  return page
    .locator('a[href]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')!))
}

for (const [label, url] of [
  ['a workspace subdomain', `${TENANT_ORIGIN}/MOTIR`],
  ['a customer domain', `${CUSTOM_ORIGIN}/`],
] as const) {
  test(`${label} — a project page takes ZERO responses at 400 or above`, async ({
    page,
  }) => {
    const failures = recordFailures(page)

    const response = await loadAndSettle(page, url)
    expect(response?.status(), 'the tenant host did not serve a document').toBe(
      200,
    )

    expect(failures, failures.join('\n')).toEqual([])
  })

  test(`${label} — makes NO request off this host, which is what stops the prefetch`, async ({
    page,
  }) => {
    /*
     * ⚠️ THE PREFETCH ASSERTION, WRITTEN AS A HOST TEST, because a host is what
     * Next actually keys on: a `next/link` whose href is cross-origin is not
     * prefetched and not client-routed. That is why the fix makes these links
     * ABSOLUTE rather than merely correct — a relative-but-right href would
     * still be prefetched.
     *
     * It is also this lane's own standing rule, applied. `e2e/stub/origin.ts`
     * records what it cost the last time a spec here reached outside the
     * fixture: the suite was making cross-repository network calls on every
     * pull request and 43 of 44 specs stayed green. The chrome's links now name
     * `https://motir.co`, so a page that prefetched one would fetch PRODUCTION
     * from CI, and this is what says it does not.
     */
    const hosts = recordHosts(page)

    await loadAndSettle(page, url)

    expect(hosts, hosts.join(', ')).toEqual([new URL(url).host])
  })

  test(`${label} — every chrome link leaves for the site or stays on this host`, async ({
    page,
  }) => {
    // The card's second criterion, run against the SERVED document rather than
    // a rendered component — `curl … | grep -oE 'href="[^"]*"'`, with the grep
    // expressed as an assertion.
    await page.goto(url)
    const hrefs = await hrefsOf(page)

    // A guard on the guard: a page that rendered no chrome would satisfy every
    // assertion below vacuously.
    expect(hrefs.length).toBeGreaterThan(10)

    for (const href of hrefs) {
      if (href.startsWith('#')) continue
      if (!href.startsWith('/')) {
        // Absolute, and on a host that is deliberately not this one: motir.co's
        // own pages, the app doors, the source repository.
        expect(() => new URL(href)).not.toThrow()
        continue
      }
      // A root-relative href on a tenant host is that PROJECT's own path —
      // `publicPathFor`'s output — and never one of this site's pages.
      for (const path of MARKETING_PATHS) {
        expect(
          href === path || href.startsWith(`${path}/`),
          `${href} is served by motir.co alone and 404s on ${new URL(url).host}`,
        ).toBe(false)
      }
    }
  })
}

test('the SITE keeps the relative chrome it has always had', async ({
  page,
}) => {
  /*
   * The control, and the card's fifth criterion: the fix is a no-op on
   * `motir.co`. Without this, "no relative marketing path on a tenant host"
   * would be satisfiable by making every link absolute EVERYWHERE — which costs
   * this site its client routing and adds an origin hop to every nav click,
   * while turning both assertions above green.
   */
  const failures = recordFailures(page)

  await loadAndSettle(page, `${SITE_ORIGIN}/p/MOTIR`)
  const hrefs = await hrefsOf(page)

  for (const path of ['/', ...MARKETING_PATHS]) {
    expect(hrefs, `${path} is no longer relative on the site`).toContain(path)
  }
  expect(hrefs.filter((h) => h.startsWith('https://motir.co'))).toEqual([])
  expect(failures, failures.join('\n')).toEqual([])
})
