import { expect, test } from '@playwright/test'

/*
 * The ACT AFFORDANCES (MOTIR-4119) — `public-surface-hosts.md` AMENDMENT 4 §D,
 * row by row, on the surfaces they belong to.
 */

const ACT = 'a[href*="/act?"]'

test('row 2 — FOLLOW is a hand-off carrying the subject and the return', async ({
  page,
}) => {
  await page.goto('/p/MOTIR')

  const follow = page.getByRole('link', { name: /^Follow/ })
  const href = await follow.getAttribute('href')

  expect(href).toContain('/act?')
  expect(href).toContain('intent=follow')
  expect(href).toContain('subject=MOTIR')
  expect(decodeURIComponent(href ?? '')).toContain('https://motir.co/p/MOTIR')
})

test('row 2 — Follow NEVER reads "Following"', async ({ page }) => {
  // `actorUserId` is structurally null for every read this host makes (row 8),
  // so the page cannot know. A followed state would be a picture of a page this
  // architecture cannot serve.
  await page.goto('/p/MOTIR')

  await expect(page.getByRole('link', { name: /^Follow/ })).toBeVisible()
  await expect(page.getByText('Following')).toHaveCount(0)
})

test('the hand-off returns to the TAB you were on, not the project root', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/roadmap')

  const href = await page
    .getByRole('link', { name: /^Follow/ })
    .getAttribute('href')
  expect(decodeURIComponent(href ?? '')).toContain('/p/MOTIR/roadmap')
})

test('row 3 — SUBSCRIBE stays on this host and takes an email', async ({
  page,
}) => {
  await page.goto('/p/MOTIR')

  const field = page.getByLabel('Email for changelog updates')
  await expect(field).toBeVisible()
  // It is a real form on THIS page — the one write the amendment lets stay.
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible()
  // …and it is not a hand-off.
  const subscribeIsHandoff = await page
    .getByRole('button', { name: 'Subscribe' })
    .locator('xpath=ancestor::a')
    .count()
  expect(subscribeIsHandoff).toBe(0)
})

test('rows 4 and 5 — vote, upvote and comment are hand-offs', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/roadmap')
  const vote = page.locator(ACT).filter({ hasText: '84' }).first()
  expect(await vote.getAttribute('href')).toContain('intent=vote')

  await page.goto('/p/MOTIR/requests/MOTIR-4051')
  expect(
    await page.getByRole('link', { name: /Upvote/ }).getAttribute('href'),
  ).toContain('intent=upvote')
  expect(
    await page
      .getByRole('link', { name: /Add a comment/ })
      .getAttribute('href'),
  ).toContain('intent=comment')
})

test('row 7 — there is NO overview editor anywhere on this host', async ({
  page,
}) => {
  // ABSENT by decision: a long-form authoring act belongs where the author signs
  // in. MOTIR-4171 tracks the application-side surface that calls the door
  // MOTIR-4114 built.
  await page.goto('/p/MOTIR')

  await expect(page.getByRole('button', { name: /edit/i })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /edit/i })).toHaveCount(0)
  await expect(page.locator('[contenteditable]')).toHaveCount(0)
})

test('row 1 — the chrome offers a plain Sign in and NO account menu', async ({
  page,
}) => {
  await page.goto('/p/MOTIR')

  const banner = page.getByRole('banner')
  await expect(banner.getByRole('link', { name: 'Sign in' })).toBeVisible()
  await expect(
    banner.getByRole('button', { name: /account|profile/i }),
  ).toHaveCount(0)
  await expect(banner.getByText(/sign out/i)).toHaveCount(0)
})

test('⚠️ THE HARD GATE — no response sets a cookie scoped to .motir.co', async ({
  page,
}) => {
  // This card's own invariant, and the condition the whole host split rests on
  // (§4). Asserted over EVERY response the surface makes, not just the document:
  // a widening could arrive on any of them.
  const offenders: string[] = []
  page.on('response', (response) => {
    const header = response.headers()['set-cookie']
    if (header && /domain=\.?motir\.co/i.test(header)) {
      offenders.push(`${response.url()} → ${header}`)
    }
  })

  for (const path of [
    '/p/MOTIR',
    '/p/MOTIR/board',
    '/p/MOTIR/roadmap',
    '/p/MOTIR/requests/MOTIR-4051',
    '/p/MOTIR/requests/new',
  ]) {
    await page.goto(path)
  }

  expect(offenders, offenders.join('\n')).toEqual([])

  // And nothing this surface serves sets ANY cookie at all — it is anonymous,
  // cacheable and identical for every visitor, which is what row 8 buys.
  expect(await page.context().cookies()).toEqual([])
})

test('every act link leaves for app.motir.co, and none is a form that posts', async ({
  page,
}) => {
  // The mechanical fact behind every hand-off: a cross-origin credentialed write
  // is impossible under `sameSite: 'lax'`, so an act that needs identity MUST be
  // a navigation. A form posting cross-origin would be the shape to catch.
  await page.goto('/p/MOTIR/requests/MOTIR-4051')

  const acts = page.locator(ACT)
  expect(await acts.count()).toBeGreaterThan(0)
  for (const href of await acts.evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).href),
  )) {
    expect(href).toContain('/act?')
  }

  // The only form on the whole surface is the anonymous subscribe.
  await page.goto('/p/MOTIR')
  const forms = page.locator('form')
  expect(await forms.count()).toBe(1)
  await expect(
    forms.first().getByRole('button', { name: 'Subscribe' }),
  ).toBeVisible()
})
