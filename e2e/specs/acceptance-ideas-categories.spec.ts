import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { t } from '../support/catalogue'
import { settleFonts } from '../support/fontFaces'

/*
 * ⚠️ THE ACCEPTANCE WALK FOR STORY MOTIR-8273 — motir.co knows the nine new
 * idea categories. PACED FOR A PERSON TO WATCH.
 *
 * `/ideas` has NO per-category section. A category reaches the page three
 * ways, and the walk shows all three for two of the new ones —
 * `silver_economy` (a consumer category, the `record` mark) and
 * `local_services` (a vertical, the `decision` mark):
 *
 * - a CHIP in the Category group, its label and its count, `aria-current`
 *   when chosen;
 * - the colour MARK on the card (`<i aria-hidden data-mark="…">`), derived
 *   from the category's group in `lib/ideas.ts` — and never the `ground`
 *   fallback a category the site does not know would take;
 * - the card's category LABEL.
 *
 * Then the chip narrows the list and writes the URL, the same URL loaded cold
 * opens the same view, an unknown category is dropped rather than turned into
 * an error page, and the English page (whose recordings hold neither new
 * category) shows no chip for either.
 *
 * ⚠️ THE STORE IS THE STUB, AND IT ANSWERS BY LOCALE. The idea reads are
 * server-side fetches inside the Next process, so `page.route()` never sees
 * them; `e2e/stub/publicApiStub.ts` serves `e2e/fixtures/ideas/zh/` for
 * `?locale=zh`. Every expectation below is read from that file — a
 * hand-written zh store, since no zh idea recording exists yet, whose category
 * labels are motir-core's `IDEA_CATEGORY_TRANSLATIONS.zh` verbatim.
 *
 * ⚠️ THIS FILE NEVER SWITCHES THE STUB'S `/__stub/ideas` MODE, so it is safe
 * to run in parallel with every other spec.
 *
 * Every `beat()` is PACING, not a wait for state; each assertion waits on a
 * URL, a heading, a locator or the font set settling.
 *
 * The story is declared by this header and the receipt's title, as every
 * acceptance spec in this repository declares it: there is no
 * `acceptanceStory()` helper here, and no CI lane publishes the clip — the
 * `e2e` job records it and the agent publishes it (see `ci.yml`'s header).
 */

test.setTimeout(120_000)

/** Pacing for the recording. NOT a wait for state — see the header. */
const beat = (page: Page, ms = 1400) => page.waitForTimeout(ms)

/*
 * CHAPTERS ARE MEASURED, NEVER AUTHORED: `chapter()` stamps the real elapsed
 * time as the walk reaches each step, written beside the video.
 */
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

/* ── the recording ──────────────────────────────────────────────────────── */

interface FixtureIdea {
  slug: string
  kind: 'motir_buys' | 'direction'
  title: string
  category: { slug: string; label: string }
}

interface FixtureStore {
  items: FixtureIdea[]
  categories: { slug: string; label: string; count: number }[]
}

const read = <T>(path: string): T =>
  JSON.parse(
    readFileSync(join(process.cwd(), 'e2e', 'fixtures', path), 'utf8'),
  ) as T

const ZH = read<FixtureStore>('ideas/zh/ideas.json')
const ENGLISH = read<FixtureStore>('ideas.json')

/** The card order on the page: the Motir-would-buy band, then the directions. */
const inPageOrder = (items: FixtureIdea[]) => [
  ...items.filter((i) => i.kind === 'motir_buys'),
  ...items.filter((i) => i.kind === 'direction'),
]

const byCategory = (slug: string) => {
  const idea = ZH.items.find((i) => i.category.slug === slug)
  const category = ZH.categories.find((c) => c.slug === slug)
  if (!idea || !category)
    throw new Error(`the zh fixture holds no ${slug} idea and chip`)
  return { idea, category }
}

const SILVER = byCategory('silver_economy')
const LOCAL = byCategory('local_services')

/** The two new categories this walk shows, with the mark each must take. */
const NEW = [
  { ...SILVER, mark: 'record' },
  { ...LOCAL, mark: 'decision' },
] as const

/* ── the page ───────────────────────────────────────────────────────────── */

const cardTitles = (page: Page) =>
  page.locator('li[id^="idea-"] h3').allTextContents()

const categoryGroup = (page: Page, locale: 'zh' | 'en' = 'zh') =>
  page.getByRole('group', { name: t(locale, 'ideas.find.categoryGroup') })

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A category chip, by the label it starts with. */
const chip = (page: Page, label: string) =>
  categoryGroup(page).getByRole('link', {
    name: new RegExp(`^${escape(label)}`),
  })

const card = (page: Page, slug: string) => page.locator(`#idea-${slug}`)

/** A card's category line: the paragraph that holds the colour mark. */
const categoryLine = (page: Page, slug: string) =>
  card(page, slug).locator('p', { has: page.locator('[data-mark]') })

