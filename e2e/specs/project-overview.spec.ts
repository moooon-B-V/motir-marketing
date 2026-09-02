import { expect, test } from '@playwright/test'

/*
 * `/p/<identifier>` — the Overview, in a real browser against the real build
 * (MOTIR-4115).
 *
 * The unit suite renders the components; this asserts the thing neither a unit
 * test nor a type checker can: that the ROUTE exists, that the server-side read
 * reaches the API, and that the page a visitor receives carries the chrome, the
 * hero and the entity signal together.
 *
 * ⚠️ Every wait is on an authoritative signal — a response, a rendered landmark
 * — never a timeout. The E2E discipline, from this repository's first spec.
 */

test('the project page renders for a logged-out visitor, inside the site chrome', async ({
  page,
}) => {
  const response = await page.goto('/p/MOTIR')

  expect(response?.status(), '/p/MOTIR did not serve').toBe(200)

  // The room.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Motir' }),
  ).toBeVisible()
  await expect(page.getByText('moooon B.V.').first()).toBeVisible()
  await expect(
    page.getByText(/AI planning, project-management and agent-orchestration/),
  ).toBeVisible()

  // The chrome — the same header and footer every motir.co surface wears.
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('the tab bar offers all six destinations, with Overview current', async ({
  page,
}) => {
  await page.goto('/p/MOTIR')

  const nav = page.getByRole('navigation', { name: 'Project' })
  for (const label of [
    'Overview',
    'Board',
    'Items',
    'Tree',
    'Roadmap',
    'Changelog',
  ]) {
    await expect(nav.getByRole('link', { name: label })).toBeVisible()
  }
  await expect(nav.getByRole('link', { name: 'Overview' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('the authored README renders as Markdown, not as source', async ({
  page,
}) => {
  await page.goto('/p/MOTIR')

  await expect(
    page.getByRole('heading', { level: 2, name: 'What Motir is' }),
  ).toBeVisible()
  // The tell that the Markdown was rendered rather than printed.
  await expect(page.getByText('## What Motir is')).toHaveCount(0)
})

test('the canonical and the JSON-LD name motir.co, never app.motir.co', async ({
  page,
}) => {
  // The whole point of the move, asserted on the served document rather than on
  // a component: this host owns the canonical now.
  await page.goto('/p/MOTIR')

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href')
  expect(canonical).toContain('/p/MOTIR')
  expect(canonical).not.toContain('app.motir.co')

  const ld = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent()
  const graph = JSON.parse(ld ?? '{}') as Record<string, unknown>
  expect(String(graph['@id'])).toContain('/p/MOTIR')
  expect(JSON.stringify(graph)).not.toContain('app.motir.co')
})

test('an unknown project is a real 404, not an error page', async ({
  page,
}) => {
  // A crawler must see the 404 so it drops the link. The distinction between
  // "does not exist" and "we could not reach the API" is the one this surface
  // most needs to keep: the stub answers 404 for an unfixtured path.
  const response = await page.goto('/p/NOPE')

  expect(response?.status()).toBe(404)
})
