import { expect, test } from '@playwright/test'

/*
 * THE COPY AFFORDANCE, IN A REAL BROWSER (MOTIR-4979).
 *
 * ⚠️ WHY THIS IS IN THE BROWSER LANE AND NOT BESIDE
 * `tests/docs/copyControls.test.tsx`. That file covers the component
 * thoroughly — the three states, the durations, the refusal, the accessible
 * names — and it CANNOT prove the one thing that matters most: that the
 * clipboard ends up holding the text. In jsdom `navigator.clipboard` is a stub
 * this suite installs itself, so asserting against it proves the stub was
 * called. Only a real browser can be granted `clipboard-read`, have the write
 * actually happen, and be asked afterwards what it holds.
 *
 * ⚠️ AND THE PROFILE UNDER TEST IS DELIBERATELY NOT THE DEFAULT.
 * The card was widened on 2026-09-10: the page now renders nine variants, and
 * `opencode` is the one worth asserting because it takes TWO credential mounts
 * where five profiles take one. A build that templated a single mount line
 * passes on `claude` and drops OpenCode's second `-v` silently — so a spec that
 * copies the default would be green over exactly the defect the selector
 * exists to prevent. `antigravity` (no mount at all) is asserted beside it for
 * the other end of the same axis.
 *
 * ── ⚠️ THE REFUSAL PATH IS THE POINT, AND IT IS ASSERTED NEGATIVELY ────────
 * A silent no-op is the failure the whole design argues about: the reader
 * believes they hold the command and pastes whatever was there before. So the
 * denied-permission case asserts BOTH that the failure is shown AND that the
 * success state is not — a button that flashed `Copied` on a clipboard that was
 * never written is the exact defect, and only the second assertion catches it.
 */

const PAGE = '/docs/sandbox'

/** What the browser actually holds, read back through the granted permission. */
async function clipboardText(page: import('@playwright/test').Page) {
  return page.evaluate(() => navigator.clipboard.readText())
}

