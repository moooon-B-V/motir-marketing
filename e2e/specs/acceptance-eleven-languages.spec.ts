import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { SITE_ORIGIN, TENANT_ORIGIN } from '../stub/origin'
import { catalogue, leaves, t } from '../support/catalogue'
import {
  CJK_FAMILIES,
  DEFAULT_FAMILY,
  fetchedFamilies,
  SET_FAMILIES,
  settleFonts,
  watchFontRequests,
} from '../support/fontFaces'

/*
 * ⚠️ THE ACCEPTANCE WALK FOR ELEVEN LANGUAGES (MOTIR-7968) — Story MOTIR-7737,
 * PACED FOR A PERSON TO WATCH.
 *
 * The story's twelve Verification steps, in order, as one signed-out visitor:
 * ONE test, ONE context, ONE page, so the run yields ONE video. A new browser
 * language is the `Accept-Language` header and a fresh visit is
 * `clearCookies()` — the server decides only from the header and the cookie,
 * so that is the state a new browser profile gives, kept on one clip.
 *
 * ⚠️ THE HEADER IS SET ON THE ROUTE, NOT WITH `setExtraHTTPHeaders`. Chromium
 * writes its own `Accept-Language` (from the context's locale) over an extra
 * header of that name, so a page told `ja` still asked for `en-US` and was
 * never moved — measured on this lane. `route.continue` sends what it is given.
 *
 * Every expected string is read from `messages/<locale>.json` through
 * `e2e/support/catalogue.ts`. The only non-Latin text typed here is the
 * switcher's endonym list and the four Han characters case 9 draws.
 *
 * Every `beat()` is pacing, NOT a wait for state: each assertion waits on a
 * response, a URL, a rendered attribute or the font set settling.
 */

// Twelve journeys at a watchable pace: set here so the other specs keep the
// lane's tighter budget, as the sibling acceptance specs do.
test.setTimeout(300_000)

/** Pacing for the recording. NOT a wait for state — see the header. */
const beat = (page: Page, ms = 900) => page.waitForTimeout(ms)

/*
 * CHAPTERS ARE MEASURED, NEVER AUTHORED: `chapter()` stamps the real elapsed
 * time as the walk reaches each step, and `chapters.json` is written beside
 * the video so an index is never read against another run's recording.
 */
const chapters: { label: string; tSeconds: number }[] = []
const startedAt = Date.now()
const chapter = (label: string) => {
  chapters.push({ label, tSeconds: (Date.now() - startedAt) / 1000 })
}

test.afterEach(({}, testInfo) => {
  writeFileSync(
    testInfo.outputPath('chapters.json'),
    JSON.stringify(chapters, null, 2),
  )
})

/** The switcher's entries, in the order and the scripts the bar lists them. */
const ENDONYMS = [
  'English',
  '中文',
  '日本語',
  '한국어',
  'Deutsch',
  'Français',
  'Español',
  'Italiano',
  'Nederlands',
  'Polski',
  'Português',
]
const ORDER = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt']

/** The four characters whose drawn form differs between the Han regions. */
const HAN = '直 化 骨 誤'

const html = (page: Page) => page.locator('html')
/** The landing's lede — the line that proves the language, now that the
 *  headline, "Vibe the project", is English in every catalogue. */
const lede = (page: Page) => page.locator('[data-hero-lede]')

/** Open the globe and choose a language, by its `lang`; waits on the page. */
async function choose(page: Page, locale: string) {
  await page.locator('button[aria-controls="language-menu"]').click()
  await beat(page, 600)
  await page.locator(`#language-menu a[lang="${locale}"]`).click()
  await expect(html(page)).toHaveAttribute('lang', locale)
}

/** A visit from a browser asking for `language`, with no cookie. */
async function freshVisitor(page: Page, language: string) {
  await page.context().clearCookies()
  await browserLanguage(page, language)
}

/** Every request the page makes from here on asks for `language`. */
async function browserLanguage(page: Page, language: string) {
  await page.unroute('**/*')
  await page.route('**/*', (route) =>
    route.continue({
      headers: { ...route.request().headers(), 'accept-language': language },
    }),
  )
}

/*
 * A raw key path is a dotted run whose first segment is one of the catalogue's
 * own namespaces. The card's pattern alone also matches a hostname the pages
 * print as text (`app.motir.co`), which is not a key, so a match counts only
 * when it starts with a namespace `en.json` has.
 */
const RAW_KEY = /\b[a-z]+(\.[a-zA-Z]+){2,}\b/g
const NAMESPACES = new Set(
  Object.keys(catalogue('en') as Record<string, unknown>),
)

