import { expect, test } from '@playwright/test'

/*
 * THE DOCS RAIL'S BOX, MEASURED (MOTIR-4432).
 *
 * ⚠️ WHY THIS IS IN THE BROWSER LANE AND NOT BESIDE `tests/docs/docsRail.test.tsx`.
 * That file covers the rail thoroughly — the tiers, the filter, the count line,
 * `aria-current`, the narrow disclosure — and it could not have caught the
 * defect this spec exists for, because jsdom computes no layout: every
 * `getBoundingClientRect()` there is zeroes, so a height comparison reads
 * `0 === 0` and passes on any markup at all. The only assertion available in
 * that lane is a class-name one, and a class-name assertion for an ABSENT class
 * (`items-start`) passes on markup that never had it — it agrees with the fix
 * and with a rail deleted outright. So the guard has to run somewhere boxes
 * exist, which is here.
 *
 * ⚠️ WHAT IT GUARDS, AND WHY IT TAKES TWO ASSERTIONS RATHER THAN ONE.
 * The rail has two jobs that cannot live on one element, and each one-element
 * arrangement breaks the other:
 *
 *   - `align-items: start` on the shell's grid shrinks the rail to its own rows,
 *     which is what makes `position: sticky` engage — and it ends the tint and
 *     the right border where the rows end. Shipped state before this card: 283px
 *     of rail against a 931px reading column on `/docs`, and 900px against
 *     86400px on `/docs/api`.
 *   - Deleting `align-items: start` and leaving the sticky where it was gives a
 *     full-height rail whose sticky never engages — measured at `top: -260` after
 *     a 600px scroll. The rail scrolls away, which is the defect the class was
 *     added to prevent.
 *
 * A spec that asserted only the first would go green on the second arrangement,
 * which is the cheapest wrong fix available and the one a reader reaches for.
 * Both are asserted for that reason.
 *
 * `/docs` is the page under test because it is the cheapest instance the defect
 * appears on: no operation tier, no upstream fetch (the guides route group
 * performs none — `app/docs/(guides)/layout.tsx`), and a reading column three
 * times the rail's own height.
 */

/** The card's own measurement viewport, and comfortably above the `md` breakpoint. */
const WIDE = { width: 1440, height: 900 }
/** Below `md` (768px) — the layout the rail collapses into. */
const NARROW = { width: 390, height: 844 }

/**
 * The three boxes this file is about, read in one pass.
 *
 * The walk is structural because the thing under test is structural: two grid
 * items and the sticky region inside one of them. Only the rail has an
 * accessible name, so the other two are reached from it — and the walk asserts
 * what it found rather than trusting it, so a future re-shuffle of the shell
 * fails loudly here instead of quietly measuring the wrong element.
 */
async function measure(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const rail = document.querySelector<HTMLElement>(
      'nav[aria-label="Documentation"]',
    )
    if (!rail) throw new Error('no rail: nav[aria-label="Documentation"]')

    const shell = rail.parentElement
    if (!shell || !getComputedStyle(shell).display.includes('grid')) {
      throw new Error("the rail's parent is not the docs grid")
    }

    const column = shell.lastElementChild
    if (!column || column === rail) {
      throw new Error('the docs grid has no reading column beside the rail')
    }

    const inner = rail.firstElementChild
    if (!inner) throw new Error('the rail has no inner region')

    const box = (el: Element) => {
      const r = el.getBoundingClientRect()
      return { top: r.top, height: r.height, width: r.width, bottom: r.bottom }
    }
    return {
      rail: box(rail),
      column: box(column),
      inner: box(inner),
      alignItems: getComputedStyle(shell).alignItems,
    }
  })
}

test.describe('the docs rail at the wide layout', () => {
  test.use({ viewport: WIDE })

  test("the rail's surface spans the reading column", async ({ page }) => {
    const response = await page.goto('/docs')
    expect(response?.status(), '/docs did not serve a document').toBe(200)
    await expect(
      page.getByRole('navigation', { name: 'Documentation' }),
    ).toBeVisible()

    const { rail, column, inner } = await measure(page)

    /*
     * ⚠️ THE PREMISE IS ASSERTED FIRST, because the equality below is VACUOUS on
     * a page whose content happens to be shorter than the rail's own rows — and
     * two of the eight `/docs` routes are exactly that. If `/docs` ever becomes
     * one of them, this line goes red and says so, rather than leaving a test
     * that passes without measuring anything. 200px is a floor, not the observed
     * gap (648px at the time of writing).
     */
    expect(
      column.height - inner.height,
      "the reading column is no longer meaningfully taller than the rail's own rows, so this spec would pass without testing anything",
    ).toBeGreaterThan(200)

    // The defect itself: the painted surface is the height of the row it sits
    // in, not the height of the links inside it.
    expect(Math.abs(rail.height - column.height)).toBeLessThanOrEqual(1)
  })

  test('the rail still sticks, and its own region is capped at the viewport', async ({
    page,
  }) => {
    await page.goto('/docs')
    await expect(
      page.getByRole('navigation', { name: 'Documentation' }),
    ).toBeVisible()

    const atRest = await measure(page)
    expect(
      atRest.inner.height,
      'the rail region is not capped at the viewport, so a long operation list would push the page',
    ).toBeLessThanOrEqual(WIDE.height + 1)

    /*
     * ⚠️ SCROLL TO THE PAGE'S OWN BOTTOM, NOT TO A NUMBER. `/docs` is 1248px at
     * this viewport, so `scrollTo(0, 600)` clamps at 348 and a wait for
     * `scrollY === 600` never returns — a green assertion turned into a 30s
     * timeout by a constant that was never about this page. The premise the
     * test actually needs is that the rail's own top has left the viewport, and
     * that is asserted rather than assumed.
     */
    const scrollY = await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
      return window.scrollY
    })
    expect(
      scrollY,
      "the page cannot scroll past the rail's top, so the sticky assertion below would hold on a static rail too",
    ).toBeGreaterThan(atRest.rail.top + 50)
    await page.waitForFunction((y) => window.scrollY === y, scrollY)

    const scrolled = await measure(page)

    // The surface scrolls with the page — it is the full-height grid item.
    expect(scrolled.rail.top).toBeLessThan(0)
    // The region inside it does not: it pins to the top of the viewport. This is
    // the assertion that fails on a rail made full-height by deleting
    // `items-start` and leaving `position: sticky` on the surface.
    expect(Math.abs(scrolled.inner.top)).toBeLessThanOrEqual(1)
  })
})

test.describe('the docs rail below the breakpoint', () => {
  test.use({ viewport: NARROW })

  test('the rail sits above the content and scrolls with the page', async ({
    page,
  }) => {
    await page.goto('/docs')
    await expect(
      page.getByRole('navigation', { name: 'Documentation' }),
    ).toBeVisible()

    const { rail, column, inner } = await measure(page)

    // One column: the rail is above the content it navigates, never beside or
    // over it (the asset's panel 7).
    expect(rail.bottom).toBeLessThanOrEqual(column.top + 1)
    expect(Math.abs(rail.width - column.width)).toBeLessThanOrEqual(1)

    // And nothing sticks here — the rail is static, so scrolling takes it with
    // the page rather than parking it over the content.
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.waitForFunction(() => window.scrollY === 400)
    const scrolled = await measure(page)
    expect(scrolled.inner.top).toBeLessThan(inner.top)
  })
})
