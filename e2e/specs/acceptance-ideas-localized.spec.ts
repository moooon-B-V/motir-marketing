import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { STUB_ORIGIN } from '../stub/origin'
import { t } from '../support/catalogue'
import { settleFonts } from '../support/fontFaces'

/*
 * ⚠️ THE ACCEPTANCE WALK FOR STORY MOTIR-7772 (MOTIR-7779) — the ideas on
 * motir.co read in the visitor's language. PACED FOR A PERSON TO WATCH.
 *
 * Japanese, Korean, German and Polish: the two CJK scripts with their own font
 * sets, and the two Latin locales whose words run longest. Each is one chapter
 * of ONE test, so the run yields ONE video: the list in that language, the idea
 * opened in place, a search by a word only that language's text holds, and the
 * text the store had only in English marked `lang="en"`. Then the English page,
 * which marks nothing, and the stub's own rules.
 *
 * ⚠️ THE STORE IS THE STUB, AND IT ANSWERS BY LOCALE. The idea reads are
 * server-side fetches inside the Next process, so `page.route()` never sees
 * them; `e2e/stub/publicApiStub.ts` serves `e2e/fixtures/ideas/<l>/` for
 * `?locale=<l>` and the English recordings otherwise. Every expectation below
 * is read from those files, and each locale's is text only its own fixture
 * holds — so a page that forgot to send its locale, and was served English or
 * another language, fails here rather than looking right.
 *
 * Every `beat()` is PACING, not a wait for state; each assertion waits on a URL,
 * a heading, the dialog or the font set settling.
 */

test.setTimeout(300_000)

/** Pacing for the recording. NOT a wait for state — see the header. */
const beat = (page: Page, ms = 1200) => page.waitForTimeout(ms)

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

/* ── the recordings ─────────────────────────────────────────────────────── */

interface FixtureIdea {
  slug: string
  kind: 'motir_buys' | 'direction'
  title: string
  pitch: string
  tags: { slug: string; label: string; labelFallback: boolean }[]
  evidence: {
    claim: string
    sourceName: string
    url: string
    claimFallback: boolean
  }[]
  fallbackFields: string[]
}

const FIXTURES = join(process.cwd(), 'e2e', 'fixtures')
const read = <T>(path: string): T =>
  JSON.parse(readFileSync(join(FIXTURES, path), 'utf8')) as T

const LOCALES = ['ja', 'ko', 'de', 'pl'] as const
type Locale = (typeof LOCALES)[number]

const OPEN = 'treatment-options-for-vet-clinics'

/** The one word of each locale's text that only the opened idea's title holds. */
const SEARCH: Record<Locale, string> = {
  ja: '治療',
  ko: '치료',
  de: 'Tierarztpraxen',
  pl: 'weterynaryjnych',
}

const ENGLISH = read<{ items: FixtureIdea[] }>('ideas.json').items
const englishIdea = (slug: string) =>
  ENGLISH.find((i) => i.slug === slug) as FixtureIdea

const store = (locale: Locale) =>
  read<{ items: FixtureIdea[] }>(`ideas/${locale}/ideas.json`).items

/** The card order on the page: the Motir-would-buy band, then the directions. */
const inPageOrder = (items: FixtureIdea[]) => [
  ...items.filter((i) => i.kind === 'motir_buys'),
  ...items.filter((i) => i.kind === 'direction'),
]

/**
 * What the cards should mark English, in DOM order: per direction card its
 * pitch, its fallback tag labels, then its first claim — the order
 * `DirectionCard` draws them; per buy card its pitch and tag labels.
 */
function expectedCardMarks(items: FixtureIdea[]): string[] {
  const out: string[] = []
  for (const idea of inPageOrder(items)) {
    if (idea.fallbackFields.includes('title')) out.push(idea.title)
    if (idea.fallbackFields.includes('pitch')) out.push(idea.pitch)
    for (const tag of idea.tags) if (tag.labelFallback) out.push(tag.label)
    const first = idea.evidence[0]
    if (idea.kind === 'direction' && first?.claimFallback) out.push(first.claim)
  }
  return out
}

