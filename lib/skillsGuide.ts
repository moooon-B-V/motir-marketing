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
export const SKILLS_RELEASE_TAG = 'v0.2.1'

/** The public repository, as `owner/name`. */
export const SKILLS_REPO = 'moooon-B-V/motir-skills'

export const SKILLS_REPO_URL = `https://github.com/${SKILLS_REPO}`

export const SKILLS_RELEASE_URL = `${SKILLS_REPO_URL}/releases/tag/${SKILLS_RELEASE_TAG}`

/** The date every agent's documentation was last read against this page. */
export const CHECKED_ON = '28 September 2026'

/**
 * Every skill the release carries — what a reader's agent lists once the page's
 * install step has run, since the copy step takes every `motir-*` folder and
 * the plugin carries them all. Read from the tag's `skills/` folder.
 */
export const RELEASE_SKILLS = [
  'motir-run',
  'motir-log-bug',
  'motir-mark',
  'motir-guide',
  'motir-fix-bugs',
] as const

/**
 * The skills the page has a usage section for, in the order it documents them.
 * ⚠️ A SUBSET OF `RELEASE_SKILLS`, not the same list: the pinned release (since `v0.2.0`) ships
 * `motir-fix-bugs` beside `motir-guide`, and its usage section lands with its
 * own card (MOTIR-6724). The install copy counts `RELEASE_SKILLS`, so it stays
 * true either way.
 */
export const SKILL_NAMES = [
  'motir-run',
  'motir-log-bug',
  'motir-mark',
  'motir-guide',
] as const

/**
 * The clone every copy-install starts from: a shallow clone OF THE TAG, into a
 * folder the next line removes, so nothing is left behind to go stale.
 */
function copyInstall(skillsDir: string): string {
  return [
    `git clone --depth 1 --branch ${SKILLS_RELEASE_TAG} ${SKILLS_REPO_URL}.git`,
    `mkdir -p ${skillsDir}`,
    `cp -R motir-skills/skills/motir-* ${skillsDir}/`,
    'rm -rf motir-skills',
  ].join('\n')
}

export interface InstallBlock {
  /** The pane's caption — where the reader types it. */
  caption: string
  code: string
  /** An accessible name for the copy button, when the caption is not enough. */
  copyLabel: string
}

export interface AgentInstall {
  /** Anchor id on the page. */
  id: string
  /** The agent, as its maker names it. */
  label: string
  /** One or two sentences before the blocks: what this agent reads. */
  intro: string
  blocks: InstallBlock[]
  /** After the blocks: the other directories, and how to check it worked. */
  note: string
  /** That agent's own skills documentation. */
  docsUrl: string
}

export const AGENT_INSTALLS: AgentInstall[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    intro:
      'The repository is also a Claude Code plugin marketplace. Add it at the release tag, then install the plugin; it carries every skill in the release.',
    blocks: [
      {
        caption: 'in Claude Code',
        code: [
          `/plugin marketplace add ${SKILLS_REPO}#${SKILLS_RELEASE_TAG}`,
          '/plugin install motir@motir-skills',
        ].join('\n'),
        copyLabel: 'Copy the Claude Code plugin commands',
      },
      {
        caption: 'or copy them, in a terminal',
        code: copyInstall('~/.claude/skills'),
        copyLabel: 'Copy the Claude Code copy-install commands',
      },
    ],
    note: 'A plugin’s skills are listed under the plugin’s name, for example /motir:motir-run. Copied skills keep their own names. For one repository only, copy into .claude/skills in that repository instead.',
    docsUrl: 'https://code.claude.com/docs/en/discover-plugins',
  },
  {
    id: 'codex',
    label: 'Codex',
    intro:
      'Codex reads skills from .agents/skills — in your home folder for every repository, or in a repository for that repository alone.',
    blocks: [
      {
        caption: 'in a terminal',
        code: copyInstall('~/.agents/skills'),
        copyLabel: 'Copy the Codex install commands',
      },
    ],
    note: 'Codex notices new skills on its own. If they do not appear, restart it.',
    docsUrl: 'https://learn.chatgpt.com/docs/build-skills',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    intro:
      'Cursor reads skills from ~/.cursor/skills for every project, and from .cursor/skills in a project.',
    blocks: [
      {
        caption: 'in a terminal',
        code: copyInstall('~/.cursor/skills'),
        copyLabel: 'Copy the Cursor install commands',
      },
    ],
    note: 'Cursor also reads ~/.agents/skills and ~/.claude/skills, so skills you already copied for Codex or Claude Code are picked up without a second copy.',
    docsUrl: 'https://cursor.com/docs/context/skills',
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    intro:
      'Gemini CLI reads your own skills from ~/.gemini/skills, and a workspace’s from .gemini/skills.',
    blocks: [
      {
        caption: 'in a terminal',
        code: copyInstall('~/.gemini/skills'),
        copyLabel: 'Copy the Gemini CLI install commands',
      },
    ],
    note: 'Run gemini skills list to check they were found. Gemini CLI also reads ~/.agents/skills.',
    docsUrl: 'https://geminicli.com/docs/cli/skills/',
  },
  {
    id: 'copilot-vs-code',
    label: 'GitHub Copilot in VS Code',
    intro:
      'Copilot in VS Code reads your personal skills from ~/.copilot/skills, and a project’s from .github/skills.',
    blocks: [
      {
        caption: 'in a terminal',
        code: copyInstall('~/.copilot/skills'),
        copyLabel: 'Copy the GitHub Copilot install commands',
      },
    ],
    note: 'It also reads ~/.claude/skills and ~/.agents/skills. No setting needs turning on for these folders.',
    docsUrl:
      'https://code.visualstudio.com/docs/copilot/customization/agent-skills',
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    intro:
      'OpenCode reads your own skills from ~/.config/opencode/skills, and a project’s from .opencode/skills.',
    blocks: [
      {
        caption: 'in a terminal',
        code: copyInstall('~/.config/opencode/skills'),
        copyLabel: 'Copy the OpenCode install commands',
      },
    ],
    note: 'It also reads ~/.claude/skills and ~/.agents/skills. Run opencode debug skill to see what it found.',
    docsUrl: 'https://opencode.ai/docs/skills/',
  },
]

