import { expect, test, type Page } from '@playwright/test'
import { SITE_ORIGIN } from '../stub/origin'
import { HEADER_LADDER } from '../../i18n/routing'

/*
 * THE HEADER'S LANGUAGE SWITCHER (MOTIR-7953), in a real browser, on the site.
 *
 * What only a browser can show: that choosing a language is a full navigation
 * to the same page in it with the query kept, that the cookie the click writes
 * is the one `proxy.ts` then honours over the browser's own languages, and that
 * the globe is on the bar at a phone's width. Every wait is on the navigation
 * itself or a rendered attribute, never a timeout.
 */

const globe = (page: Page) => page.getByRole('button', { name: /^Language: / })
const entry = (page: Page, name: string) =>
  page
    .getByRole('group', { name: 'Choose a language' })
    .getByRole('link', { name, exact: true })

test('choosing Français moves to the same page in French and remembers it', async ({
  page,
  context,
}) => {
  await page.goto(`${SITE_ORIGIN}/explore?q=plan`)
  await globe(page).click()
  await entry(page, 'Français').click()
  await expect(page).toHaveURL(`${SITE_ORIGIN}/fr/explore?q=plan`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

  const cookies = await context.cookies(SITE_ORIGIN)
  expect(cookies.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('fr')

  // And the remembered choice beats a German browser on the bare address.
  const root = await page.request.get(`${SITE_ORIGIN}/`, {
    maxRedirects: 0,
    headers: { 'Accept-Language': 'de' },
  })
  expect(root.status()).toBe(307)
  expect(new URL(root.headers()['location']!, SITE_ORIGIN).pathname).toBe('/fr')
})

test('choosing English from a French browser stays English', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'fr-FR' })
  const page = await context.newPage()
  await page.goto(`${SITE_ORIGIN}/fr/explore`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

  await globe(page).click()
  const landed = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/explore' && r.status() === 200,
  )
  await entry(page, 'English').click()
  await landed
  // No hop back to `/fr`: the cookie was written before the navigation.
  await expect(page).toHaveURL(`${SITE_ORIGIN}/explore`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await context.close()
})

test('on a phone the globe stays on the bar and switches the page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto(`${SITE_ORIGIN}/explore`)
  await expect(globe(page)).toBeVisible()

  // The Menu panel carries no language section (MOTIR-7947 revision 2).
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page.locator('#site-menu')).toBeVisible()
  await expect(page.locator('#site-menu [hreflang]')).toHaveCount(0)

  await globe(page).click()
  const group = page.getByRole('group', { name: 'Choose a language' })
  await expect(group.getByRole('link')).toHaveCount(11)
  // It hangs from the globe and stays inside the viewport.
  const box = (await group.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(375)

  await entry(page, 'Deutsch').click()
  await expect(page).toHaveURL(`${SITE_ORIGIN}/de/explore`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
})

/*
 * THE GIVE-WAY LADDER STILL FITS (MOTIR-7947 revision 2). At each locale's
 * stored rung widths the bar shows that rung without overflowing the page;
 * one pixel under rung B it has folded to the Menu. A translator who lengthens
 * a label past a stored width turns this red rather than wrapping the bar.
 */
for (const locale of ['en', 'de', 'ja'] as const) {
  const { a, b } = HEADER_LADDER[locale]
  const prefix = locale === 'en' ? '' : `/${locale}`

  test(`the ${locale} bar fits at its stored rung widths`, async ({ page }) => {
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      )
    const nav = page.locator('header nav').first()
    const menu = page.locator('header button[aria-controls="site-menu"]')

    await page.setViewportSize({ width: a, height: 800 })
    await page.goto(`${SITE_ORIGIN}${prefix}/explore`)
    await expect(nav).toBeVisible()
    await expect(menu).toBeHidden()
    expect(await overflow()).toBeLessThanOrEqual(0)

    await page.setViewportSize({ width: b, height: 800 })
    await expect(nav).toBeVisible()
    expect(await overflow()).toBeLessThanOrEqual(0)

    await page.setViewportSize({ width: b - 1, height: 800 })
    await expect(menu).toBeVisible()
    await expect(globe(page)).toBeVisible()
    expect(await overflow()).toBeLessThanOrEqual(0)
  })
}
