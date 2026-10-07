import { writeFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { SITE_ORIGIN, STUB_ORIGIN } from '../stub/origin'

/*
 * ⚠️ THE ACCEPTANCE WALK FOR STORY MOTIR-7665 (MOTIR-7690) — motir.co/ideas read
 * live from the idea store. A visitor narrows the list by category, tag and
 * text, loads the same view cold from its URL, opens an idea in
 * place, reads its sources, and closes it with Back and with Escape. PACED FOR
 * A PERSON TO WATCH.
 *
 * The first test is the RECEIPT: its recording is published onto the story and
 * a reviewer accepts on it, so it is slowed between steps. Every `beat()` is
 * PACING, not a wait for state; every assertion still waits on an
 * authoritative signal — the URL, a heading, a card, the dialog.
 *
 * ⚠️ THE PUBLIC API IS STUBBED. `e2e/stub/publicApiStub.ts` answers the ideas
 * reads from the recordings in `e2e/fixtures/` and narrows the list the way
 * motir-core does, so a filter here shows a filtered page. The contract itself
 * is guarded in motir-core.
 *
 * ⚠️ THE FILE RUNS SERIALLY: the outage test switches the stub's ideas reads to
 * 500 for every caller, so no other test in this file may be mid-read then.
 */

test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

/** Pacing for the recording. NOT a wait for state — see the header. */
const beat = (page: Page, ms = 1400) => page.waitForTimeout(ms)

const chapters: { label: string; tSeconds: number }[] = []
let startedAt = Date.now()
const chapter = (label: string) => {
  chapters.push({ label, tSeconds: (Date.now() - startedAt) / 1000 })
}

test.afterEach(({}, testInfo) => {
  if (chapters.length) {
    writeFileSync(
      testInfo.outputPath('chapters.json'),
      JSON.stringify(chapters, null, 2),
    )
    chapters.length = 0
  }
})

const IDEA = 'stop-returns-before-they-happen'
const IDEA_TITLE = 'Stop returns before they happen'
const FILTERED = '/ideas?category=ecommerce&tag=smb&q=returns'

/** Every idea card title on the page, in order. */
const cardTitles = (page: Page) =>
  page.locator('li[id^="idea-"] h3').allTextContents()

const categories = (page: Page) => page.getByRole('group', { name: 'Category' })

test('a visitor narrows the ideas, shares the view and opens one in place, as MOTIR-7665 asks to be accepted', async ({
  page,
}) => {
  startedAt = Date.now()

  // ── 1 · THE PAGE, FROM THE STORE ─────────────────────────────────────────
  chapter('/ideas, read live from the idea store')
  await page.goto('/ideas')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Build what Motir would buy.',
    }),
  ).toBeVisible()
  await beat(page)

  chapter('Motir would buy — its own band')
  const band = page.getByRole('heading', {
    name: 'Products Motir would buy today',
  })
  await band.scrollIntoViewIfNeeded()
  await expect(band).toBeVisible()
  expect(await cardTitles(page)).toHaveLength(15)
  await beat(page, 2200)

  chapter('Every other direction, together in one list')
  const more = page.locator('#more-h')
  await more.scrollIntoViewIfNeeded()
  await expect(more).toBeVisible()
  await beat(page, 2200)

  // ── 2 · NARROWING — THE URL AND THE LIST CHANGE TOGETHER ─────────────────
  chapter('Pick a category')
  const find = page.getByRole('heading', { name: 'Find an idea' })
  await find.scrollIntoViewIfNeeded()
  await beat(page, 800)
  await categories(page)
    .getByRole('link', { name: /^E-commerce/ })
    .click()
  await page.waitForURL('/ideas?category=ecommerce')
  await expect(page.getByText('2 ideas match')).toBeVisible()
  expect(await cardTitles(page)).toEqual([
    'Make a store visible to AI shoppers',
    IDEA_TITLE,
  ])
  await beat(page)

  chapter('Add a tag')
  await page.locator('summary', { hasText: 'Tags' }).click()
  await page
    .getByRole('group', { name: 'Tags' })
    .getByRole('link', { name: /^Small businesses/ })
    .click()
  await page.waitForURL('/ideas?category=ecommerce&tag=smb')
  await expect(
    page.getByRole('link', { name: /Tag: Small businesses/ }),
  ).toBeVisible()
  await beat(page)

  chapter('Search the text')
  const search = page.getByRole('textbox', { name: 'Search the ideas' })
  await search.pressSequentially('returns', { delay: 90 })
  await search.press('Enter')
  await page.waitForURL(FILTERED)
  await expect(page.getByText('1 idea matches')).toBeVisible()
  expect(await cardTitles(page)).toEqual([IDEA_TITLE])
  await beat(page, 2000)

  // ── 3 · THE URL IS THE VIEW ──────────────────────────────────────────────
  chapter('The same URL, loaded cold, opens the same view')
  // A full document load from the address alone — what a shared link does.
  // In this tab rather than a new one, so the recording shows it.
  await page.goto('about:blank')
  const response = await page.goto(`${SITE_ORIGIN}${FILTERED}`)
  expect(response?.status()).toBe(200)
  await expect(page.getByText('1 idea matches')).toBeVisible()
  expect(await cardTitles(page)).toEqual([IDEA_TITLE])
  await expect(
    categories(page).getByRole('link', { name: /^E-commerce/ }),
  ).toHaveAttribute('aria-current', 'true')
  await page
    .getByRole('heading', { name: 'Find an idea' })
    .scrollIntoViewIfNeeded()
  await beat(page, 2200)

  // ── 4 · AN IDEA OPENS IN PLACE ───────────────────────────────────────────
  chapter('Open the idea in place')
  await page.getByRole('link', { name: IDEA_TITLE }).click()
  await page.waitForURL(`${FILTERED}&idea=${IDEA}`)
  const sheet = page.getByRole('dialog', { name: IDEA_TITLE })
  await expect(sheet).toBeVisible()
  await beat(page, 2000)

  chapter('Its evidence, with the source one click away')
  const evidence = sheet.getByRole('heading', { name: 'The evidence' })
  await evidence.scrollIntoViewIfNeeded()
  const source = sheet.getByRole('link', {
    name: /National Retail Federation/,
  })
  await expect(source).toHaveAttribute('href', /^https:\/\/nrf\.com\//)
  await expect(source).toHaveAttribute('target', '_blank')
  await source.hover()
  await beat(page, 2400)

  chapter('The gap')
  await sheet.getByRole('heading', { name: 'The gap' }).scrollIntoViewIfNeeded()
  await beat(page, 1800)

  // ── 5 · CLOSING — BACK, THEN ESCAPE ──────────────────────────────────────
  chapter('Back closes it, the filters stay')
  await page.goBack()
  await page.waitForURL(FILTERED)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await cardTitles(page)).toEqual([IDEA_TITLE])
  await beat(page)

  chapter('Escape closes it too')
  await page.getByRole('link', { name: IDEA_TITLE }).click()
  await page.waitForURL(`${FILTERED}&idea=${IDEA}`)
  await expect(page.getByRole('dialog', { name: IDEA_TITLE })).toBeVisible()
  await beat(page)
  await page.keyboard.press('Escape')
  await page.waitForURL(FILTERED)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('link', { name: IDEA_TITLE })).toBeFocused()
  await beat(page, 2000)
})

