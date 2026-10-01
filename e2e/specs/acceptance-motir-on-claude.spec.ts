import { writeFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { SITE_ORIGIN, STUB_ORIGIN } from '../stub/origin'

/*
 * ⚠️ THE ACCEPTANCE WALK FOR STORY MOTIR-6976 (MOTIR-7084) — "Motir on Claude
 * ships", on motir.co. A reader opens /docs/mcp and finds Add Motir to Claude,
 * copies the Claude Code command, finds the token route below it, follows the
 * hints to /docs/mcp/tools and sees each tool's title with a Reads, Writes or
 * Destructive chip, opens /docs/skills installing v0.4.0 with the plugin's three
 * things, and reaches the privacy notice's passage on connected AI clients.
 * PACED FOR A PERSON TO WATCH.
 *
 * The first test is the RECEIPT: its recording is published onto the story and
 * a reviewer accepts on it, so it is deliberately slowed between steps. Every
 * `beat()` is PACING, not a wait for state; every assertion still waits on an
 * authoritative signal (a role, a URL, text).
 *
 * ⚠️ THE LANE STUBS THE APP. `STUB_ORIGIN` is this build's `APP_ORIGIN`, so the
 * server URL the page prints here is `${STUB_ORIGIN}/api/mcp` — in production
 * the same interpolation prints `https://app.motir.co/api/mcp`. The real
 * claude.ai sign-in and the plugin install are not browser-reachable here: they
 * are MOTIR-7076's and MOTIR-7075's.
 *
 * ⚠️ AND THE CATALOGUE IS A MODE ON THE SHARED STUB. `/docs/mcp/tools` fetches it
 * server-side, so a variant (hints stripped, or failing) is selected by
 * `POST /__stub/mcp-tools?mode=…` — which is why this file runs SERIALLY and
 * puts the mode back after every test (`e2e/stub/publicApiStub.ts` explains).
 */

test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

/** Pacing for the recording — "look at this" beats, as MOTIR-6749's. */
const beat = (page: Page, ms = 1600) => page.waitForTimeout(ms)

const chapters: { label: string; tSeconds: number }[] = []
let startedAt = Date.now()
const chapter = (label: string) => {
  chapters.push({ label, tSeconds: (Date.now() - startedAt) / 1000 })
}

async function catalogueMode(mode: 'recorded' | 'stripped' | 'failing') {
  const res = await fetch(`${STUB_ORIGIN}/__stub/mcp-tools?mode=${mode}`, {
    method: 'POST',
  })
  expect(res.status, `stub mode ${mode}`).toBe(204)
}

test.afterEach(async ({}, testInfo) => {
  await catalogueMode('recorded')
  if (chapters.length) {
    writeFileSync(
      testInfo.outputPath('chapters.json'),
      JSON.stringify(chapters, null, 2),
    )
    chapters.length = 0
  }
})

const SERVER_URL = `${STUB_ORIGIN}/api/mcp`

/** A tool's row on /docs/mcp/tools, by the anchor its name carries. */
const toolRow = (page: Page, name: string) =>
  page.locator('li', { has: page.locator(`[id="tool-${name}"]`) })

test.describe('the receipt', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('a reader adds Motir to Claude, as MOTIR-6976 asks to be accepted', async ({
    page,
  }) => {
    startedAt = Date.now()

    // ── 1 · /docs/mcp LEADS WITH ADD MOTIR TO CLAUDE ─────────────────────────
    chapter('/docs/mcp — Add Motir to Claude comes first')
    await page.goto(`${SITE_ORIGIN}/docs/mcp`)
    const firstSection = page.getByRole('heading', { level: 2 }).first()
    await expect(firstSection).toHaveText('Add Motir to Claude')
    await beat(page)

    for (const [id, client] of [
      ['claude-ai', 'claude.ai'],
      ['claude-desktop', 'Claude desktop app'],
      ['claude-code', 'Claude Code'],
    ] as const) {
      chapter(`The ${client} steps`)
      const block = page.locator(`#${id}`)
      await block.scrollIntoViewIfNeeded()
      await expect(
        block.getByRole('heading', { level: 3, name: client, exact: true }),
      ).toBeVisible()
      await expect(block).toContainText(SERVER_URL)
      await beat(page, 2400)
    }

    chapter('Copy the Claude Code command')
    const copyButton = page.getByRole('button', {
      name: 'Copy the Claude Code command',
    })
    await copyButton.click()
    await expect(copyButton).toHaveText('Copied')
    const held = await page.evaluate(() => navigator.clipboard.readText())
    expect(held).toBe(`claude mcp add --transport http motir ${SERVER_URL}`)
    await beat(page)

    chapter('What you approve, and where to revoke it')
    const revoke = page.getByRole('link', { name: 'Connected apps' })
    await revoke.scrollIntoViewIfNeeded()
    await expect(revoke).toHaveAttribute(
      'href',
      `${STUB_ORIGIN}/settings/account/tokens#connected-apps`,
    )
    await beat(page, 2400)

    chapter('The token route, kept below for other clients and CI')
    const tokenRoute = page.getByRole('heading', {
      level: 2,
      name: 'Other clients and CI: use a token',
    })
    await tokenRoute.scrollIntoViewIfNeeded()
    await expect(page.locator('#token')).toBeAttached()
    await expect(page.locator('#wire')).toBeAttached()
    await expect(page.locator('#check')).toBeAttached()
    await beat(page, 2400)

    // ── 2 · THE HINTS ON /docs/mcp/tools ─────────────────────────────────────
    chapter('Follow the hints to /docs/mcp/tools')
    await page
      .locator('#consent ~ p')
      .getByRole('link', { name: 'MCP tools' })
      .first()
      .click()
    await expect(page).toHaveURL(`${SITE_ORIGIN}/docs/mcp/tools`)
    await expect(
      page.getByText('Each tool says what it does to your data:'),
    ).toBeVisible()
    await beat(page)

    for (const [name, title, chip] of [
      ['dispatch_prompt', 'Dispatch prompt', 'Reads'],
      ['add_lesson', 'Add lesson', 'Writes'],
      ['delete_work_item', 'Delete work item', 'Destructive'],
    ] as const) {
      chapter(`${title} — ${chip}`)
      const row = toolRow(page, name)
      await row.scrollIntoViewIfNeeded()
      await expect(row).toContainText(title)
      await expect(row.locator('[data-hint]')).toHaveText(chip)
      await beat(page, 2000)
    }

    // ── 3 · /docs/skills INSTALLS v0.4.0 ─────────────────────────────────────
    chapter('/docs/skills — the plugin brings three things, from v0.4.0')
    await page.goto(`${SITE_ORIGIN}/docs/skills`)
    const claudeCode = page.locator('section', {
      has: page.getByRole('heading', { level: 3, name: 'Claude Code' }),
    })
    await claudeCode.scrollIntoViewIfNeeded()
    await expect(claudeCode.getByRole('listitem')).toHaveCount(3)
    await expect(claudeCode).toContainText('The Motir MCP server')
    await expect(claudeCode).toContainText('The motir runner')
    await expect(
      claudeCode.locator('pre', { hasText: '/plugin marketplace add' }),
    ).toContainText('moooon-B-V/motir-skills#v0.4.0')
    await beat(page, 3200)

    // ── 4 · THE PRIVACY NOTICE ───────────────────────────────────────────────
    chapter('The privacy notice — AI clients you connect')
    await page.goto(`${SITE_ORIGIN}/legal/privacy`)
    const passage = page.getByText(
      'An AI client you connect is your choice and your service, not ours.',
    )
    await passage.scrollIntoViewIfNeeded()
    await expect(passage).toBeVisible()
    const paragraph = page.locator('p', { has: passage })
    await expect(paragraph).toContainText('Connected apps')
    await expect(paragraph).toContainText('Settings → Account → Tokens')
    await beat(page, 2400)

    chapter('… and Motir never receives the conversation')
    const conversation = page.getByText('It does not send us your')
    await conversation.scrollIntoViewIfNeeded()
    await expect(conversation).toBeVisible()
    await beat(page, 2400)
  })
})

