import { APP_ORIGIN } from './appOrigin'
import { mcpTransportFacts } from './mcpWiring'
import { siteUrl } from './siteOrigin'
import { AGENT_INSTALLS, SKILLS_RELEASE_TAG } from './skillsGuide'

/*
 * THE SETUP PROMPT (2026-10 redesign) — one block of text a visitor copies
 * and pastes into ANY agent, which then sets Motir up there: the MCP server,
 * the CLI and the skills.
 *
 * ⚠️ NOTHING HERE IS A SECOND COPY OF A FACT. Claude Code's plugin commands
 * are the Claude Code entry of `AGENT_INSTALLS` (the same block the skills and
 * plugin guides render); the release is `SKILLS_RELEASE_TAG`; the MCP address
 * is `mcpTransportFacts()`. Everything that differs per agent — its MCP config
 * file, its skills folder, the CLI's install command (which the CLI guide reads
 * live from the CLI's own catalogue) — is NOT spelled out: the prompt sends the
 * agent to the guide that already carries it, so a release bump or a new
 * agent never leaves this text stale.
 */

export function setupPrompt(): string {
  const claudeCode = AGENT_INSTALLS.find((agent) => agent.id === 'claude-code')
  const pluginCommands = claudeCode?.blocks[0]?.code ?? ''
  const version = SKILLS_RELEASE_TAG.replace(/^v/, '')
  const { url: mcpUrl } = mcpTransportFacts()
  const docs = (path: string) => siteUrl(path)

  return [
    'Set up Motir for me in this agent. Motir (https://motir.co) is an AI planning and project-management tool. You will connect to it through three things: its MCP server, its CLI and its skills.',
    '',
    'First, work out which agent you are, then follow the matching section. Ask me before doing anything that needs my password or a token, and never print a token back to me.',
    '',
    '## If you are Claude Code',
    '',
    'Install the Motir plugin. Run these two commands:',
    '',
    pluginCommands,
    '',
    `That one install brings the skills, the Motir MCP server and a runner for the CLI (the runner needs Node.js 22 or newer). Then run /mcp, pick motir, choose Authenticate, and I will finish the sign-in in my browser. Check it worked: /plugin shows motir at ${version}, and /mcp lists motir. Details: ${docs('/docs/claude-code-plugin')}`,
    '',
    '## Any other agent',
    '',
    `1. Connect the MCP server. Read ${docs('/docs/mcp')} and follow the section for this agent. The server URL is ${mcpUrl}. If this agent can sign in with OAuth, use that and I will approve it in my browser. Otherwise ask me for a personal access token (Motir: Settings, then Account, then Tokens) and send it as a Bearer token.`,
    `2. Install the CLI. Read ${docs('/docs/cli')} for the install command, install it, and run \`motir login\`.`,
    `3. Install the skills. Read ${docs('/docs/skills')}, find the section for this agent and run its install. Use release ${SKILLS_RELEASE_TAG}.`,
    '',
    '## When you are done',
    '',
    `Check that the Motir MCP tools are listed and that \`motir --help\` runs. Then tell me what you installed, where, and anything you could not do. If I have no Motir account yet, I can create one at ${APP_ORIGIN}.`,
  ].join('\n')
}
