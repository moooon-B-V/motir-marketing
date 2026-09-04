import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SandboxPage from '@/app/docs/(guides)/sandbox/page'

/*
 * The sandbox guide's shape (MOTIR-4392).
 *
 * ⚠️ WHAT THIS FILE CAN AND CANNOT SEE, said plainly. It asserts that the page
 * is a GUIDE rather than a definition — that it carries runnable commands, names
 * the grant, names the refusal as intended behaviour, links commands rather than
 * restating them, and states its own boundary. It CANNOT verify that a flag or a
 * permission key it prints exists in motir-core: that is a second repository,
 * and this lane runs on every pull request without reaching it.
 *
 * That half of the card's criterion was discharged by READING, at authoring
 * time, and the page's own header records what was read and where — including
 * the card's grant list turning out to be wrong. The DURABLE version of the
 * check now exists on the other side of MOTIR-4390: `/api/docs/cli-commands.json`
 * publishes every command and flag, so a `tests/seam/` spec could hold this page
 * against it once that route is deployed. It belongs in that lane and not this
 * one, because `vitest.config.mts` excludes `tests/seam/**` for a stated reason
 * — an app.motir.co restart must not redden unrelated pull requests.
 */

describe('the sandbox guide is instructions, not a definition', () => {
  it('carries runnable command blocks — the page had ZERO before this card', () => {
    const { container } = render(<SandboxPage />)
    const panes = container.querySelectorAll('pre')
    expect(panes.length).toBeGreaterThan(0)
    const text = [...panes].map((pane) => pane.textContent ?? '').join('\n')
    expect(text).toContain('docker pull ghcr.io/moooon-b-v/motir-sandbox')
    expect(text).toContain('docker run')
    expect(text).toContain('motir link')
    expect(text).toContain('motir doctor')
  })

  it('documents the five things a reader needs: start, environment, grant, output, failures', () => {
    // ⚠️ WIDENED BY MOTIR-4429 — three sections the deleted motir-core page
    // carried and this one had lost. The list is EXACT rather than a subset
    // check, deliberately: it is what makes a section quietly disappearing a
    // red test rather than a shorter page nobody measures, which is the family
    // of defect MOTIR-4375 → MOTIR-4429 is entirely made of.
    const { container } = render(<SandboxPage />)
    const headings = [...container.querySelectorAll('h2')].map(
      (heading) => heading.textContent ?? '',
    )
    expect(headings).toEqual([
      'What it confines — and what it does not',
      'Before you start',
      'Start one',
      'Or start it from VS Code instead',
      'Inside: link, check, run',
      'What the environment gives you',
      'What the token may do — and what it refuses',
      'What a run produces, and where to read it',
      'When it does not work',
      'What this page does not cover',
    ])
  })

  /*
   * ── The three restored sections (MOTIR-4429) ──────────────────────────────
   *
   * Each case asserts the FACT the section exists to carry, not the heading —
   * a heading is already pinned above, and a section that kept its title while
   * losing its content is the exact shape MOTIR-4397's ledger found.
   */

  it('says the NETWORK is open, so the confinement claim is not read as total', () => {
    // The page's opening paragraph says an agent "reaches your work tree and
    // not the rest of your machine". The deleted page qualified that: egress
    // is NOT confined. A confinement claim with its exception deleted is a
    // different and false claim, which is why this is a correction as much as
    // a restore — `Network` and `unprivileged` each appeared ZERO times.
    const { container } = render(<SandboxPage />)
    const text = container.textContent ?? ''
    expect(text).toMatch(/Network\s*—\s*OPEN, by design/)
    expect(text).toContain(
      'confines the filesystem blast radius and not egress',
    )
    expect(text).toContain('uid 1000')
  })

  it('states the prerequisites, INCLUDING the arm64 fact', () => {
    const { container } = render(<SandboxPage />)
    const text = container.textContent ?? ''
    expect(text).toContain('Docker, running')
    expect(text).toContain('linux/arm64')
    expect(text).toContain('nothing is emulated')
    // The folder you mount CONTAINS your checkouts — drawn as a tree, because
    // the sentence alone is what the page had been reduced to.
    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    expect(panes.join('\n')).toContain('start the container from HERE')
  })

  it('documents the VS Code path, with the heredoc quoted', () => {
    const { container } = render(<SandboxPage />)
    const text = container.textContent ?? ''
    expect(text).toContain('Dev Containers')
    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    const code = panes.join('\n')
    expect(code).toContain('.devcontainer/devcontainer.json')

    // ⚠️ THE DELIMITER IS QUOTED, and that is the assertion worth having.
    // Unquoted, the shell expands the two substitutions to empty strings on
    // the way into the file and the reader gets a container that mounts
    // nothing and finds no credential — a silent failure strictly worse than
    // being stuck. Review cannot be relied on to notice a missing quote.
    expect(code).toContain("<<'JSON'")
    expect(code).toContain('${localWorkspaceFolder}')
    expect(code).toContain('${localEnv:HOME}')
  })

  it('builds BOTH devcontainer blocks from one object, so they cannot disagree', () => {
    // The listing and the heredoc show the same config under two captions. Two
    // typed copies is a `mounts` entry corrected in one of them and published
    // wrong in the other.
    const { container } = render(<SandboxPage />)
    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    const withMount = panes.filter((pane) => pane.includes('"workspaceMount"'))
    expect(withMount.length).toBe(2)

    const heredoc = withMount.find((pane) => pane.includes("<<'JSON'"))
    const listing = withMount.find((pane) => !pane.includes("<<'JSON'"))
    expect(heredoc).toBeDefined()
    expect(listing).toBeDefined()
    // The heredoc CONTAINS the listing verbatim — which is only true if one is
    // interpolated into the other rather than typed twice.
    expect(heredoc).toContain(listing!)
  })

  it('no longer records the VS Code path as undocumented', () => {
    // The closing paragraph said the editor integrations "are not documented
    // here yet" — a deleted section recorded as a decision. It was neither.
    const { container } = render(<SandboxPage />)
    expect(container.textContent).not.toMatch(
      /editor integrations, are not documented/,
    )
  })

  it('lists the grant the SHIPPED constant carries, not the card’s four', () => {
    // ⚠️ MOTIR-4392 states the grant as four keys. `CLI_TOKEN_GRANT` on
    // motir-core's `origin/main` carries six — `lesson:view` and
    // `lesson:reinforce` were added by MOTIR-3480 and MOTIR-3553. The page
    // carries the shipped set; this pins that it was not quietly reverted to
    // the card's list by a later editor reading the card and not the constant.
    const { container } = render(<SandboxPage />)
    const text = container.textContent ?? ''
    for (const key of [
      'project:browse',
      'lesson:view',
      'lesson:reinforce',
      'work_item:edit',
      'comment:add',
      'ai:plan',
    ]) {
      expect(text, key).toContain(key)
    }
  })

  it('names the plan-append refusal as INTENDED behaviour, not an error', () => {
    const { container } = render(<SandboxPage />)
    const text = container.textContent ?? ''
    expect(text).toContain('ai:view_plan')
    // The key half: a reader who meets the refusal must be told it is the
    // design. A page that merely listed the missing key would leave them
    // filing a bug against a working guard.
    expect(text).toMatch(/refus/i)
    expect(text).toMatch(/the design rather than a bug/i)
  })

  it('LINKS the command reference instead of restating it — one home per fact', () => {
    const { container } = render(<SandboxPage />)
    const hrefs = [...container.querySelectorAll('a')].map((a) =>
      a.getAttribute('href'),
    )
    expect(hrefs).toContain('/docs/cli')
    // A restated command TABLE is the thing being avoided; the page may still
    // show the handful of commands a first run types.
    expect(container.querySelectorAll('table').length).toBe(0)
  })

  it('states its own boundary, so the split with /docs/cli is legible', () => {
    const { container } = render(<SandboxPage />)
    expect(container.textContent).toContain('What this page does not cover')
  })
})
