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
    const { container } = render(<SandboxPage />)
    const headings = [...container.querySelectorAll('h2')].map(
      (heading) => heading.textContent ?? '',
    )
    expect(headings).toEqual([
      'Start one',
      'Inside: link, check, run',
      'What the environment gives you',
      'What the token may do — and what it refuses',
      'What a run produces, and where to read it',
      'When it does not work',
      'What this page does not cover',
    ])
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
