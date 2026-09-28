import { expect, test } from '@playwright/test'

/*
 * The request detail page and the request intake (MOTIR-4117).
 *
 * (The work-item detail page is a redirect into the app since MOTIR-6743 —
 * `project-tabs.spec.ts` asserts it.)
 */

test('a feature request renders its body, thread and vote COUNT', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/requests/MOTIR-4051')

  await expect(
    page.getByRole('heading', { name: 'Gantt view for the roadmap' }),
  ).toBeVisible()
  await expect(page.getByText('Opened by Dana Okoye')).toBeVisible()
  await expect(page.getByText('Sam Kelly')).toBeVisible()
  await expect(page.getByText('84 upvotes')).toBeVisible()
})

test('the request page POSTS nothing — its acts are hand-off links', async ({
  page,
}) => {
  // ⚠️ RETARGETED BY MOTIR-4119, which is the card that added the acts. This
  // spec was written under MOTIR-4117's boundary ("renders the surfaces
  // MOTIR-4119 attaches to") and asserted zero controls. That assertion has done
  // its job and would now be asserting the absence of shipped work.
  //
  // What survives is the invariant that OUTLIVES both cards: every act needing
  // identity is a NAVIGATION, never a post. `sameSite: 'lax'` means a
  // cross-origin credentialed write is impossible, so a button that posted would
  // be broken rather than merely off-pattern.
  await page.goto('/p/MOTIR/requests/MOTIR-4051')

  await expect(page.getByRole('button', { name: /upvote/i })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Upvote/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Add a comment/ })).toBeVisible()

  // The ONLY form anywhere on this surface is the shell's anonymous subscribe —
  // the one write AMENDMENT 4 row 3 lets stay on this host.
  const forms = page.locator('form')
  await expect(forms).toHaveCount(1)
  await expect(forms.getByRole('button', { name: 'Subscribe' })).toBeVisible()
})

test('the intake is a HAND-OFF, and says so before asking for anything', async ({
  page,
}) => {
  // ⚠️ The card assumed this flow was anonymous. Both endpoints call
  // requireCompliantSession() and 401 a logged-out caller, so a form here would
  // collect a draft and then lose it at the sign-in. AMENDMENT 4 row 6.
  await page.goto('/p/MOTIR/requests/new')

  await expect(page.getByText('You will sign in first')).toBeVisible()

  // ⚠️ NO FIELD FOR THE REQUEST ITSELF — the honest shape, not a reduced one: a
  // partial form would take a title, get no duplicate candidates (401), take a
  // body, and lose the draft at the sign-in.
  //
  // (Scoped to the intake's own region since MOTIR-4119: the shell's act rail
  // renders on every screen, so the page does carry the anonymous subscribe
  // field. That one is not part of the request flow.)
  await expect(page.getByLabel(/title/i)).toHaveCount(0)
  await expect(
    page.getByRole('textbox', { name: /what do you need/i }),
  ).toHaveCount(0)
  await expect(page.locator('textarea')).toHaveCount(0)

  const go = page.getByRole('link', { name: /Continue to Motir/ })
  const href = await go.getAttribute('href')
  expect(href).toContain('/act?')
  expect(href).toContain('intent=request')
  expect(href).toContain('subject=MOTIR')
  // The return trip is carried, and it points back at this site — at the
  // PROJECT page, since the roadmap is the app's now (MOTIR-6745).
  const back = new URL(href!).searchParams.get('return')
  expect(new URL(back!).pathname).toBe('/p/MOTIR')

  // And nothing on the doorway points at a retired read page on this host.
  expect(
    await page
      .locator('a[href$="/roadmap"], a[href*="/roadmap?"]')
      .evaluateAll((links) =>
        links
          .map((l) => l.getAttribute('href')!)
          .filter((h) => h.startsWith('/')),
      ),
  ).toEqual([])
})

test('the request page goes back to the PROJECT, not to a retired read page', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/requests/MOTIR-4051')

  const main = page.getByRole('main')
  await expect(main.getByRole('link', { name: /^← / })).toHaveAttribute(
    'href',
    '/p/MOTIR',
  )
  expect(
    await page
      .locator('a[href]')
      .evaluateAll((links) =>
        links
          .map((l) => l.getAttribute('href')!)
          .filter(
            (h) =>
              h.startsWith('/') &&
              /\/(roadmap|board|items|tree)(\/|\?|$)/.test(h),
          ),
      ),
    'a same-host link to a read page that 308s into the app',
  ).toEqual([])
})

test('the intake is not indexed — a doorway must not outrank the roadmap', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/requests/new')

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
})

test('the request canonical names motir.co and its own path', async ({
  page,
}) => {
  for (const path of ['/p/MOTIR/requests/MOTIR-4051']) {
    await page.goto(path)
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href')
    expect(canonical, path).toContain(path)
    expect(canonical, path).not.toContain('app.motir.co')
  }
})
