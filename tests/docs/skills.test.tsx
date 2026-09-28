import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SkillsDocsPage from '@/app/docs/(guides)/skills/page'
import { DOCS_SURFACES } from '@/lib/docsSurfaces'
import {
  AGENT_INSTALLS,
  CLAUDE_CODE_UPDATE,
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
 * made — six agents, three skills — so a section that silently drops out of
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
      'motir-log-bug',
      'motir-mark',
    ])
    for (const skill of SKILL_NAMES) expect(h3, skill).toContain(skill)
    expect(SKILL_USAGE.map((s) => s.name)).toEqual([...SKILL_NAMES])
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