/* ── the page ───────────────────────────────────────────────────────────── */

const cardTitles = (page: Page) =>
  page.locator('li[id^="idea-"] h3').allTextContents()

/** Every `[lang]` inside the idea cards: [lang, text]. */
const cardMarks = (page: Page) =>
  page
    .locator('li[id^="idea-"] [lang]')
    .evaluateAll((els) =>
      els.map((el) => [el.getAttribute('lang'), (el.textContent ?? '').trim()]),
    )

/** Every `[lang]` inside one region of the page: [lang, text]. */
const marksIn = (page: Page, selector: string) =>
  page
    .locator(`${selector} [lang]`)
    .evaluateAll((els) =>
      els.map((el) => [el.getAttribute('lang'), (el.textContent ?? '').trim()]),
    )

test('the ideas on motir.co in Japanese, Korean, German and Polish, as Story MOTIR-7772 asks to be accepted', async ({
  page,
}) => {
  startedAt = Date.now()

  for (const locale of LOCALES) {
    const items = store(locale)
    const opened = items.find((i) => i.slug === OPEN) as FixtureIdea
    const english = englishIdea(OPEN)
    const tagsGroup = t(locale, 'ideas.find.tags')

    await test.step(`${locale} — the ideas in the visitor's language`, async () => {
      // ── 1 · THE LIST ───────────────────────────────────────────────────
      chapter(`${locale} · /${locale}/ideas, each idea in ${locale}`)
      await page.goto(`/${locale}/ideas`)
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: t(locale, 'ideas.headline'),
        }),
      ).toBeVisible()
      await settleFonts(page)
      // Text that exists only in this locale's recording.
      expect(await cardTitles(page)).toEqual(
        inPageOrder(items).map((i) => i.title),
      )
      await page.locator('#list-h').scrollIntoViewIfNeeded()
      await beat(page, 1800)

      // ── 4 · THE ENGLISH, MARKED ────────────────────────────────────────
      chapter(`${locale} · what the store has only in English is marked`)
      await page.locator('#more-h').scrollIntoViewIfNeeded()
      expect(await cardMarks(page)).toEqual(
        expectedCardMarks(items).map((text) => ['en', text]),
      )
      // The tag control marks the one label the store has only in English.
      expect(
        await marksIn(page, `[role="group"][aria-label="${tagsGroup}"]`),
      ).toEqual(
        [
          ...new Set(
            items.flatMap((i) =>
              i.tags.filter((g) => g.labelFallback).map((g) => g.label),
            ),
          ),
        ].map((label) => ['en', label]),
      )
      await beat(page, 1800)

      // ── 2 · THE IDEA, OPEN IN PLACE ────────────────────────────────────
      chapter(`${locale} · an idea opened in place`)
      await page
        .locator(`#idea-${OPEN}`)
        .getByRole('link', { name: opened.title })
        .click()
      await page.waitForURL(`/${locale}/ideas?idea=${OPEN}`)
      const sheet = page.getByRole('dialog', { name: opened.title })
      await expect(sheet).toBeVisible()
      await expect(sheet).toContainText(opened.pitch)
      // The head reads the opened idea on its own (`fetchIdea`), not from the
      // list, so its title is the one assertion that reaches that read.
      await expect(page).toHaveTitle(
        new RegExp(
          `^${opened.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} · `,
        ),
      )
      await settleFonts(page)
      // Sources, URLs and figures are never translated.
      for (const [n, e] of english.evidence.entries()) {
        const source = sheet.getByRole('link', { name: e.sourceName })
        await expect(source).toHaveAttribute('href', e.url)
        expect(opened.evidence[n]?.sourceName).toBe(e.sourceName)
      }
      // The claim the store had only in English, marked — and nothing else
      // in the sheet but the fallback tag.
      expect(await marksIn(page, '[role="dialog"]')).toEqual([
        ...opened.tags
          .filter((g) => g.labelFallback)
          .map((g) => ['en', g.label]),
        ...opened.evidence
          .filter((e) => e.claimFallback)
          .map((e) => ['en', e.claim]),
      ])
      await sheet
        .getByRole('heading', { name: t(locale, 'ideas.detail.evidence') })
        .scrollIntoViewIfNeeded()
      await beat(page, 2000)
      await page.keyboard.press('Escape')
      await page.waitForURL(`/${locale}/ideas`)
      await expect(page.getByRole('dialog')).toHaveCount(0)

      // ── 3 · A SEARCH BY A TRANSLATED WORD ──────────────────────────────
      chapter(`${locale} · search by a word in ${locale}: ${SEARCH[locale]}`)
      await page.locator('#find-h').scrollIntoViewIfNeeded()
      const search = page.getByRole('textbox', {
        name: t(locale, 'ideas.find.searchAria'),
      })
      await search.pressSequentially(SEARCH[locale], { delay: 90 })
      await search.press('Enter')
      await page.waitForURL(
        `/${locale}/ideas?q=${encodeURIComponent(SEARCH[locale])}`,
      )
      await expect.poll(() => cardTitles(page)).toEqual([opened.title])
      await settleFonts(page)
      await beat(page, 1800)
    })
  }

  await test.step('en — the English page marks nothing', async () => {
    // ── 5 · THE ENGLISH CONTROL ──────────────────────────────────────────
    chapter('en · the English page: every idea in English, nothing marked')
    await page.goto('/ideas')
    await expect(
      page.getByRole('heading', { level: 1, name: t('en', 'ideas.headline') }),
    ).toBeVisible()
    expect(await cardTitles(page)).toEqual(
      inPageOrder(ENGLISH).map((i) => i.title),
    )
    expect(await cardMarks(page)).toEqual([])
    expect(
      await marksIn(
        page,
        `[role="group"][aria-label="${t('en', 'ideas.find.tags')}"]`,
      ),
    ).toEqual([])
    await page.locator('#more-h').scrollIntoViewIfNeeded()
    await beat(page, 1800)
  })
})

