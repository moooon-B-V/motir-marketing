import { expect, test } from '@playwright/test'
import { STUB_ORIGIN } from '../stub/origin'

/*
 * The project's tabs (MOTIR-4116), in a real browser against the real build.
 *
 * ⚠️ FOUR OF THE FIVE ARE NOT PAGES ANY MORE (MOTIR-6743, Story MOTIR-6171).
 * The Board, Items, Tree and Roadmap tabs — and every item page — answer a
 * PERMANENT redirect (308) to the same path in the app, where a Visitor reads
 * the live project after signing in and agreeing to be seen. The Roadmap was the
 * public feature-request board, which is retired. The Changelog stays a page on
 * this host, anonymous, as does the project page itself.
 *
 * In this lane the app's origin IS the stub (`NEXT_PUBLIC_MOTIR_APP_ORIGIN`),
 * so a redirect names `STUB_ORIGIN`.
 */

for (const view of ['board', 'items', 'tree', 'roadmap']) {
  test(`/p/MOTIR/${view} answers 308 to the same path in the app`, async ({
    request,
  }) => {
    const res = await request.get(`/p/MOTIR/${view}?cursor=wi_4`, {
      maxRedirects: 0,
    })
    expect(res.status()).toBe(308)
    // The query is dropped: this host's cursors mean nothing to the app.
    expect(res.headers()['location']).toBe(`${STUB_ORIGIN}/p/MOTIR/${view}`)
  })
}

test('an item page answers 308 to the same item in the app', async ({
  request,
}) => {
  const res = await request.get('/p/MOTIR/items/MOTIR-4115', {
    maxRedirects: 0,
  })
  expect(res.status()).toBe(308)
  expect(res.headers()['location']).toBe(
    `${STUB_ORIGIN}/p/MOTIR/items/MOTIR-4115`,
  )
})

test('an unknown project is redirected too — the app answers its not-found', async ({
  request,
}) => {
  // No read before the redirect, so there is nothing here to 404 or to 500.
  const res = await request.get('/p/NOPE-XYZ/board', { maxRedirects: 0 })
  expect(res.status()).toBe(308)
  expect(res.headers()['location']).toBe(`${STUB_ORIGIN}/p/NOPE-XYZ/board`)
})

test('the Changelog tab lists what shipped and offers the feed', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/changelog')

  await expect(
    page.getByRole('link', { name: 'Public project pages on motir.co' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Subscribe by Atom' }),
  ).toHaveAttribute('href', '/p/MOTIR/changelog.xml')
})

test('the Changelog canonical names motir.co and its own path', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/changelog')
  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href')

  expect(canonical).toContain('/p/MOTIR/changelog')
  expect(canonical).not.toContain('app.motir.co')
})