test('the new idea categories on motir.co — a chip, a mark and a label, in Chinese — as Story MOTIR-8273 asks to be accepted', async ({
  page,
}) => {
  startedAt = Date.now()

  // ── 1 · THE ZH STORE ─────────────────────────────────────────────────────
  chapter('/zh/ideas — the store in Chinese, two ideas in new categories')
  await page.goto('/zh/ideas')
  await expect(
    page.getByRole('heading', { level: 1, name: t('zh', 'ideas.headline') }),
  ).toBeVisible()
  await settleFonts(page)
  expect(await cardTitles(page)).toEqual(
    inPageOrder(ZH.items).map((i) => i.title),
  )
  await beat(page, 2200)

  // ── 2 · THE CHIPS ────────────────────────────────────────────────────────
  chapter(
    `The Category control: ${SILVER.category.label} and ${LOCAL.category.label}, each with its count`,
  )
  await page.locator('#find-h').scrollIntoViewIfNeeded()
  await expect(categoryGroup(page)).toBeVisible()
  for (const { category } of NEW) {
    const c = chip(page, category.label)
    await expect(c).toBeVisible()
    await expect(c).toHaveText(`${category.label}${category.count}`)
    await expect(c.locator('span')).toHaveText(String(category.count))
    expect(category.count).toBe(1)
    await expect(c).not.toHaveAttribute('aria-current')
  }
  await settleFonts(page)
  await beat(page, 2600)

  // ── 3 · THE MARK AND THE LABEL ON EACH CARD ──────────────────────────────
  chapter('Each card: its category colour mark and its Chinese label')
  await page.locator('#more-h').scrollIntoViewIfNeeded()
  for (const { idea, category, mark } of NEW) {
    const marks = card(page, idea.slug).locator('[data-mark]')
    await expect(marks).toHaveCount(1)
    await expect(marks).toHaveAttribute('data-mark', mark)
    await expect(marks).toHaveAttribute('aria-hidden', 'true')
    await expect(marks).not.toHaveAttribute('data-mark', 'ground')
    await expect(categoryLine(page, idea.slug)).toHaveText(category.label)
  }
  await card(page, SILVER.idea.slug).scrollIntoViewIfNeeded()
  await beat(page, 2200)
  await card(page, LOCAL.idea.slug).scrollIntoViewIfNeeded()
  await beat(page, 2200)

  // ── 4 · THE CHIP NARROWS, AND WRITES THE URL ─────────────────────────────
  chapter(
    `Pick ${SILVER.category.label} — the URL and the list change together`,
  )
  await page.locator('#find-h').scrollIntoViewIfNeeded()
  await beat(page, 800)
  await chip(page, SILVER.category.label).click()
  await page.waitForURL('/zh/ideas?category=silver_economy')
  await expect.poll(() => cardTitles(page)).toEqual([SILVER.idea.title])
  await expect(
    page.getByText(t('zh', 'ideas.find.countMatchOne')),
  ).toBeVisible()
  await expect(chip(page, SILVER.category.label)).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(
    categoryGroup(page).getByRole('link', {
      name: t('zh', 'ideas.find.allCategories'),
    }),
  ).not.toHaveAttribute('aria-current')
  await settleFonts(page)
  await beat(page, 2000)

  // ── 5 · THE URL IS THE VIEW ──────────────────────────────────────────────
  chapter('/zh/ideas?category=local_services, loaded cold')
  await page.goto('about:blank')
  const response = await page.goto('/zh/ideas?category=local_services')
  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: t('zh', 'ideas.headline') }),
  ).toBeVisible()
  expect(await cardTitles(page)).toEqual([LOCAL.idea.title])
  await expect(chip(page, LOCAL.category.label)).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(
    card(page, LOCAL.idea.slug).locator('[data-mark]'),
  ).toHaveAttribute('data-mark', 'decision')
  await settleFonts(page)
  await page.locator('#find-h').scrollIntoViewIfNeeded()
  await beat(page, 1600)
  await card(page, LOCAL.idea.slug).scrollIntoViewIfNeeded()
  await beat(page, 2400)
})

/* ── the cases the receipt does not need to show ──────────────────────────── */

test('an unknown category is dropped: the whole zh store, "All" chosen, no category chip current', async ({
  page,
}) => {
  const response = await page.goto('/zh/ideas?category=space_travel')
  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: t('zh', 'ideas.headline') }),
  ).toBeVisible()
  expect(await cardTitles(page)).toEqual(
    inPageOrder(ZH.items).map((i) => i.title),
  )
  await expect(
    categoryGroup(page).getByRole('link', {
      name: t('zh', 'ideas.find.allCategories'),
    }),
  ).toHaveAttribute('aria-current', 'true')
  for (const category of ZH.categories)
    await expect(chip(page, category.label)).toBeVisible()
  await expect(categoryGroup(page).locator('[aria-current]')).toHaveCount(1)
})

test('the English page shows no chip for a category its store does not hold', async ({
  page,
}) => {
  // The precondition, read from the recording: neither new category is in it.
  for (const slug of ['silver_economy', 'local_services']) {
    expect(ENGLISH.categories.map((c) => c.slug)).not.toContain(slug)
    expect(ENGLISH.items.map((i) => i.category.slug)).not.toContain(slug)
  }
  await page.goto('/ideas')
  await expect(
    page.getByRole('heading', { level: 1, name: t('en', 'ideas.headline') }),
  ).toBeVisible()
  const group = categoryGroup(page, 'en')
  await expect(group).toBeVisible()
  // One chip for "All" and one per category the English store holds.
  await expect(group.getByRole('link')).toHaveCount(
    ENGLISH.categories.length + 1,
  )
  for (const slug of ['silver_economy', 'local_services'])
    await expect(group.locator(`a[href*="category=${slug}"]`)).toHaveCount(0)
  for (const label of [SILVER.category.label, LOCAL.category.label])
    await expect(group.getByText(label)).toHaveCount(0)
})