/** Case 4's two checks over one page's text. */
async function noKeyNoEnglish(page: Page, path: string, english = true) {
  const text = await page.evaluate(() => document.body.innerText)
  const rawKeys = [...text.matchAll(RAW_KEY)]
    .map((m) => m[0])
    .filter((m) => NAMESPACES.has(m.split('.')[0]!))
  expect(rawKeys, `${path} renders a raw key`).toEqual([])
  if (!english) {
    console.log(`${path}: raw keys checked; documentation prose not checked`)
    return
  }

  const french = leaves('fr')
  let checked = 0
  let skipped = 0
  const left: string[] = []
  for (const [key, value] of leaves('en')) {
    if (value.length < 25) continue
    if (french.get(key) === value) {
      skipped += 1
      continue
    }
    checked += 1
    if (text.includes(value)) left.push(key)
  }
  console.log(
    `${path}: ${checked} en.json leaves checked, ${skipped} skipped (same in fr.json)`,
  )
  expect(left, `${path} still shows English`).toEqual([])
}

/** The first family of an element's computed stack, unquoted. */
const firstFamily = (stack: string) =>
  stack.split(',')[0]!.replace(/["']/g, '').trim()

test('eleven languages on motir.co, as Story MOTIR-7737 asks to be accepted', async ({
  page,
  context,
}) => {
  // ── 1 · A JAPANESE FIRST VISIT ──────────────────────────────────────────
  chapter('A Japanese browser’s first visit')
  await freshVisitor(page, 'ja-JP,ja;q=0.9')
  await page.goto('/')
  await expect(page).toHaveURL(`${SITE_ORIGIN}/ja`)
  await expect(html(page)).toHaveAttribute('lang', 'ja')
  await expect(lede(page)).toContainText(t('ja', 'landing.hero.lede'))
  await expect(page.locator('body')).toContainText('Motir')
  await beat(page, 1600)

  // ── 2 · SWEDISH FALLS BACK TO ENGLISH ───────────────────────────────────
  chapter('Swedish falls back to English')
  await freshVisitor(page, 'sv-SE,sv')
  await page.goto('/')
  await expect(page).toHaveURL(`${SITE_ORIGIN}/`)
  await expect(html(page)).toHaveAttribute('lang', 'en')
  await expect(lede(page)).toContainText(t('en', 'landing.hero.lede'))
  await beat(page, 1400)

  // ── 3 · SWITCH TO FRENCH ────────────────────────────────────────────────
  chapter('Switch to French')
  await page.locator('button[aria-controls="language-menu"]').click()
  const entries = page.locator('#language-menu a')
  await expect(entries).toHaveCount(11)
  await expect(entries).toHaveText(ENDONYMS)
  expect(
    await entries.evaluateAll((as) => as.map((a) => a.getAttribute('lang'))),
  ).toEqual(ORDER)
  await beat(page, 1400)
  await page.locator('#language-menu a[lang="fr"]').click()
  await expect(page).toHaveURL(`${SITE_ORIGIN}/fr`)
  await expect(html(page)).toHaveAttribute('lang', 'fr')
  const remembered = await context.cookies(SITE_ORIGIN)
  expect(remembered.find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('fr')
  await beat(page, 1200)

  // ── 4 · WALK THE SITE IN FRENCH ─────────────────────────────────────────
  chapter('Walk the site in French')
  // Every product address the build prerendered in French — the build's own
  // record of `products/*` and `products/[slug]`'s static params.
  const products = Object.keys(
    (
      JSON.parse(
        readFileSync(
          join(process.cwd(), '.next', 'prerender-manifest.json'),
          'utf8',
        ),
      ) as { routes: Record<string, unknown> }
    ).routes,
  )
    .filter((path) => path.startsWith('/fr/products/'))
    .sort()
  expect(products.length).toBeGreaterThan(5)
  const walk = [
    ...products,
    '/fr/how-it-works',
    '/fr/motir-builds-itself',
    '/fr/design',
    '/fr/ideas',
    '/fr/explore',
    '/fr/explore/topic/developer-tools',
  ]
  for (const path of walk) {
    const response = await page.goto(path)
    expect(response?.status(), path).toBe(200)
    await expect(html(page)).toHaveAttribute('lang', 'fr')
    // A product whose page IS its documentation forwards to /fr/docs, whose
    // prose is outside this story (MOTIR-7739): no raw key, but no English
    // check either.
    const docs = new URL(page.url()).pathname.startsWith('/fr/docs')
    await noKeyNoEnglish(page, docs ? `${path} → docs` : path, !docs)
    await beat(page, 500)
  }

  // ── 5 · THE DESIGN AXES IN FRENCH ───────────────────────────────────────
  chapter('The design axes in French')
  await page.goto('/fr/design')
  const subline = page
    .getByRole('main')
    .getByText(t('fr', 'designShowcase.subline'), { exact: true })
  await expect(subline).toBeVisible()

  /** The paragraph's first family is a face the page loaded, not a system font. */
  const drawnInALoadedFace = async () => {
    await settleFonts(page)
    const family = firstFamily(
      await subline.evaluate((el) => getComputedStyle(el).fontFamily),
    )
    const loaded = await page.evaluate(
      (name) =>
        Array.from(document.fonts).some(
          (face) =>
            face.family.replace(/["']/g, '') === name &&
            face.status === 'loaded',
        ),
      family,
    )
    expect(loaded, `${family} is not a loaded FontFace`).toBe(true)
    await expect(subline).toHaveText(t('fr', 'designShowcase.subline'))
    return family
  }

  const pairings = page
    .getByRole('radiogroup', { name: t('fr', 'designShowcase.type.name') })
    .getByRole('radio')
  await expect(pairings).toHaveCount(6)
  const faces = new Set<string>()
  for (let index = 0; index < 6; index += 1) {
    await pairings.nth(index).click()
    await expect(pairings.nth(index)).toHaveAttribute('aria-checked', 'true')
    faces.add(await drawnInALoadedFace())
    await beat(page, 700)
  }
  // The pairings are not one face under six names.
  expect(faces.size).toBeGreaterThan(1)

  const palettes = page
    .getByRole('radiogroup', { name: t('fr', 'designShowcase.palette.name') })
    .getByRole('radio')
  for (const index of [1, 0]) {
    await palettes.nth(index).click()
    await expect(palettes.nth(index)).toHaveAttribute('aria-checked', 'true')
    await drawnInALoadedFace()
    await beat(page, 700)
  }

  // ── 6 · THE FRENCH 404 ──────────────────────────────────────────────────
  chapter('The French 404')
  const missing = await page.goto('/fr/no-such-page')
  expect(missing?.status()).toBe(404)
  await expect(html(page)).toHaveAttribute('lang', 'fr')
  await expect(page.getByRole('main')).toContainText(t('fr', 'notFound.title'))
  const doors = page.getByRole('main').getByRole('link')
  await expect(doors).toHaveCount(2)
  const doorPaths = await doors.evaluateAll((as) =>
    as.map((a) => new URL((a as HTMLAnchorElement).href).pathname),
  )
  expect(doorPaths).toEqual(['/fr/explore', '/fr'])
  await beat(page, 1400)

  // ── 7 · A FRENCH PUBLIC PROJECT ON A TENANT HOST ────────────────────────
  chapter('A French public project on a workspace host')
  await freshVisitor(page, 'fr')
  const project = await page.goto(`${TENANT_ORIGIN}/ACME`)
  expect(project?.status()).toBe(200)
  expect(project?.request().redirectedFrom()).toBeNull()
  await expect(page).toHaveURL(`${TENANT_ORIGIN}/ACME`)
  await expect(html(page)).toHaveAttribute('lang', 'fr')
  const tabs = page.getByRole('navigation', {
    name: t('fr', 'publicProject.header.navAria'),
  })
  await expect(
    tabs.getByRole('link', { name: t('fr', 'publicProject.tabs.overview') }),
  ).toBeVisible()
  await expect(
    tabs.getByRole('link', { name: t('fr', 'publicProject.tabs.changelog') }),
  ).toBeVisible()
  // The project's own words are data, and stay exactly as the owner wrote them.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Acme Roadmap' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'What Motir is' }),
  ).toBeVisible()
  await beat(page, 1600)

  // ── 8 · THE CHOICE BEATS THE BROWSER ────────────────────────────────────
  chapter('The remembered choice beats a German browser')
  await browserLanguage(page, 'de-DE,de')
  // Case 7 cleared the cookie, so French is chosen again from a German page.
  await page.goto('/')
  await expect(html(page)).toHaveAttribute('lang', 'de')
  await choose(page, 'fr')
  await beat(page, 800)
  const back = await page.goto('/')
  const hop = back?.request().redirectedFrom()
  expect(hop, 'the bare address was not moved').toBeTruthy()
  expect((await hop!.response())?.status()).toBe(307)
  await expect(page).toHaveURL(`${SITE_ORIGIN}/fr`)
  await expect(lede(page)).toContainText(t('fr', 'landing.hero.lede'))
  await beat(page, 1400)

  // ── 9 · THREE HAN SCRIPTS ───────────────────────────────────────────────
  chapter('Three Han scripts, each in its own face')
  const glyphs: Record<string, Buffer> = {}
  // ⚠️ EACH FONT REQUEST IS FILED UNDER THE DOCUMENT THAT MADE IT. The globe's
  // menu, opened on the previous page, draws the three CJK endonyms in their own
  // faces, and those requests are that page's, not the next one's.
  const byPage: { path: string; doc: string }[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (/\.woff2$/.test(url.pathname))
      byPage.push({ path: url.pathname, doc: new URL(page.url()).pathname })
  })
  for (const locale of ['zh', 'ja', 'ko'] as const) {
    await choose(page, locale)
    await expect(page).toHaveURL(`${SITE_ORIGIN}/${locale}`)
    await expect(lede(page)).toContainText(t(locale, 'landing.hero.lede'))
    // ⚠️ INJECTED UNTIL IT STAYS. The landing may still be hydrating when its
    // heading reads right, and hydration drops a node React did not render —
    // measured: one run in two lost the span before its screenshot. So the
    // line is (re)added and drawn until a screenshot of it succeeds.
    await expect(async () => {
      await page.evaluate(
        ({ text, lang }) => {
          if (document.querySelector('span[data-han]')) return
          const span = document.createElement('span')
          span.dataset['han'] = ''
          span.lang = lang
          span.textContent = text
          span.style.fontSize = '64px'
          span.style.display = 'inline-block'
          span.style.padding = '8px'
          document.querySelector('h1')!.after(span)
        },
        { text: HAN, lang: locale },
      )
      await settleFonts(page)
      glyphs[locale] = await page
        .locator('span[data-han]')
        .screenshot({ timeout: 2_000 })
    }).toPass({ timeout: 30_000 })

    const requested = byPage
      .filter(({ doc }) => doc === `/${locale}`)
      .map(({ path }) => path)
    const fetched = await fetchedFamilies(page, requested)
    expect(fetched, `/${locale} fetched its own face`).toContain(
      DEFAULT_FAMILY[locale],
    )
    const siblings: readonly string[] = Object.entries(SET_FAMILIES)
      .filter(([other]) => other !== locale)
      .flatMap(([, families]) => families)
    expect([...fetched].filter((f) => siblings.includes(f))).toEqual([])
    await beat(page, 1400)
  }
  // The same four characters, drawn in their regional forms.
  expect(glyphs.zh!.equals(glyphs.ja!)).toBe(false)

  // ── 10 · A SHARED GERMAN LINK STAYS GERMAN ──────────────────────────────
  chapter('A shared German link stays German')
  await freshVisitor(page, 'en-US,en')
  const german = await page.goto('/de')
  expect(german?.status()).toBe(200)
  expect(german?.request().redirectedFrom()).toBeNull()
  await expect(page).toHaveURL(`${SITE_ORIGIN}/de`)
  await expect(html(page)).toHaveAttribute('lang', 'de')
  await expect(lede(page)).toContainText(t('de', 'landing.hero.lede'))
  await beat(page, 1400)

  // ── 11 · CRAWL DATA ON THE JAPANESE LANDING ─────────────────────────────
  chapter('Crawl data on the Japanese landing')
  const head = await (await page.request.get('/ja', { maxRedirects: 0 })).text()
  expect(head).toMatch(/<html[^>]*\slang="ja"/)
  expect(head).toMatch(/<meta property="og:locale" content="ja_JP"/)
  const canonicals = [
    ...head.matchAll(/<link rel="canonical" href="([^"]+)"/g),
  ].map((m) => new URL(m[1]!).pathname)
  expect(canonicals).toEqual(['/ja'])
  const alternates = Object.fromEntries(
    [
      ...head.matchAll(
        /<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi,
      ),
    ].map((m) => [m[1]!, m[2]!]),
  )
  expect(Object.keys(alternates).sort()).toEqual([...ORDER, 'x-default'].sort())
  expect(new URL(alternates['x-default']!).pathname).toBe('/')
  expect(alternates['x-default']).toBe(alternates['en'])
  // The receipt on screen, so the recording carries what was parsed.
  await page.setContent(
    `<main style="font:16px/1.6 system-ui;padding:32px"><h1>/ja — head</h1><ul>${[
      'lang="ja"',
      'og:locale ja_JP',
      `canonical ${canonicals[0]}`,
      ...Object.entries(alternates).map(([l, href]) => `${l} → ${href}`),
    ]
      .map((line) => `<li>${line.replace(/</g, '&lt;')}</li>`)
      .join('')}</ul></main>`,
  )
  await beat(page, 2400)

  // ── 12 · NO CJK FONT ON THE ENGLISH LANDING ─────────────────────────────
  chapter('No CJK font on the English landing')
  await freshVisitor(page, 'en')
  const english = watchFontRequests(page)
  await page.goto('/')
  await expect(html(page)).toHaveAttribute('lang', 'en')
  await expect(page.locator('#language-menu')).toHaveCount(0)
  await settleFonts(page)
  const fetched = await fetchedFamilies(page, english)
  expect(
    fetched.size,
    'the English landing loaded its own faces',
  ).toBeGreaterThan(0)
  expect([...fetched].filter((f) => CJK_FAMILIES.includes(f))).toEqual([])
  await beat(page, 1600)
})
