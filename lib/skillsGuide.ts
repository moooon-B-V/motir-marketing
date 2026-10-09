/**
 * THE FACTS `/docs/skills` IS BUILT FROM (MOTIR-6717) — the release it pins,
 * where each agent reads skills from, and what each skill does.
 *
 * ⚠️ ONE TAG, AND EVERY COMMAND IS BUILT FROM IT. The page tells a reader to
 * fetch a specific release of `moooon-B-V/motir-skills`, and a page whose
 * blocks named two different tags would install two different sets of skills
 * depending on which section was copied. So the tag is `SKILLS_RELEASE_TAG`,
 * every command below interpolates it, and `tests/docs/skills.test.tsx`
 * asserts that every tag-shaped string on the rendered page equals it. A new
 * release is one edit here.
 *
 * ⚠️ EVERY PATH WAS READ FROM THAT AGENT'S OWN DOCUMENTATION, on `CHECKED_ON`,
 * and the page links the source beside each section. These move fast: an
 * agent that stops documenting `SKILL.md` skills is dropped from the list
 * rather than kept on a remembered path. Where an agent reads several
 * directories, the block uses the one its own documentation names first for
 * that agent (`~/.cursor/skills`, not the shared `~/.agents/skills` it also
 * reads), and the note names the others.
 *
 * Checked by RUNNING, not only by reading, on `CHECKED_ON`: the Claude Code
 * plugin-marketplace block and the `~/.claude/skills` copy (the agent listed
 * all three skills of `v0.1.0`), and the OpenCode copy (`opencode debug
 * skill` listed all three). The other four were checked against their documentation only.
 *
 * ⚠️ NO MCP TOOL NAMES HERE. The skills call Motir through its MCP server, and
 * this repository cannot check a tool name it types — the same rule
 * `lib/mcpWiring.ts` follows. The usage sections say what a reader SEES in
 * Motir, which is what they need, and never which tool produced it.
 */

/** The `motir-skills` release every command on the page installs. */
export const SKILLS_RELEASE_TAG = 'v0.7.0'

/** The public repository, as `owner/name`. */
export const SKILLS_REPO = 'moooon-B-V/motir-skills'

export const SKILLS_REPO_URL = `https://github.com/${SKILLS_REPO}`

export const SKILLS_RELEASE_URL = `${SKILLS_REPO_URL}/releases/tag/${SKILLS_RELEASE_TAG}`

/**
 * The date every agent's documentation was last read against this page, as an
 * ISO date. The page formats it for the reader's locale and hands it to the
 * document as a value, so a German page never reads "6 October 2026".
 */
export const CHECKED_ON = '2026-10-06'

/**
 * Every skill the release carries — what a reader's agent lists once the page's
 * install step has run, since the copy step takes every `motir-*` folder and
 * the plugin carries them all. Read from the tag's `plugins/motir/skills/`
 * folder.
 */
export const RELEASE_SKILLS = [
  'motir-run',
  'motir-log-bug',
  'motir-mark',
  'motir-guide',
  'motir-fix-bugs',
  'motir-fix',
  'motir-continue',
] as const

/**
 * The skills the page has a usage section for, in the order it documents them.
 * ⚠️ A SUBSET OF `RELEASE_SKILLS` BY TYPE, not the same list: a release can
 * carry a skill before its usage section lands (`v0.2.0` shipped
 * `motir-fix-bugs` before MOTIR-6724 documented it). The install copy names
 * `RELEASE_SKILLS`, so it stays true either way.
 */
export const SKILL_NAMES = [
  'motir-run',
  'motir-fix',
  'motir-continue',
  'motir-log-bug',
  'motir-mark',
  'motir-guide',
  'motir-fix-bugs',
] as const

/**
 * The clone every copy-install starts from: a shallow clone OF THE TAG, into a
 * folder the next line removes, so nothing is left behind to go stale.
 *
 * ⚠️ THE SKILLS LIVE UNDER `plugins/motir/skills/` SINCE `v0.4.2`
 * (MOTIR-7186), not at the repository root. The path is the release's, so it
 * moves with `SKILLS_RELEASE_TAG`: a copy from a root `skills/` folder at a
 * newer tag matches nothing and copies nothing.
 */