/* ── the cases the receipt does not need to show ──────────────────────────── */

test('a search with no match shows the no-match state, and clearing returns the whole page', async ({
  page,
}) => {
  await page.goto('/ideas?tag=smb')
  const search = page.getByRole('textbox', { name: 'Search the ideas' })
  await search.fill('zzzz unicorn compiler')
  await search.press('Enter')
  await page.waitForURL('/ideas?tag=smb&q=zzzz+unicorn+compiler')
  await expect(
    page.getByRole('heading', { name: 'No idea matches these filters' }),
  ).toBeVisible()
  await expect(page.getByText('No ideas match')).toBeVisible()
  expect(await cardTitles(page)).toEqual([])
  await page.getByRole('link', { name: 'Clear all filters' }).click()
  await page.waitForURL('/ideas')
  await expect(page.getByText('15 ideas')).toBeVisible()
  expect(await cardTitles(page)).toHaveLength(15)
})

test('a shared link to an idea opens it on first paint; its close replaces the URL; an unknown one opens the list', async ({
  page,
}) => {
  await page.goto(`/ideas?category=legal&idea=${IDEA}`)
  // Outside the filters, read by its slug.
  await expect(page.getByRole('dialog', { name: IDEA_TITLE })).toBeVisible()
  await expect(page).toHaveTitle(new RegExp(`^${IDEA_TITLE}`))
  await page.getByRole('link', { name: 'Close' }).click()
  await page.waitForURL('/ideas?category=legal')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  const unknown = await page.goto('/ideas?idea=no-such-idea')
  expect(unknown?.status()).toBe(200)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await cardTitles(page)).toHaveLength(15)
})

test('at a phone width, an idea opens full-screen and closes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/ideas?category=ecommerce')
  await page.getByRole('link', { name: IDEA_TITLE }).click()
  await page.waitForURL(`/ideas?category=ecommerce&idea=${IDEA}`)
  const sheet = page.getByRole('dialog', { name: IDEA_TITLE })
  await expect(sheet).toBeVisible()
  const box = await sheet.boundingBox()
  expect(box?.width).toBe(390)
  await sheet.getByRole('link', { name: 'Close' }).click()
  await page.waitForURL('/ideas?category=ecommerce')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  // No sideways scroll at phone width.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('with motir-core unreachable, the page shows its error state', async ({
  page,
}) => {
  // A view no other test reads, so the site's data cache cannot answer it.
  const view = `/ideas?q=down-${Date.now()}`
  const failing = await page.request.post(
    `${STUB_ORIGIN}/__stub/ideas?mode=failing`,
  )
  expect(failing.status()).toBe(204)
  try {
    const response = await page.goto(view)
    expect(response?.status()).toBe(200)
    const status = page.getByRole('status').filter({
      hasText: 'The ideas could not be loaded right now',
    })
    await expect(status).toBeVisible()
    await expect(
      status.getByRole('link', { name: 'Try again' }),
    ).toHaveAttribute('href', view)
    expect(await cardTitles(page)).toEqual([])
  } finally {
    await page.request.post(`${STUB_ORIGIN}/__stub/ideas?mode=ok`)
  }
})
