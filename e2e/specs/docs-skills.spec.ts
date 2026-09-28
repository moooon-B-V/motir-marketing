import { expect, test } from '@playwright/test'

/*
 * `/docs/skills`, AS A READER REACHES IT (MOTIR-6719).
 *
 * ⚠️ WHAT THIS ADDS OVER `tests/docs/skills.test.tsx`. That file renders the
 * page in jsdom and covers its text structure and the pinned tag. It cannot
 * see the three things a reader actually touches: the rail link that gets
 * them here (and the rail marking where they are), the clipboard holding the
 * command they copied, and the page loading without errors in a real browser.
 * Those are what this spec asserts.
 *
 * ⚠️ THE AGENTS AND THEIR DOMAINS ARE TYPED HERE, NOT IMPORTED. The page's
 * data lives in `lib/skillsGuide.ts`; a spec that read its expectations from
 * the same module would agree with any change to it, including a section
 * silently dropped. The story promised these six agents and these skills,
 * so the spec names them (`motir-guide` since MOTIR-6732, `motir-fix-bugs`
 * since MOTIR-6724, `motir-fix` since MOTIR-6814), and the release tag every
 * install command names.
 */

const PAGE = '/docs/skills'

/** The `motir-skills` release every install command must fetch. */
const RELEASE_TAG = 'v0.3.0'

/** Each agent the page documents, and the domain its own docs live on. */
const AGENTS: { label: string; host: string }[] = [
  { label: 'Claude Code', host: 'code.claude.com' },
  { label: 'Codex', host: 'learn.chatgpt.com' },
  { label: 'Cursor', host: 'cursor.com' },
  { label: 'Gemini CLI', host: 'geminicli.com' },
  { label: 'GitHub Copilot in VS Code', host: 'code.visualstudio.com' },
  { label: 'OpenCode', host: 'opencode.ai' },
]

const SKILLS = [
  'motir-run',
  'motir-fix',
  'motir-log-bug',
  'motir-mark',
  'motir-guide',
  'motir-fix-bugs',
]

test('the rail’s Skills row opens the guide and marks it current', async ({
  page,
}) => {
  await page.goto('/docs')
  const rail = page.getByRole('navigation', { name: 'Documentation' })
  await rail.getByRole('link', { name: 'Skills', exact: true }).click()

  await expect(page).toHaveURL(new RegExp(`${PAGE}$`))
  await expect(
    page.getByRole('heading', { level: 1, name: 'Skills' }),
  ).toBeVisible()
  await expect(
    rail.getByRole('link', { name: 'Skills', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('it serves, with an install section per agent and a usage section per skill, and no console error', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  const response = await page.goto(PAGE)
  expect(response?.status()).toBe(200)

  for (const { label } of AGENTS) {
    await expect(
      page.getByRole('heading', { level: 3, name: label, exact: true }),
      label,
    ).toBeVisible()
  }
  for (const skill of SKILLS) {
    await expect(
      page.getByRole('heading', { level: 3, name: skill, exact: true }),
      skill,
    ).toBeVisible()
  }

  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})

test('each agent section links to that agent’s own documentation', async ({
  page,
}) => {
  await page.goto(PAGE)
  for (const { label, host } of AGENTS) {
    const link = page.getByRole('link', {
      name: `${label} documentation`,
      exact: true,
    })
    const href = await link.getAttribute('href')
    expect(href, label).toBeTruthy()
    expect(new URL(href!).host, label).toBe(host)
  }
})

test.describe('a reader copies the Claude Code install command', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('the clipboard holds exactly the command on screen', async ({
    page,
  }) => {
    await page.goto(PAGE)
    const pane = page.locator('pre', { hasText: '/plugin marketplace add' })
    // The install pane and the update pane both add the marketplace; the
    // install one is first on the page and is the one without `remove`.
    const installPane = pane.filter({ hasNotText: 'remove' })
    await expect(installPane).toHaveCount(1)
    const onScreen = (await installPane.textContent()) ?? ''

    await page
      .getByRole('button', { name: 'Copy the Claude Code plugin commands' })
      .click()
    await expect(
      page.getByRole('button', {
        name: 'Copy the Claude Code plugin commands',
      }),
    ).toHaveText('Copied')

    const held = await page.evaluate(() => navigator.clipboard.readText())
    // Exact equality: a truncation at the line break is the plausible bug.
    expect(held).toBe(onScreen)
    expect(held).toContain('/plugin install motir@motir-skills')
  })
})

test('the motir-guide section says what to type and what the reader will see', async ({
  page,
}) => {
  await page.goto(PAGE)
  const heading = page.getByRole('heading', {
    level: 3,
    name: 'motir-guide',
    exact: true,
  })
  await expect(heading).toBeVisible()
  const section = page.locator('section', { has: heading })
  await expect(
    section.getByText('motir guide ACME-12', { exact: true }),
  ).toBeVisible()
  await expect(section).toContainText('one step at a time')
  await expect(section).toContainText('To-do list')
})

test('the motir-fix-bugs section says what to type and what the reader will see', async ({
  page,
}) => {
  await page.goto(PAGE)
  const heading = page.getByRole('heading', {
    level: 3,
    name: 'motir-fix-bugs',
    exact: true,
  })
  await expect(heading).toBeVisible()
  const section = page.locator('section', { has: heading })
  await expect(
    section.getByText('motir fix bugs', { exact: true }),
  ).toBeVisible()
  await expect(section).toContainText('one bug at a time, oldest first')
  await expect(section).toContainText('with a blocked by link')
})

test('the motir-fix section says what to type and how it differs from motir fix bugs', async ({
  page,
}) => {
  await page.goto(PAGE)
  const heading = page.getByRole('heading', {
    level: 3,
    name: 'motir-fix',
    exact: true,
  })
  await expect(heading).toBeVisible()
  const section = page.locator('section', { has: heading })
  await expect(
    section.getByText('motir fix ACME-12', { exact: true }),
  ).toBeVisible()
  await expect(section).toContainText('never a new one')
  await expect(section).toContainText('Not the same as motir fix bugs')
})

test('every install command names the pinned release tag', async ({ page }) => {
  await page.goto(PAGE)
  const panes = page.locator('pre')
  const count = await panes.count()
  expect(count).toBeGreaterThan(0)
  const texts = await panes.allTextContents()
  const tagged = texts.filter((t) => t.includes('motir-skills'))
  expect(tagged.length).toBeGreaterThan(0)
  for (const text of tagged) expect(text).toContain(RELEASE_TAG)
  const tags = new Set(texts.join('\n').match(/\bv\d+\.\d+\.\d+\b/g) ?? [])
  expect([...tags]).toEqual([RELEASE_TAG])
})