function copyInstall(skillsDir: string): string {
  return [
    `git clone --depth 1 --branch ${SKILLS_RELEASE_TAG} ${SKILLS_REPO_URL}.git`,
    `mkdir -p ${skillsDir}`,
    `cp -R motir-skills/plugins/motir/skills/motir-* ${skillsDir}/`,
    'rm -rf motir-skills',
  ].join('\n')
}

/**
 * One pane of commands. The prose around it is the document's
 * (`content/docs/skills/en.md`) and its caption and copy-button name are
 * catalogue copy (`docs.guideLabels.*`), both found by `id`: this is only what
 * a reader copies.
 */
export interface InstallBlock {
  /** The slot the document places it in, and the key of its labels. */
  id: string
  code: string
}

export interface AgentInstall {
  /** Anchor id on the page. */
  id: string
  /** The agent, as its maker names it. */
  label: string
  blocks: InstallBlock[]
  /** That agent's own skills documentation. */
  docsUrl: string
}

export const AGENT_INSTALLS: AgentInstall[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    blocks: [
      {
        id: 'claude-code-plugin',
        code: [
          `/plugin marketplace add ${SKILLS_REPO}#${SKILLS_RELEASE_TAG}`,
          '/plugin install motir@motir-skills',
        ].join('\n'),
      },
      {
        id: 'claude-code-copy',
        code: copyInstall('~/.claude/skills'),
      },
    ],
    docsUrl: 'https://code.claude.com/docs/en/discover-plugins',
  },
  {
    id: 'codex',
    label: 'Codex',
    blocks: [
      {
        id: 'codex',
        code: copyInstall('~/.agents/skills'),
      },
    ],
    docsUrl: 'https://learn.chatgpt.com/docs/build-skills',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    blocks: [
      {
        id: 'cursor',
        code: copyInstall('~/.cursor/skills'),
      },
    ],
    docsUrl: 'https://cursor.com/docs/context/skills',
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    blocks: [
      {
        id: 'gemini-cli',
        code: copyInstall('~/.gemini/skills'),
      },
    ],
    docsUrl: 'https://geminicli.com/docs/cli/skills/',
  },
  {
    id: 'copilot-vs-code',
    label: 'GitHub Copilot in VS Code',
    blocks: [
      {
        id: 'copilot-vs-code',
        code: copyInstall('~/.copilot/skills'),
      },
    ],
    docsUrl:
      'https://code.visualstudio.com/docs/copilot/customization/agent-skills',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    blocks: [
      {
        id: 'opencode',
        code: copyInstall('~/.config/opencode/skills'),
      },
    ],
    docsUrl: 'https://opencode.ai/docs/skills/',
  },
]

export interface SkillUsage {
  name: (typeof SKILL_NAMES)[number]
  /**
   * What the reader types to their agent. The document carries each phrase as
   * inline code (`tests/docs/skills.test.tsx` holds the two together); what the
   * skill does and what the reader sees are the document's prose.
   */
  say: string[]
}

export const SKILL_USAGE: SkillUsage[] = [
  { name: 'motir-run', say: ['motir run', 'motir run ACME-12', 'motir next'] },
  { name: 'motir-fix', say: ['motir fix ACME-12'] },
  { name: 'motir-continue', say: ['motir continue ACME-12'] },
  {
    name: 'motir-log-bug',
    say: ['motir log bug the export button does nothing on an empty board'],
  },
  { name: 'motir-mark', say: ['motir mark ACME-12 done'] },
  { name: 'motir-guide', say: ['motir guide ACME-12', 'motir guide'] },
  { name: 'motir-fix-bugs', say: ['motir fix bugs', 'motir fix bugs 3'] },
]

/**
 * Updating in Claude Code. ⚠️ NOT "add the marketplace again": a marketplace
 * already declared at one ref refuses to be added at another ("its network
 * source differs from the one declared for it in settings"), checked by
 * running it on `CHECKED_ON`. Removing it first is what works, and removing
 * it uninstalls the plugin, so the block installs it again.
 */
export const CLAUDE_CODE_UPDATE: InstallBlock = {
  id: 'update',
  code: [
    '/plugin marketplace remove motir-skills',
    `/plugin marketplace add ${SKILLS_REPO}#${SKILLS_RELEASE_TAG}`,
    '/plugin install motir@motir-skills',
  ].join('\n'),
}
