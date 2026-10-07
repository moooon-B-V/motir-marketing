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

/** The date every agent's documentation was last read against this page. */
export const CHECKED_ON = '6 October 2026'

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

export interface InstallBlock {
  /** The pane's caption — where the reader types it. */
  caption: string
  code: string
  /** An accessible name for the copy button, when the caption is not enough. */
  copyLabel: string
}

/** One thing an install brings, for the agent whose install brings more than skills. */
export interface InstallBrings {
  /** What it is, in a few words — bolded on the page. */
  title: string
  /** One sentence on what it does and what it needs. */
  text: string
  /** A page on this site that says more. */
  link?: { href: string; label: string }
}

export interface AgentInstall {
  /** Anchor id on the page. */
  id: string
  /** The agent, as its maker names it. */
  label: string
  /** One or two sentences before the blocks: what this agent reads. */
  intro: string
  blocks: InstallBlock[]
  /**
   * What the install brings, when it is more than the skills — the Claude Code
   * plugin since `v0.4.0` (MOTIR-6975). Read from `motir-skills` `README.md`
   * § *Install in Claude Code* AT THE TAG, never at `main`.
   */
  brings?: InstallBrings[]
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
      'The repository is also a Claude Code plugin marketplace. Add it at the release tag, then install the plugin. One install brings the skills, Motir’s MCP server and a runner for its CLI, and connects Motir without a token.',
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
        caption: 'or copy the skills only, in a terminal',
        code: copyInstall('~/.claude/skills'),
        copyLabel: 'Copy the Claude Code copy-install commands',
      },
    ],
    brings: [
      {
        title: 'The seven skills',
        text: 'Every skill in the release, listed under the plugin’s name.',
      },
      {
        title: 'The Motir MCP server',
        text: 'Claude Code signs into it in the browser the first time it is used: run /mcp, pick motir and choose Authenticate, then pick the workspace and approve on Motir’s consent screen. There is no token to create or paste.',
        link: { href: '/docs/mcp#claude', label: 'Add Motir to Claude' },
      },
      {
        title: 'The motir runner',
        text: 'Runs the pinned Motir CLI with npx, so nothing is installed globally. It needs Node.js 22 or newer, and the CLI signs in on its own with motir login.',
      },
    ],
    note: `To check it: /plugin shows motir at ${SKILLS_RELEASE_TAG.replace(/^v/, '')}, and /mcp lists motir. A plugin’s skills are listed under the plugin’s name, for example /motir:motir-run. Copying the skills brings the skills alone — connect the MCP server yourself, as the other agents do. For one repository only, copy into .claude/skills in that repository instead.`,
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
    does: 'Takes the next ready work item in your project, or the one you name, and builds it. It first tidies up after earlier runs whose pull requests have merged, then claims the work item, builds it on a branch of its own, opens one pull request, and links that pull request to the work item. Name a story whose children have no children of their own, and it runs the whole story: one branch and one pull request per repository, with one commit per child. motir next stops after the claim and prints the prompt, for you to hand to an agent yourself. A decision work item is the one exception: it writes the decision page and publishes it for your approval, with no branch and no pull request.',
    see: 'The work item is assigned to you and moves to In Progress, then to Implemented once its pull request is open. Its page shows the pull request and a How to test section. Motir moves it to In Review when CI passes and to Done when the pull request merges; the skill never does either.',
  },
  {
    name: 'motir-fix',
    say: ['motir fix ACME-12'],
    does: 'Repairs a red pull request after the run that opened it has ended: its checks failed, the merge queue threw it out, or a reviewer sent the story’s acceptance video back with Re-run. It first claims the repair, so nobody else pushes over it. Then it fixes each of the work item’s pull requests on the branch it already has, never a new one: it merges the base branch, fixes what the failing check named, and pushes. It keeps going until CI is green or it has tried five times, and it records the acceptance video again once CI is green after a Re-run. It never opens a pull request, merges one or moves the work item’s status. Not the same as motir fix bugs, which works through your project’s Bugs folder: motir fix ACME-12 repairs the pull requests of one work item you name.',
    see: 'While the repair runs, the work item’s Development section says it is being fixed, and by whom. The same pull requests get new commits, and Motir moves the work item on by itself once their checks pass. If the repair gives up, the work item says so and how many attempts it made.',
  },
  {
    name: 'motir-continue',
    say: ['motir continue ACME-12'],
    does: 'Carries on a work item whose run died part-way: the laptop closed, the sandbox was lost, or the process was killed. The work item is still In Progress and its work is on the branch that run left. It first claims the continue, so nobody else works the same branch. Then it checks out that branch in every repository the work item spans, never a new one and never resetting what is already there, and carries the work on from where it stopped. It delivers the way a fresh run does: one pull request per repository, linked to the work item. Use motir fix ACME-12 instead when the work item already has a pull request that is red, and motir run ACME-12 for a work item nobody has started.',
    see: 'A work item whose run died says Run died in its Development section, with the motir continue command to copy. While the continue runs, that section says it is being continued, and by whom. When it finishes, the work item moves on exactly as after motir run: to Implemented, with its pull requests linked and a How to test section.',
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
    does: 'Walks you through a manual work item one step at a time. Name one, or say motir guide alone and it picks up your own unfinished one, else the next ready manual work item. It gives you one step, with its instructions and any command to copy, and waits. Say done, and it checks what it can without changing anything, such as fetching the address or running a read-only command, and tells you what it saw. A step whose check fails is not ticked; you get the same step again. You can stop at any step, and motir guide picks up where you left off. If the work item has no steps yet, it proposes some from the description and asks you before writing them onto the work item. If a step turns out to be wrong, it offers a correction and changes the step or the work item’s text only when you say yes.',
    see: 'The work item is assigned to you and moves to In Progress. Its To-do list ticks each step as you finish it, with who did it. When the last step is ticked, the work item moves to Done, with a comment summarising each step and how it was confirmed.',
  },
  {
    name: 'motir-fix-bugs',
    say: ['motir fix bugs', 'motir fix bugs 3'],
    does: 'Works through the bugs in your project’s Bugs folder that are still To Do, one bug at a time, oldest first. Bugs in folders inside Bugs are left alone. For each one it first checks the bug is real on your default branch, then gives it exactly one outcome. A bug it can fix gets one pull request that fixes that bug and nothing else. A bug that waits on another work item that is not finished yet is linked to that work item and moved under the same story. A bug it cannot fix here gets a comment and is set aside: already fixed, with what fixed it; cannot be reproduced, with what it ran; or needs your decision, with the question and its recommendation. Every outcome takes the bug out of To Do, so the run ends by itself. Add a number and it stops after that many bugs. It ends with a report that lists the bugs waiting on you first.',
    see: 'A fixed bug moves to Implemented with its pull request linked, and to Done when you merge it. A bug waiting on other work moves to Blocked, with a blocked by link to that work item. A bug already fixed moves to Done. One it cannot reproduce, or one needing your decision, moves to Blocked. Each of these has a comment with the evidence or the question. Answer the question and move the bug back to To Do, and the next run picks it up.',
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
