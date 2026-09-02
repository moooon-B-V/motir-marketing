import { expect, test } from '@playwright/test'

/*
 * The five tabs (MOTIR-4116), in a real browser against the real build.
 *
 * ⚠️ THE PAGING ASSERTIONS ARE THE POINT. A pager that renders is not a pager
 * that pages: the stub answers a DIFFERENT fixture for the second page, so a
 * "Load more" that dropped its cursor would return the same rows and fail here.
 */

test('the Board tab renders its columns, its counts and the privacy marker', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/board')

  await expect(
    page
      .getByRole('navigation', { name: 'Project' })
      .getByRole('link', { name: 'Board' }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('region', { name: 'To do' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Done' })).toBeVisible()
  // The epic-privacy marker is RENDERED rather than dropped — an epic that
  // looked empty would be a worse lie than one that says its children are not
  // public.
  await expect(page.getByText('Children are not public.')).toBeVisible()
  // Bounded, not paged, and it SAYS so.
  await expect(page.getByText(/Showing the first 200 cards/)).toBeVisible()
})

test('the Items tab pages by URL, and the second page is different', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/items')

  await expect(
    page.getByRole('link', { name: 'A public work item 1' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Load more' }).click()

  await expect(page).toHaveURL(/\/p\/MOTIR\/items\?cursor=wi_4/)
  await expect(
    page.getByRole('link', { name: 'A public work item 5' }),
  ).toBeVisible()
  // The tell that the cursor was actually carried: page one's rows are gone.
  await expect(
    page.getByRole('link', { name: 'A public work item 1' }),
  ).toHaveCount(0)
})

test('the Items pager is a real link, so it works with no JavaScript', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/items')

  const more = page.getByRole('link', { name: 'Load more' })
  await expect(more).toHaveAttribute('href', '/p/MOTIR/items?cursor=wi_4')
  await expect(more).toHaveAttribute('rel', 'next')
})

test('the Tree tab expands one level by navigation', async ({ page }) => {
  await page.goto('/p/MOTIR/tree')

  await expect(page.getByText('Showing 2 of 12')).toBeVisible()

  await page.getByRole('link', { name: 'An epic with children' }).click()

  await expect(page).toHaveURL(/\/p\/MOTIR\/tree\?parentId=wi_1/)
  await expect(page.getByRole('link', { name: 'A child item' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Back to the top level' }),
  ).toBeVisible()
})

test('the Roadmap tab renders four buckets and their vote COUNTS', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/roadmap')

  for (const label of ['Submitted', 'Planned', 'In progress', 'Done']) {
    await expect(page.getByRole('region', { name: label })).toBeVisible()
  }
  await expect(page.getByText('84')).toBeVisible()
})

test('the Roadmap ships NO vote control — that is MOTIR-4119’s', async ({
  page,
}) => {
  // The card's scope boundary, asserted rather than reviewed: this card renders
  // the surface the vote will attach to and nothing that writes.
  await page.goto('/p/MOTIR/roadmap')

  await expect(page.getByRole('button', { name: /vote|upvote/i })).toHaveCount(
    0,
  )
  // A hand-off would be a link to the application; none ships here yet.
  await expect(page.locator('a[href*="app.motir.co/act"]')).toHaveCount(0)
})

test('one Roadmap column pages independently of the others', async ({
  page,
}) => {
  await page.goto('/p/MOTIR/roadmap?bucket=submitted&cursor=rm_52')

  // The paged column shows its next page…
  await expect(
    page
      .getByRole('region', { name: 'Submitted' })
      .getByText('A feature request 56'),
  ).toBeVisible()
  // …and the other three are untouched.
  await expect(
    page
      .getByRole('region', { name: 'Planned' })
      .getByText('A feature request 53'),
  ).toBeVisible()
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

test('every tab canonical names motir.co and its own path', async ({
  page,
}) => {
  for (const segment of ['board', 'items', 'tree', 'roadmap', 'changelog']) {
    await page.goto(`/p/MOTIR/${segment}`)
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href')

    expect(canonical, segment).toContain(`/p/MOTIR/${segment}`)
    expect(canonical, segment).not.toContain('app.motir.co')
  }
})

test('a tab whose OWN read fails keeps the shell and says which host', async ({
  page,
}) => {
  // ACME resolves as a project (the stub has no fixture, so the project read
  // 404s) — use MOTIR, whose project read succeeds, and a tab the stub does not
  // serve. `/p/MOTIR/board` is fixtured; the roadmap COLUMN for an unfixtured
  // bucket is not, which exercises the per-column failure.
  await page.goto('/p/MOTIR/roadmap?bucket=done&cursor=nope')

  // The hero survives — the page is not blanked by one column's failure.
  await expect(
    page.getByRole('heading', { level: 1, name: 'Motir' }),
  ).toBeVisible()

  // ⚠️ SCOPED TO THE COLUMN, not `getByRole('alert')` at page level: Next.js
  // renders its own always-present route announcer with `role="alert"`, so a
  // bare page-level alert locator matches two elements and would fail on strict
  // mode whatever the page did.
  await expect(
    page.getByRole('region', { name: 'Done' }).getByRole('alert'),
  ).toContainText('could not load')

  // And the failure is CONTAINED — the other three columns still have content.
  await expect(
    page
      .getByRole('region', { name: 'Planned' })
      .getByText('A feature request 53'),
  ).toBeVisible()
})