test.describe('a reader copies a step’s command', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('the clipboard holds the SELECTED profile’s command, exactly', async ({
    page,
  }) => {
    await page.goto(PAGE)

    // OpenCode: TWO credential mounts. The whole point of picking it.
    await page.getByRole('radio', { name: 'OpenCode' }).click()

    const runPane = page.locator('pre', { hasText: 'docker run' }).first()
    await expect(runPane).toContainText('motir-sandbox:opencode')
    const onScreen = (await runPane.textContent()) ?? ''

    await page.getByRole('button', { name: 'Copy the run command' }).click()

    const held = await clipboardText(page)

    // ⚠️ EXACT equality, not `toContain`. Truncation at a line break is the
    // plausible bug — the command is five lines with trailing backslashes —
    // and a substring assertion walks straight past it.
    expect(held).toBe(onScreen)

    // And it is genuinely the OpenCode shape: both mounts, not one.
    const mountLines = held
      .split('\n')
      .filter((l) => l.trim().startsWith('-v '))
    expect(mountLines).toHaveLength(4)
    expect(held).toContain('.config/opencode')
    expect(held).toContain('.local/share/opencode')
  })

  test('switching profile changes what the clipboard gets', async ({
    page,
  }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the run command' })

    // ⚠️ ANCHOR ON THE RUN PANE, not on the tag. The image tag appears in FOUR
    // panes — pull, run, the heredoc that writes the dev container file, and
    // the listing of that file — so filtering `pre` by the tag alone is a
    // strict-mode violation rather than a narrowing. The pane this test is
    // about is the one that starts `docker run`.
    const runPane = page.locator('pre', { hasText: 'docker run' }).first()

    await page.getByRole('radio', { name: 'Antigravity CLI' }).click()
    await expect(runPane).toContainText('motir-sandbox:antigravity')
    await copy.click()
    const antigravity = await clipboardText(page)

    await page.getByRole('radio', { name: 'Aider' }).click()
    await expect(runPane).toContainText('motir-sandbox:aider')
    await copy.click()
    const aider = await clipboardText(page)

    // The two ends of the shape axis: none, and a file bind plus an env var.
    expect(antigravity).not.toContain('-e ')
    expect(
      antigravity.split('\n').filter((l) => l.trim().startsWith('-v ')),
    ).toHaveLength(2)
    expect(aider).toContain('-e ANTHROPIC_API_KEY')
    expect(aider).toContain('.aider.conf.yml')
    expect(antigravity).not.toBe(aider)
  })

  test('the dev container config copies as ONE paste — folder and file', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await page
      .getByRole('button', { name: 'Copy the dev container config command' })
      .click()

    const held = await clipboardText(page)

    // One paste has to do both, which is why 2b is one step and not two.
    expect(held.startsWith('mkdir -p .devcontainer')).toBe(true)
    expect(held).toContain("cat > .devcontainer/devcontainer.json <<'JSON'")
    // The quotes are load-bearing: unquoted, the shell expands these two on the
    // way into the file and the reader gets a container that mounts nothing.
    expect(held).toContain('${localWorkspaceFolder}')
    expect(held).toContain('${localEnv:HOME}')
  })

  test('the copied state reverts, so the button is reusable', async ({
    page,
  }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the pull command' })

    await copy.click()
    await expect(copy).toHaveAttribute('data-state', 'copied')
    // The design's 1600 ms. Waited for rather than slept through.
    await expect(copy).toHaveAttribute('data-state', 'idle', { timeout: 5_000 })
  })

  test('is operable by KEYBOARD alone', async ({ page }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the pull command' })

    await copy.focus()
    await page.keyboard.press('Enter')

    await expect(copy).toHaveAttribute('data-state', 'copied')
    expect(await clipboardText(page)).toContain('docker pull')
  })

  test('the code pane is still keyboard-reachable for SCROLLING', async ({
    page,
  }) => {
    await page.goto(PAGE)

    // ⚠️ THE BUTTON MUST NOT HAVE TAKEN THE PANE'S PLACE IN THE TAB ORDER.
    // The pane overflows horizontally — the `docker run` lines are long — and
    // `tabIndex=0` is what lets a keyboard user scroll it at all. Adding a
    // focusable control to the header is exactly the change that invites
    // dropping it, and the loss is invisible to a mouse.
    const pane = page.locator('pre', { hasText: 'docker run' }).first()
    await expect(pane).toHaveAttribute('tabindex', '0')

    await pane.focus()
    await expect(pane).toBeFocused()
  })
})

test.describe('the clipboard is REFUSED', () => {
  // No `clipboard-write` grant. Chromium then rejects `writeText`, which is the
  // real shape of the failure this feature exists for — an insecure context or
  // a denied permission, not an exception we threw ourselves.
  test.use({ permissions: [] })

  test('says so, and does NOT claim success', async ({ page }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the run command' })

    await copy.click()

    await expect(copy).toHaveAttribute('data-state', 'failed')
    await expect(copy).toContainText('Copy failed')
    await expect(
      page.getByText(
        'Couldn’t reach the clipboard — select the text and copy it by hand.',
      ),
    ).toBeVisible()

    // ⚠️ THE NEGATIVE IS THE ASSERTION THAT MATTERS. A button that flashed
    // `Copied` over a clipboard that was never written is the defect; the
    // positive assertions above would pass on a build that showed both.
    await expect(copy).not.toContainText('Copied')
  })

  test('the failure does NOT time out', async ({ page }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the run command' })

    await copy.click()
    await expect(copy).toHaveAttribute('data-state', 'failed')

    // Well past the confirmation's own 1600 ms. A build that reused the copied
    // timer for the failure would be idle here, and the reader would be looking
    // at a button that says nothing went wrong.
    await page.waitForTimeout(2_500)
    await expect(copy).toHaveAttribute('data-state', 'failed')
  })

  test('clears when focus leaves the pane', async ({ page }) => {
    await page.goto(PAGE)
    const copy = page.getByRole('button', { name: 'Copy the run command' })

    await copy.click()
    await expect(copy).toHaveAttribute('data-state', 'failed')

    await page.getByRole('radio', { name: 'Codex CLI' }).click()

    await expect(copy).toHaveAttribute('data-state', 'idle')
  })
})
