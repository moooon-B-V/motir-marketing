import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SkillsDocsPage from '@/app/docs/(guides)/skills/page'
import { DOCS_SURFACES } from '@/lib/docsSurfaces'
import {
  AGENT_INSTALLS,
  CLAUDE_CODE_UPDATE,
  RELEASE_SKILLS,
  SKILL_NAMES,
  SKILL_USAGE,
  SKILLS_RELEASE_TAG,
} from '@/lib/skillsGuide'

/*
 * `/docs/skills` (MOTIR-6717).
 *
 * ⚠️ THE HEADINGS ARE NAMED HERE ON PURPOSE, which is the opposite of what the
 * surface tests next door do. Those walk the file system because the defect
 * they guard is a page nobody listed. This one guards a CONTRACT the story
 * made — six agents, and a usage section per documented skill — so a section that silently drops out of
 * `lib/skillsGuide.ts` must turn this red rather than shrink the expectation
 * with it. A later release that adds a skill adds its name here in the same
 * pull request.
 *
 * ⚠️ AND THE TAG IS CHECKED ON THE RENDER, not on the module. What a reader
 * copies is the pane's text, so every tag-shaped string the page renders is
 * collected and must equal `SKILLS_RELEASE_TAG`. A block typed with a literal
 * tag would pass a module-level check and fail here the day the constant moves.
 */

const AGENTS = [
  'Claude Code',
  'Codex',
  'Cursor',
  'Gemini CLI',
  'GitHub Copilot in VS Code',
  'OpenCode',
]

function page() {
  return render(<SkillsDocsPage />).container
}

function headings(container: HTMLElement, level: 'h2' | 'h3'): string[] {
  return [...container.querySelectorAll(level)].map(
    (h) => h.textContent?.trim() ?? '',
  )
}