test('an older Motir with no hints: the absent-hints line, and no chip', async ({
  page,
}) => {
  await catalogueMode('stripped')
  await page.goto(`${SITE_ORIGIN}/docs/mcp/tools`)
  const row = toolRow(page, 'delete_work_item')
  await expect(row).toContainText(
    'This Motir version does not publish this tool’s behaviour hints.',
  )
  await expect(page.locator('main li [data-hint]')).toHaveCount(0)
})

test('the catalogue unreachable: the existing unreachable state, and no chip', async ({
  page,
}) => {
  await catalogueMode('failing')
  await page.goto(`${SITE_ORIGIN}/docs/mcp/tools`)
  await expect(
    page.getByText('The tool catalogue is temporarily unreachable.'),
  ).toBeVisible()
  await expect(page.locator('[data-hint]')).toHaveCount(0)
  await expect(page.locator('[id^="tool-"]')).toHaveCount(0)
})

test.describe('at a phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('every title and chip stays visible, with no horizontal scroll', async ({
    page,
  }) => {
    await page.goto(`${SITE_ORIGIN}/docs/mcp/tools`)
    const row = toolRow(page, 'search_work_items_semantic')
    await row.scrollIntoViewIfNeeded()
    await expect(row).toContainText('Search work items by meaning')
    const chip = row.locator('[data-hint]')
    await expect(chip).toBeInViewport()
    const box = await chip.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
})
