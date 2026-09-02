import { expect, test } from '@playwright/test'

/*
 * The two detail pages and the request intake (MOTIR-4117).
 */

test('a work item renders its body, its parent and its children', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/items/MOTIR-4115')

  await expect(
    page.getByRole('heading', { name: 'motir.co serves /p/[identifier]' }),
  ).toBeVisible()
  await expect(page.getByText('What ships')).toBeVisible()
  await expect(
    page.getByRole('link', { name: /MOTIR-3877 · Public project pages/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'MOTIR-9 · A child item' }),
  ).toBeVisible()
})

test('a truncated child list SAYS it is truncated and points at the tree', async ({
  page,
}) => {
  // `children` is a first page, not the child set. A list that showed one of two
  // and looked complete is the failure this line prevents.
  await page.goto('/p/MOTIR/items/MOTIR-4115')

  await expect(
    page.getByRole('link', { name: 'All 2 in the tree' }),
  ).toHaveAttribute('href', '/p/MOTIR/tree?parentId=wi_1')
})

test('a work item shows NOTHING internal — no assignee, estimate or points', async ({
  page,
}) => {
  // They are absent from the public projection, so the page cannot show them.
  // Asserted because a future addition would be a leak rather than a feature.
  await page.goto('/p/MOTIR/items/MOTIR-4115')

  const main = page.getByRole('main')
  await expect(main).not.toContainText(/assignee/i)
  await expect(main).not.toContainText(/story point/i)
  await expect(main).not.toContainText(/estimate/i)
})

test('an unknown work item is a real 404', async ({ page }) => {
  const response = await page.goto('/p/MOTIR/items/MOTIR-9999')
  expect(response?.status()).toBe(404)
})

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

test('the request page performs NOTHING — no upvote button, no comment box', async ({
  page,
}) => {
  // This card's stated boundary: it renders the surfaces MOTIR-4119 attaches to.
  await page.goto('/p/MOTIR/requests/MOTIR-4051')

  await expect(page.getByRole('button', { name: /upvote/i })).toHaveCount(0)
  await expect(page.getByRole('textbox')).toHaveCount(0)
  await expect(page.locator('form')).toHaveCount(0)
})

test('the intake is a HAND-OFF, and says so before asking for anything', async ({
  page,
}) => {
  // ⚠️ The card assumed this flow was anonymous. Both endpoints call
  // requireCompliantSession() and 401 a logged-out caller, so a form here would
  // collect a draft and then lose it at the sign-in. AMENDMENT 4 row 6.
  await page.goto('/p/MOTIR/requests/new')

  await expect(page.getByText('You will sign in first')).toBeVisible()
  // No form fields at all — the honest shape, not a reduced one.
  await expect(page.getByRole('textbox')).toHaveCount(0)

  const go = page.getByRole('link', { name: /Continue to Motir/ })
  const href = await go.getAttribute('href')
  expect(href).toContain('/act?')
  expect(href).toContain('intent=request')
  expect(href).toContain('subject=MOTIR')
  // The return trip is carried, and it points back at this site.
  expect(decodeURIComponent(href ?? '')).toContain('/p/MOTIR/roadmap')
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

test('the detail canonicals name motir.co and their own paths', async ({
  page,
}) => {
  for (const path of [
    '/p/MOTIR/items/MOTIR-4115',
    '/p/MOTIR/requests/MOTIR-4051',
  ]) {
    await page.goto(path)
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href')
    expect(canonical, path).toContain(path)
    expect(canonical, path).not.toContain('app.motir.co')
  }
})