describe('/docs/skills', () => {
  it('has an install section for each of the six agents', () => {
    const h3 = headings(page(), 'h3')
    for (const agent of AGENTS) expect(h3, agent).toContain(agent)
    expect(AGENT_INSTALLS.map((a) => a.label)).toEqual(AGENTS)
  })

  it('has a usage section for each skill the release carries', () => {
    const h3 = headings(page(), 'h3')
    expect([...SKILL_NAMES]).toEqual([
      'motir-run',
      'motir-fix',
      'motir-continue',
      'motir-log-bug',
      'motir-mark',
      'motir-guide',
      'motir-fix-bugs',
    ])
    for (const skill of SKILL_NAMES) expect(h3, skill).toContain(skill)
    expect(SKILL_USAGE.map((s) => s.name)).toEqual([...SKILL_NAMES])
  })

  it('documents only skills the pinned release carries, and names every one it installs', () => {
    // A release can carry a skill before its usage section lands, so the
    // documented set is a subset and the install copy names the whole.
    for (const skill of SKILL_NAMES)
      expect(RELEASE_SKILLS, skill).toContain(skill)
    const text = page().textContent ?? ''
    for (const skill of RELEASE_SKILLS) expect(text, skill).toContain(skill)
    expect(text).not.toMatch(/\bthree\b/)
  })

  it('tells a manual-card reader what motir-guide does and shows them', () => {
    const container = page()
    const section = container
      .querySelector('h3#motir-guide')
      ?.closest('section')
    expect(section, 'the motir-guide section').not.toBeNull()
    const text = section?.textContent ?? ''
    // Outline 1 — what to say.
    expect(text).toContain('motir guide ACME-12')
    // Outline 2 — one step, a checked tick, a failed check left unticked,
    // stop and resume, and it asks before writing steps it proposed.
    expect(text).toContain('one step at a time')
    expect(text).toContain('is not ticked')
    expect(text).toContain('picks up where you left off')
    expect(text).toContain('asks you before writing them')
    // Outline 3 — the To-do list, and Done with a summary comment.
    expect(text).toContain('To-do list')
    expect(text).toContain('moves to Done, with a comment summarising')
  })

  it('tells a reader with a red pull request what motir-fix does and shows them', () => {
    const section = page().querySelector('h3#motir-fix')?.closest('section')
    expect(section, 'the motir-fix section').not.toBeNull()
    const text = section?.textContent ?? ''
    // What to say: one work item, named.
    expect(text).toContain('motir fix ACME-12')
    // What it does: claims the repair, fixes on the pull request's own
    // branch, keeps going until green or five attempts.
    expect(text).toContain('claims the repair')
    expect(text).toContain('on the branch it already has, never a new one')
    expect(text).toContain('until CI is green or it has tried five times')
    // How it differs from motir fix bugs.
    expect(text).toContain('Not the same as motir fix bugs')
    // What the reader sees: the repair on the work item.
    expect(text).toContain('says it is being fixed, and by whom')
  })

  it('tells a reader whose run died what motir-continue does, and when to use fix or run instead', () => {
    const section = page()
      .querySelector('h3#motir-continue')
      ?.closest('section')
    expect(section, 'the motir-continue section').not.toBeNull()
    const text = section?.textContent ?? ''
    // What to say: one work item, named.
    expect(text).toContain('motir continue ACME-12')
    // What it does: claims the continue, carries on the branch the dead run
    // left, delivers as a fresh run does.
    expect(text).toContain('whose run died')
    expect(text).toContain('claims the continue')
    expect(text).toContain('the branch that run left')
    expect(text).toContain('never a new one')
    // How it differs from motir fix (a red pull request) and motir run (a
    // work item nobody has started).
    expect(text).toContain(
      'Use motir fix ACME-12 instead when the work item already has a pull request that is red',
    )
    expect(text).toContain(
      'motir run ACME-12 for a work item nobody has started',
    )
    // What the reader sees: the Development section's own words.
    expect(text).toContain('Run died')
    expect(text).toContain('it is being continued, and by whom')
  })

  it('tells a Bugs-folder reader what motir-fix-bugs does and shows them', () => {
    const section = page()
      .querySelector('h3#motir-fix-bugs')
      ?.closest('section')
    expect(section, 'the motir-fix-bugs section').not.toBeNull()
    const text = section?.textContent ?? ''
    // Outline 1 — what to say, with and without a limit.
    expect(text).toContain('motir fix bugs')
    expect(text).toContain('motir fix bugs 3')
    // Outline 2 — one at a time, oldest first; one pull request per bug; a
    // waiting bug linked and moved beside its card; the rest commented and
    // set aside; a closing report.
    expect(text).toContain('one bug at a time, oldest first')
    expect(text).toContain(
      'one pull request that fixes that bug and nothing else',
    )
    expect(text).toContain(
      'linked to that work item and moved under the same story',
    )
    expect(text).toContain('gets a comment and is set aside')
    expect(text).toContain('It ends with a report')
    // Outline 3 — Implemented with pull requests, Blocked with a link,
    // comments with evidence.
    expect(text).toContain('moves to Implemented with its pull request linked')
    expect(text).toContain('moves to Blocked, with a blocked by link')
    expect(text).toContain('a comment with the evidence')
  })

  it('has the prerequisite, the install, the use, the wrong-card and the updating sections', () => {
    const container = page()
    for (const id of ['before', 'install', 'use', 'wrong', 'updating']) {
      expect(container.querySelector(`h2#${id}`), id).not.toBeNull()
    }
    // The prerequisite points at the MCP guide, which is where the setup lives.
    expect(
      container.querySelector('a[href="/docs/mcp"]'),
      'the MCP guide link',
    ).not.toBeNull()
  })

  it('installs v0.7.0 — the release whose motir-guide corrects a step on your yes', () => {
    // A literal on purpose: the constant moving is the change being made, so a
    // test that read the constant back would agree with any tag. v0.5.0 was the
    // first to carry motir-continue (MOTIR-7268); v0.6.0 made a decision work
    // item publish its page, and v0.7.0 lets motir-guide correct a step
    // (MOTIR-7552). Every skill is still the seven of v0.5.0.
    expect(SKILLS_RELEASE_TAG).toBe('v0.7.0')
    expect(RELEASE_SKILLS).toContain('motir-continue')
  })

  it('copies the skills from where the pinned release keeps them', () => {
    // Since v0.4.2 (MOTIR-7186) the skills live under plugins/motir/skills/,
    // and a copy from a root skills/ folder at that tag copies nothing.
    const panes = [...page().querySelectorAll('pre')]
      .map((pre) => pre.textContent ?? '')
      .filter((text) => text.includes('git clone'))
    expect(panes).toHaveLength(
      AGENT_INSTALLS.reduce((n, a) => n + a.blocks.length, 0) - 1,
    )
    for (const pane of panes) {
      expect(pane).toContain('cp -R motir-skills/plugins/motir/skills/motir-* ')
      expect(pane).not.toMatch(/motir-skills\/skills\//)
    }
  })

  it('says the Claude Code plugin brings three things, and links the MCP sign-in', () => {
    const container = page()
    const section = container
      .querySelector('h3#claude-code')!
      .closest('section')!
    const items = [...section.querySelectorAll('li')].map(
      (li) => li.textContent ?? '',
    )
    expect(items).toHaveLength(3)
    expect(items[0]).toContain('The seven skills')
    expect(items[1]).toContain('The Motir MCP server')
    expect(items[1]).toContain('no token')
    expect(items[2]).toContain('The motir runner')
    expect(items[2]).toContain('Node.js 22 or newer')
    expect(section.querySelector('a[href="/docs/mcp#claude"]')).not.toBeNull()
    // Only Claude Code's install brings more than skills.
    for (const agent of AGENT_INSTALLS.filter((a) => a.id !== 'claude-code')) {
      expect(agent.brings, agent.id).toBeUndefined()
    }
  })

  it('tells a Claude Code reader they need no token, and the others where to get one', () => {
    const before = page().querySelector('h2#before')!.nextElementSibling!
    expect(before.textContent).toContain('there is no token')
    expect(before.textContent).toContain('personal access token')
  })

  it('pins every command it renders to ONE release tag', () => {
    const container = page()
    const panes = [...container.querySelectorAll('pre')].map(
      (pre) => pre.textContent ?? '',
    )
    // Every install block and the update block, and nothing silently missing.
    const blockCount =
      AGENT_INSTALLS.reduce((n, a) => n + a.blocks.length, 0) + 1
    expect(panes.length).toBe(blockCount)

    // Each pane fetches the release, so each carries the tag.
    for (const pane of panes) expect(pane).toContain(SKILLS_RELEASE_TAG)

    // And no tag-shaped string on the whole page names a different one.
    const tags = new Set(
      (container.textContent ?? '').match(/\bv\d+\.\d+\.\d+\b/g) ?? [],
    )
    expect([...tags]).toEqual([SKILLS_RELEASE_TAG])
  })

  it('links each agent section to that agent’s own documentation', () => {
    const container = page()
    for (const agent of AGENT_INSTALLS) {
      const link = [...container.querySelectorAll('a')].find(
        (a) => a.textContent === `${agent.label} documentation`,
      )
      expect(link?.getAttribute('href'), agent.label).toBe(agent.docsUrl)
      expect(agent.docsUrl).toMatch(/^https:\/\//)
    }
  })

  it('gives every copy button its own accessible name', () => {
    const names = [...page().querySelectorAll('button')].map((b) =>
      b.getAttribute('aria-label'),
    )
    expect(names.length).toBeGreaterThan(0)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toContain(CLAUDE_CODE_UPDATE.copyLabel)
  })

  it('is a surface the docs rail and index draw', () => {
    expect(DOCS_SURFACES.map((s) => s.href)).toContain('/docs/skills')
  })
})
