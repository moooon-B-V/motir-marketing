import { expect, test } from '@playwright/test'
import { SITE_ROUTES } from '../routes'

/*
 * THE `main` LANDMARK AND ITS SKIP LINK, IN A REAL BROWSER (MOTIR-4169).
 *
 * The behavioural half of `tests/mainLandmark.test.tsx`. That one enumerates
 * `app/**​/page.tsx` from disk and reads the layout chain — the only half that
 * can catch a page NOBODY covered, because a browser needs a URL and a dynamic
 * segment has none until a parameter is supplied. This one asks the question
 * the static read cannot: what does the DOM actually contain? A landmark
 * rendered by a component the static scan never opens, or one duplicated at
 * run time by a branch it cannot follow, shows up here and only here.
 *
 * The two are joined at `e2e/routes.ts`: the vitest lane asserts that this
 * table is EXACTLY the enumerated route set, so a page added later is red in
 * `test` (seconds) before it is ever walked here.
 *
 * ⚠️ EVERY WAIT IS ON AN AUTHORITATIVE SIGNAL — a response, a rendered
 * landmark, a focused element — never a timeout, per the lane's own discipline
 * (`e2e/specs/smoke.spec.ts`).
 */

for (const route of SITE_ROUTES) {
  test(`${route.pattern} renders exactly one main landmark`, async ({
    page,
  }) => {
    const response = await page.goto(route.url)

    // ⚠️ THE STATUS IS ASSERTED FIRST, AND IT IS NOT A COURTESY. A route whose
    // stub fixture is missing renders a not-found page — which HAS a landmark,
    // because the chrome supplies it — so the landmark assertion below would
    // pass while proving nothing at all about the route named in the title.
    expect(response?.status(), `${route.url} did not serve a document`).toBe(
      200,
    )

    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.locator('main')).toHaveCount(1)
  })
}

test('the skip link is the first thing a keyboard reaches, and it lands in the content', async ({
  page,
}) => {
  /*
   * The half a landmark alone does not deliver. WCAG 2.4.1 asks for a way to
   * BYPASS the repeated banner, and `/explore` is the page the card was filed
   * from: a reader arriving here tabbed the whole bar before reaching anything
   * they came for, on every navigation.
   */
  await page.goto('/explore')
  await expect(page.getByRole('main')).toBeVisible()

  // 1. It is the FIRST focusable element in the document — before the brand
  //    link, before the nav, before the two app doors.
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: 'Skip to content' })
  await expect(skipLink).toBeFocused()

  // 2. Invisible at rest, visible under focus. `sr-only` is a clip, not
  //    `display: none`, so "reachable" and "visible" are separate questions
  //    and a skip link that never reveals itself is a sighted keyboard user's
  //    focus disappearing into nowhere.
  await expect(skipLink).toBeVisible()

  // 3. Activating it moves FOCUS, not merely the scroll position. This is the
  //    whole reason the landmark carries `tabIndex={-1}`: without it the
  //    fragment jumps and focus stays on the link, so the next Tab walks back
  //    into the nav the reader just asked to skip.
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()

  // 4. And the next Tab continues INTO the content rather than back out.
  await page.keyboard.press('Tab')
  await expect(page.locator('main')).not.toBeFocused()
})
