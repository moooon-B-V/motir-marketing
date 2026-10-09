import { expect, test, type Page } from '@playwright/test'
import { t } from '../support/catalogue'
import {
  CJK_FAMILIES,
  fetchedFamilies,
  SET_FAMILIES,
  settleFonts,
  watchFontRequests,
} from '../support/fontFaces'

/*
 * EACH LOCALE FETCHES ONLY ITS OWN SCRIPT'S FACES (MOTIR-7952).
 *
 * `app/fonts.ts` declares every CJK face on every page, and the claim that
 * this costs an English page nothing is a claim about the BROWSER: a face's
 * `unicode-range` slice is fetched only when an element's `font-family` names
 * the family AND a rendered character falls in the slice, and the installed
 * `theme.css` names a CJK family only under that locale's `:lang()` block. A
 * source read cannot prove that, so this spec watches the network.
 *
 * ⚠️ THE PAGES CARRY NO CJK TEXT YET, SO THE SPEC SUPPLIES A PROBE LINE. Until
 * the catalogue cards land, `/ja` renders English words, and English words are
 * drawn by the pairing's Latin face in front of the set's — so an unprobed
 * `/ja` fetches nothing at all and would prove nothing. The probe mixes all
 * three scripts (the five Han characters MOTIR-7880 named, kana and hangul),
 * so a page that drew a sibling locale's face for any of them would fetch it
 * here. It is added under `<main>`, so it inherits the page's `lang` exactly
 * as real copy will.
 *
 * Every wait is on an authoritative signal — a FontFace reaching `loaded`, a
 * `document.fonts.ready` after a layout — never a timeout.
 */

const PROBE = '的 色 了 过 直 ひらがな カタカナ 한국어'

/** Add the probe line under `<main>` and let the browser lay it out. */
async function renderProbe(page: Page): Promise<void> {
  await page.evaluate((text) => {
    const probe = document.createElement('p')
    probe.dataset['fontProbe'] = ''
    probe.textContent = text
    document.querySelector('main')!.prepend(probe)
  }, PROBE)
  await settleFonts(page)
}

test('the English landing fetches no CJK file, even for CJK characters', async ({
  page,
}) => {
  const requested = watchFontRequests(page)
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  await renderProbe(page)

  const fetched = await fetchedFamilies(page, requested)
  expect([...fetched].filter((f) => CJK_FAMILIES.includes(f))).toEqual([])
})

for (const locale of ['zh', 'ja', 'ko'] as const) {
  test(`/${locale} fetches its own set's face and neither sibling's`, async ({
    page,
  }) => {
    const requested = watchFontRequests(page)
    await page.goto(`/${locale}`)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await renderProbe(page)

    const own = SET_FAMILIES[locale][0]
    // The positive signal first: the set's default sans face actually loaded.
    await expect
      .poll(() =>
        page.evaluate(
          (family) =>
            Array.from(document.fonts).some(
              (face) =>
                face.family.replace(/["']/g, '') === family &&
                face.status === 'loaded',
            ),
          own,
        ),
      )
      .toBe(true)

    const fetched = await fetchedFamilies(page, requested)
    expect(fetched).toContain(own)
    const siblings: readonly string[] = Object.entries(SET_FAMILIES)
      .filter(([other]) => other !== locale)
      .flatMap(([, families]) => families)
    expect([...fetched].filter((f) => siblings.includes(f))).toEqual([])
  })
}

test('/ja/design keeps the ja set behind every one of the six pairings', async ({
  page,
}) => {
  await page.goto('/ja/design')
  const pairings = page
    // The group's name is the catalogue's, so it reads in Japanese here.
    .getByRole('radiogroup', { name: t('ja', 'designShowcase.type.name') })
    .getByRole('radio')
  await expect(pairings).toHaveCount(6)

  const paragraph = page.getByRole('main').locator('p').first()
  for (let index = 0; index < 6; index += 1) {
    const pairing = pairings.nth(index)
    await pairing.click()
    await expect(pairing).toHaveAttribute('aria-checked', 'true')
    // The composed stack: the pairing's Latin face, then the ja set's face —
    // never the pairing alone over a system fallback.
    await expect
      .poll(() =>
        paragraph.evaluate((element) => getComputedStyle(element).fontFamily),
      )
      .toMatch(/Noto (Sans|Serif) JP/)
  }
})

test('a Polish heading is drawn in the pairing face, as an English one is', async ({
  page,
}) => {
  const headingFamily = () =>
    page
      .getByRole('heading', { level: 1 })
      .first()
      .evaluate((element) => getComputedStyle(element).fontFamily)

  await page.goto('/')
  const english = await headingFamily()
  await page.goto('/pl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
  const polish = await headingFamily()

  expect(polish).toBe(english)
  for (const family of CJK_FAMILIES) expect(polish).not.toContain(family)
})
