import { describe, expect, it } from 'vitest'
import { mcpTransportFacts } from '@/lib/mcpWiring'
import { setupPrompt } from '@/lib/setupPrompt'
import { AGENT_INSTALLS, SKILLS_RELEASE_TAG } from '@/lib/skillsGuide'

/*
 * The setup prompt carries no fact of its own: the Claude Code plugin
 * commands, the release and the MCP address are read from the data the guides
 * render. These pin that, so a release bump or a moved endpoint can never
 * leave the copied prompt saying something the docs no longer do.
 */
describe('the setup prompt', () => {
  const prompt = setupPrompt()

  it('installs the Claude Code plugin with the guides’ own commands', () => {
    const plugin = AGENT_INSTALLS.find((a) => a.id === 'claude-code')!
      .blocks[0]!
    expect(prompt).toContain(plugin.code)
    expect(prompt).toContain(
      `/plugin marketplace add moooon-B-V/motir-skills#${SKILLS_RELEASE_TAG}`,
    )
  })

  it('names the current release and the MCP address', () => {
    expect(prompt).toContain(`Use release ${SKILLS_RELEASE_TAG}`)
    expect(prompt).toContain(mcpTransportFacts().url)
  })

  it('sends any other agent to the three guides that carry its specifics', () => {
    for (const path of ['/docs/mcp', '/docs/cli', '/docs/skills']) {
      expect(prompt).toContain(path)
    }
  })

  it('never asks for a token to be printed back', () => {
    expect(prompt).toContain('never print a token back')
  })
})