export interface SkillUsage {
  name: (typeof SKILL_NAMES)[number]
  /** What the reader types to their agent. */
  say: string[]
  /** What the skill does, in order. */
  does: string
  /** What the reader will see in Motir afterwards. */
  see: string
}

export const SKILL_USAGE: SkillUsage[] = [
  {
    name: 'motir-run',
    say: ['motir run', 'motir run ACME-12', 'motir next'],
    does: 'Takes the next ready work item in your project, or the one you name, and builds it. It first tidies up after earlier runs whose pull requests have merged, then claims the work item, builds it on a branch of its own, opens one pull request, and links that pull request to the work item. Name a story whose children have no children of their own, and it runs the whole story: one branch and one pull request per repository, with one commit per child. motir next stops after the claim and prints the prompt, for you to hand to an agent yourself.',
    see: 'The work item is assigned to you and moves to In Progress, then to Implemented once its pull request is open. Its page shows the pull request and a How to test section. Motir moves it to In Review when CI passes and to Done when the pull request merges; the skill never does either.',
  },
  {
    name: 'motir-log-bug',
    say: ['motir log bug the export button does nothing on an empty board'],
    does: 'Treats what you typed as a claim to check. It finds the cause in the code first, looks for a work item someone has already filed, and files nothing if the behaviour turns out to be correct. Otherwise it files one bug: under the story it holds up, or in your project’s Bugs folder when it holds nothing up.',
    see: 'A new bug work item with the cause, where it lives in the code and how to reproduce it, linked to the work item it was found on. If it blocks the work item you are running, that work item moves to Blocked.',
  },
  {
    name: 'motir-mark',
    say: ['motir mark ACME-12 done'],
    does: 'Closes a work item no pull request can close: a manual one, such as creating an account, setting a secret or changing a setting. Saying it is your confirmation that the work is finished. It refuses a work item that has a pull request, because that pull request’s merge closes it.',
    see: 'The work item moves to Done, with a comment recording that you confirmed it. Its parent’s status follows from its children.',
  },
  {
    name: 'motir-guide',
    say: ['motir guide ACME-12', 'motir guide'],
    does: 'Walks you through a manual work item one step at a time. Name one, or say motir guide alone and it picks up your own unfinished one, else the next ready manual work item. It gives you one step, with its instructions and any command to copy, and waits. Say done, and it checks what it can without changing anything, such as fetching the address or running a read-only command, and tells you what it saw. A step whose check fails is not ticked; you get the same step again. You can stop at any step, and motir guide picks up where you left off. If the work item has no steps yet, it proposes some from the description and asks you before writing them onto the work item.',
    see: 'The work item is assigned to you and moves to In Progress. Its To-do list ticks each step as you finish it, with who did it. When the last step is ticked, the work item moves to Done, with a comment summarising each step and how it was confirmed.',
  },
]

/**
 * Updating in Claude Code. ⚠️ NOT "add the marketplace again": a marketplace
 * already declared at one ref refuses to be added at another ("its network
 * source differs from the one declared for it in settings"), checked by
 * running it on `CHECKED_ON`. Removing it first is what works, and removing
 * it uninstalls the plugin, so the block installs it again.
 */
export const CLAUDE_CODE_UPDATE: InstallBlock = {
  caption: 'in Claude Code',
  code: [
    '/plugin marketplace remove motir-skills',
    `/plugin marketplace add ${SKILLS_REPO}#${SKILLS_RELEASE_TAG}`,
    '/plugin install motir@motir-skills',
  ].join('\n'),
  copyLabel: 'Copy the Claude Code update commands',
}