/* ── the stub answers by locale, and only by locale (case 6) ─────────────── */

test('the stub serves a locale its own recording, and English for none or an unknown one', async ({
  request,
}) => {
  const get = async (path: string) => {
    const res = await request.get(`${STUB_ORIGIN}/api/public/ideas${path}`)
    return { status: res.status(), body: await res.json() }
  }

  for (const path of ['', '?locale=xx', '?locale=fr', '?locale=EN']) {
    const { status, body } = await get(path)
    expect(status).toBe(200)
    expect(body.locale).toBe('en')
    expect(body.items.map((i: FixtureIdea) => i.title)).toEqual(
      ENGLISH.map((i) => i.title),
    )
  }
  expect((await get('/tags')).body.locale).toBe('en')

  for (const locale of LOCALES) {
    const list = await get(`?locale=${locale}`)
    expect(list.body.locale).toBe(locale)
    expect((await get(`/tags?locale=${locale}`)).body.locale).toBe(locale)
    const one = await get(`/${OPEN}?locale=${locale}`)
    expect(one.body).toMatchObject({ slug: OPEN, locale })
    // A search narrows that locale's text: the English word finds nothing.
    const english = await get(`?locale=${locale}&q=returns`)
    expect(english.body.total).toBe(0)
    // A slug the locale has no recording for is the loud 404, never English.
    const missing = await get(
      `/stop-returns-before-they-happen?locale=${locale}&q=x`,
    )
    expect(missing).toEqual({
      status: 404,
      body: {
        code: 'STUB_NO_FIXTURE',
        path: '/api/public/ideas/stop-returns-before-they-happen',
        locale,
        q: 'x',
      },
    })
  }
})
