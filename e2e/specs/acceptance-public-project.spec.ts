import { writeFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

/*
 * ⚠️ THE ACCEPTANCE WALK (MOTIR-4122) — the whole `/p/*` journey on `motir.co`,
 * PACED FOR A PERSON TO WATCH.
 *
 * This is MOTIR-3877's receipt. A reviewer watches the recording and accepts the
 * story on it, so the recorded path is deliberately slowed between steps: a run
 * that raced through the flow would satisfy the letter and defeat the point.
 * Every `beat()` below is pacing, NOT a wait for state — every assertion still
 * waits on an authoritative signal (a response, a URL, a rendered landmark), and
 * there is no bare timeout standing in for one.
 *
 * ── ⚠️ THE PUBLIC API IS STUBBED, AND THAT IS CORRECT ─────────────────────
 *
 * This spec's subject is the SITE. The CONTRACT it reads is guarded in the
 * PRODUCING repository — `motir-core`'s `tests/api/public/contract-drift.test.ts`
 * and `contract-seam.test.ts`, under `public-surface-hosts.md` §3, which says a
 * contract test living only in the consumer reports the break after it has
 * shipped. `e2e/stub/` is a fixture, never a second source of truth.
 *
 * ── ⚠️ WHERE THIS WALK STOPS, AND WHY ─────────────────────────────────────
 *
 * Five of the eight act affordances are HAND-OFFS to `app.motir.co`
 * (AMENDMENT 4 rows 2, 4, 5, 6). There is no application in this lane, so the
 * walk asserts everything on THIS side of the boundary — the control, its
 * intent, its subject, and the return trip it carries — and stops at the
 * doorway. The far side is `motir-core`'s: `tests/api/public-act-handoff-route.test.ts`
 * asserts the entry point, its sign-in bounce and its allow-listed return. The
 * seam between them is the `/act` URL, and both halves assert it.
 *
 * The card's amended AC 3 asks for the submission "as the SIGN-IN-TO-ACT
 * hand-off, not anonymously" (MOTIR-4166) — which is exactly what step 4 walks.
 */

/*
 * ⚠️ A LONGER BUDGET THAN THE FAST LANE'S, and it is a consequence of the
 * pacing rather than of slowness. The default 30s is right for a spec that
 * races; this one deliberately does not, because its output is a recording a
 * person watches. Set here rather than in `playwright.config.ts` so the other
 * specs keep the tighter budget — a lane where everything may take three
 * minutes is a lane that stops reporting a hang.
 */
test.setTimeout(180_000)

/** Pacing for the recording. NOT a wait for state — see the header. */
const beat = (page: import('@playwright/test').Page, ms = 900) =>
  page.waitForTimeout(ms)

/*
 * ⚠️ CHAPTERS ARE MEASURED, NEVER AUTHORED.
 *
 * `POST /api/work-items/<story>/acceptance-evidence` takes `chapters` —
 * `{label, tSeconds}` — and a reviewer uses them to jump straight to the step
 * they want to see. Offsets written by hand would drift away from the recording
 * the first time a step got slower, and the drift would be silent: the reviewer
 * would land mid-step and have no way to tell the index was stale. So `chapter()`
 * stamps the real elapsed time as the walk passes each heading, and the run
 * writes them next to the video for the publisher to read.
 *
 * t=0 is the first line of the test body. The recording opens a moment earlier
 * (Playwright starts it with the browser context), so an offset lands a beat
 * INSIDE its step rather than before it — which is the harmless direction.
 */
const chapters: { label: string; tSeconds: number }[] = []
const startedAt = Date.now()
const chapter = (label: string) => {
  chapters.push({ label, tSeconds: (Date.now() - startedAt) / 1000 })
}

test.afterEach(({}, testInfo) => {
  // Beside the video, in this test's own output dir — so an index can never be
  // read against a DIFFERENT run's recording.
  writeFileSync(
    testInfo.outputPath('chapters.json'),
    JSON.stringify(chapters, null, 2),
  )
})

test('the whole /p/* journey, as MOTIR-3877 asks to be accepted', async ({
  page,
}) => {
  // ── 1 · ARRIVE FROM THE DIRECTORY ───────────────────────────────────────
  chapter('Arrive from the directory')
  // The window this story closes: /explore has been linking here in production
  // while both hosts answered 404.
  await page.goto('/explore')
  await expect(
    page.getByRole('heading', { name: /Explore public project/i }),
  ).toBeVisible()
  await beat(page)

  // ⚠️ TARGETED BY HREF, not by name. The banner's own brand lockup is also a
  // link called "Motir", and it goes to `/`. The obvious scoping — inside
  // `main` — is not available: `/explore` renders NO main landmark, which is
  // MOTIR-4169, filed while this lane was built. When that lands, this can
  // become a scoped `getByRole`.
  await page.locator('a[href="/p/MOTIR"]').first().click()
  await expect(page).toHaveURL(/\/p\/MOTIR$/)

  // The overview renders for a LOGGED-OUT visitor.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Motir' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: 'What Motir is' }),
  ).toBeVisible()
  await beat(page, 1400)

  // ── 2 · MOVE THROUGH THE FIVE TABS ──────────────────────────────────────
  chapter('Move through the five tabs')
  const nav = page.getByRole('navigation', { name: 'Project' })

  await nav.getByRole('link', { name: 'Board' }).click()
  await expect(page.getByRole('region', { name: 'To do' })).toBeVisible()
  await beat(page)

  await nav.getByRole('link', { name: 'Items' }).click()
  await expect(
    page.getByRole('link', { name: 'A public work item 1' }),
  ).toBeVisible()
  await beat(page)

  // …and PAGE one list past its first page.
  await page.getByRole('link', { name: 'Load more' }).click()
  await expect(page).toHaveURL(/cursor=/)
  await expect(
    page.getByRole('link', { name: 'A public work item 5' }),
  ).toBeVisible()
  await beat(page)

  await nav.getByRole('link', { name: 'Tree' }).click()
  await expect(page.getByText('Showing 2 of 12')).toBeVisible()
  // …and EXPAND one level.
  await page.getByRole('link', { name: 'An epic with children' }).click()
  await expect(page.getByRole('link', { name: 'A child item' })).toBeVisible()
  await beat(page)

  await nav.getByRole('link', { name: 'Roadmap' }).click()
  await expect(page.getByRole('region', { name: 'Submitted' })).toBeVisible()
  await beat(page)

  await nav.getByRole('link', { name: 'Changelog' }).click()
  await expect(
    page.getByRole('link', { name: 'Public project pages on motir.co' }),
  ).toBeVisible()
  await beat(page, 1200)

  // ── 3 · OPEN A WORK ITEM, AND A FEATURE REQUEST ─────────────────────────
  chapter('Open a work item, and a feature request')
  await nav.getByRole('link', { name: 'Items' }).click()
  await page.getByRole('link', { name: 'A public work item 1' }).click()
  await expect(page).toHaveURL(/\/items\/MOTIR-1$/)
  await beat(page)

  await page.goto('/p/MOTIR/roadmap')
  await page.getByRole('link', { name: 'Gantt view for the roadmap' }).click()
  await expect(
    page.getByRole('heading', { name: 'Gantt view for the roadmap' }),
  ).toBeVisible()
  await expect(page.getByText('84 upvotes')).toBeVisible()
  // The public thread renders in full, anonymously.
  await expect(page.getByText('Sam Kelly')).toBeVisible()
  await beat(page, 1400)

  // ── 4 · ASK FOR A FEATURE — SIGN-IN-TO-ACT, NOT ANONYMOUS ───────────────
  chapter('Ask for a feature — sign-in-to-act')
  // ⚠️ AMENDED (MOTIR-4166). The intake has ALWAYS required a session; the plan
  // recorded it as anonymous. So the walk follows the hand-off the amendment
  // specifies rather than a submit that would 401 every visitor.
  await page.goto('/p/MOTIR')
  await page.getByRole('link', { name: 'Request a feature' }).click()
  await expect(page).toHaveURL(/\/requests\/new$/)
  await expect(page.getByText('You will sign in first')).toBeVisible()

  const handoff = page.getByRole('link', { name: /Continue to Motir/ })
  const href = await handoff.getAttribute('href')
  expect(href).toContain('intent=request')
  expect(href).toContain('subject=MOTIR')
  // …and it carries the way back. This is the seam; the far side is motir-core's.
  expect(decodeURIComponent(href ?? '')).toContain(
    'https://motir.co/p/MOTIR/roadmap',
  )
  await beat(page, 1400)

  // ── 5 · THE ACT AFFORDANCES, AS THE AMENDMENT SPECIFIES THEM ────────────
  chapter('The act affordances')
  await page.goto('/p/MOTIR')

  // Row 3 — subscribe works with NO account, on this host.
  await page
    .getByLabel('Email for changelog updates')
    .fill('reader@example.test')
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
  await beat(page)

  // Row 2 — follow is a hand-off, and never claims you already follow.
  const follow = page.getByRole('link', { name: /^Follow/ })
  expect(await follow.getAttribute('href')).toContain('intent=follow')
  await expect(page.getByText('Following')).toHaveCount(0)
  await beat(page)

  // ── 6 · THE STATES A VISITOR WILL ACTUALLY MEET ─────────────────────────
  chapter('The states a visitor will meet')
  // An EMPTY tab: a project whose board has nothing public.
  await page.goto('/p/MOTIR/roadmap?bucket=done&cursor=broken')
  await expect(
    page.getByRole('region', { name: 'Done' }).getByRole('alert'),
  ).toContainText('could not load')
  // …and the rest of the page is intact, which is the point of that containment.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Motir' }),
  ).toBeVisible()
  await beat(page, 1200)

  // A real 404 — the project that does not exist, distinct from an outage.
  const missing = await page.goto('/p/NOPE')
  expect(missing?.status()).toBe(404)
  await beat(page, 1200)
})
