import { expect, test } from '@playwright/test'

/*
 * THE PINNED STAGE NEVER WIDENS THE PAGE.
 *
 * On a wide screen with motion allowed, the case's front panel swings open in
 * perspective (`.hiw-layer[data-layer='shell']` in globals.css). Opened, its
 * projected box reaches far past both sides of the screen — and even at zero
 * opacity it counts as scrollable overflow, so the whole page grew a
 * horizontal scroll bar from `#modules` on. `.hiw-stage` clips it.
 *
 * The wait is on the stage's own `--open` reaching 1, the signal the script
 * writes once the lid is fully open — never a timeout.
 */

test.use({ viewport: { width: 1440, height: 900 } })

test('#modules with the lid open does not scroll sideways', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const response = await page.goto('/how-it-works#modules')
  expect(response?.status()).toBe(200)

  const stage = page.locator('.hiw-stage')
  await expect
    .poll(() => stage.evaluate((el) => el.style.getPropertyValue('--open')))
    .toBe('1.0000')

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBe(clientWidth)
})
