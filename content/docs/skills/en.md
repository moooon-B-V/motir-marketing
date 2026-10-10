Motir’s skills let the agent you already use work your Motir project. Say `motir run` and it takes the next ready work item, builds it and opens a linked pull request. Say `motir log bug` and it checks the defect and files it where it belongs. Say `motir mark` and it closes a manual work item once you have done it. Say `motir guide` and it walks you through a manual work item one step at a time.

They are ordinary [Agent Skills](https://agentskills.io): one folder per skill, each with a `SKILL.md`, published in [{{value:skillsRepo}}]({{value:repoUrl}}). Every command on this page installs release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Before you start {#before}

The skills talk to Motir through its MCP server. In Claude Code the plugin connects it for you: you sign in with your Motir account in the browser, and there is no token. Every other agent needs that server connected first — a Motir project, a personal access token, and the setup for your agent in the [{{value:mcpPage}}](/docs/mcp) guide, which also covers the token route in Claude Code if you cannot use the browser sign-in. A token with the default permissions can do everything these skills do. You also need `git`, and the GitHub CLI (`gh`) for the skills that open or read pull requests.

## Install {#install}

Pick your agent. Each section installs every skill in the release for every project on your machine. The terminal commands are for macOS and Linux: they fetch the release, copy the skill folders into the folder that agent reads, and remove the download.

### Claude Code {#claude-code}

The repository is also a Claude Code plugin marketplace. Add it at the release tag, then install the plugin. One install brings the skills, Motir’s MCP server and a runner for its CLI, and connects Motir without a token.

- **The seven skills.** Every skill in the release, listed under the plugin’s name.
- **The Motir MCP server.** Claude Code signs into it in the browser the first time it is used: run `/mcp`, pick `motir` and choose _Authenticate_, then pick the workspace and approve on Motir’s consent screen. There is no token to create or paste. [Add Motir to Claude](/docs/mcp#claude)
- **The `motir` runner.** Runs the pinned Motir CLI with `npx`, so nothing is installed globally. It needs Node.js 22 or newer, and the CLI signs in on its own with `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

To check it: `/plugin` shows `motir` at `{{value:releaseVersion}}`, and `/mcp` lists `motir`. A plugin’s skills are listed under the plugin’s name, for example `/motir:motir-run`. Copying the skills brings the skills alone — connect the MCP server yourself, as the other agents do. For one repository only, copy into `.claude/skills` in that repository instead. · [Claude Code documentation]({{value:claudeCodeDocsUrl}}) · checked {{value:checkedOn}}

### Codex {#codex}

Codex reads skills from `.agents/skills` — in your home folder for every repository, or in a repository for that repository alone.

{{slot:codex}}

Codex notices new skills on its own. If they do not appear, restart it. · [Codex documentation]({{value:codexDocsUrl}}) · checked {{value:checkedOn}}

### Cursor {#cursor}

Cursor reads skills from `~/.cursor/skills` for every project, and from `.cursor/skills` in a project.

{{slot:cursor}}

Cursor also reads `~/.agents/skills` and `~/.claude/skills`, so skills you already copied for Codex or Claude Code are picked up without a second copy. · [Cursor documentation]({{value:cursorDocsUrl}}) · checked {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI reads your own skills from `~/.gemini/skills`, and a workspace’s from `.gemini/skills`.

{{slot:gemini-cli}}

Run `gemini skills list` to check they were found. Gemini CLI also reads `~/.agents/skills`. · [Gemini CLI documentation]({{value:geminiCliDocsUrl}}) · checked {{value:checkedOn}}

### GitHub Copilot in VS Code {#copilot-vs-code}

Copilot in VS Code reads your personal skills from `~/.copilot/skills`, and a project’s from `.github/skills`.

{{slot:copilot-vs-code}}

It also reads `~/.claude/skills` and `~/.agents/skills`. No setting needs turning on for these folders. · [GitHub Copilot in VS Code documentation]({{value:copilotDocsUrl}}) · checked {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode reads your own skills from `~/.config/opencode/skills`, and a project’s from `.opencode/skills`.

{{slot:opencode}}

It also reads `~/.claude/skills` and `~/.agents/skills`. Run `opencode debug skill` to see what it found. · [OpenCode documentation]({{value:opencodeDocsUrl}}) · checked {{value:checkedOn}}

Then ask your agent which skills it has. {{value:releaseSkills}} are listed. Another agent that reads `SKILL.md` skills works the same way: copy the skill folders into the folder it reads skills from.

## Use {#use}

Type what is under **Say** into your agent. Replace `ACME-12` with the key of a work item in your own project.

### `motir-run` {#motir-run}

**Say**

- `motir run`
- `motir run ACME-12`
- `motir next`

**What happens**

Takes the next ready work item in your project, or the one you name, and builds it. It first tidies up after earlier runs whose pull requests have merged, then claims the work item, builds it on a branch of its own, opens one pull request, and links that pull request to the work item. Name a story whose children have no children of their own, and it runs the whole story: one branch and one pull request per repository, with one commit per child. `motir next` stops after the claim and prints the prompt, for you to hand to an agent yourself. A decision work item is the one exception: it writes the decision page and publishes it for your approval, with no branch and no pull request.

**What you see in Motir**

The work item is assigned to you and moves to In Progress, then to Implemented once its pull request is open. Its page shows the pull request and a How to test section. Motir moves it to In Review when CI passes and to Done when the pull request merges; the skill never does either.

### `motir-fix` {#motir-fix}

**Say**

- `motir fix ACME-12`

**What happens**

Repairs a red pull request after the run that opened it has ended: its checks failed, the merge queue threw it out, or a reviewer sent the story’s acceptance video back with Re-run. It first claims the repair, so nobody else pushes over it. Then it fixes each of the work item’s pull requests on the branch it already has, never a new one: it merges the base branch, fixes what the failing check named, and pushes. It keeps going until CI is green or it has tried five times, and it records the acceptance video again once CI is green after a Re-run. It never opens a pull request, merges one or moves the work item’s status. Not the same as `motir fix bugs`, which works through your project’s Bugs folder: `motir fix ACME-12` repairs the pull requests of one work item you name.

**What you see in Motir**

While the repair runs, the work item’s Development section says it is being fixed, and by whom. The same pull requests get new commits, and Motir moves the work item on by itself once their checks pass. If the repair gives up, the work item says so and how many attempts it made.

### `motir-continue` {#motir-continue}

**Say**

- `motir continue ACME-12`

**What happens**

Carries on a work item whose run died part-way: the laptop closed, the sandbox was lost, or the process was killed. The work item is still In Progress and its work is on the branch that run left. It first claims the continue, so nobody else works the same branch. Then it checks out that branch in every repository the work item spans, never a new one and never resetting what is already there, and carries the work on from where it stopped. It delivers the way a fresh run does: one pull request per repository, linked to the work item. Use `motir fix ACME-12` instead when the work item already has a pull request that is red, and `motir run ACME-12` for a work item nobody has started.

**What you see in Motir**

A work item whose run died says Run died in its Development section, with the `motir continue` command to copy. While the continue runs, that section says it is being continued, and by whom. When it finishes, the work item moves on exactly as after `motir run`: to Implemented, with its pull requests linked and a How to test section.

### `motir-log-bug` {#motir-log-bug}

**Say**

- `motir log bug the export button does nothing on an empty board`

**What happens**

Treats what you typed as a claim to check. It finds the cause in the code first, looks for a work item someone has already filed, and files nothing if the behaviour turns out to be correct. Otherwise it files one bug: under the story it holds up, or in your project’s Bugs folder when it holds nothing up.

**What you see in Motir**

A new bug work item with the cause, where it lives in the code and how to reproduce it, linked to the work item it was found on. If it blocks the work item you are running, that work item moves to Blocked.

### `motir-mark` {#motir-mark}

**Say**

- `motir mark ACME-12 done`

**What happens**

Closes a work item no pull request can close: a manual one, such as creating an account, setting a secret or changing a setting. Saying it is your confirmation that the work is finished. It refuses a work item that has a pull request, because that pull request’s merge closes it.

**What you see in Motir**

The work item moves to Done, with a comment recording that you confirmed it. Its parent’s status follows from its children.

### `motir-guide` {#motir-guide}

**Say**

- `motir guide ACME-12`
- `motir guide`

**What happens**

Walks you through a manual work item one step at a time. Name one, or say `motir guide` alone and it picks up your own unfinished one, else the next ready manual work item. It gives you one step, with its instructions and any command to copy, and waits. Say done, and it checks what it can without changing anything, such as fetching the address or running a read-only command, and tells you what it saw. A step whose check fails is not ticked; you get the same step again. You can stop at any step, and `motir guide` picks up where you left off. If the work item has no steps yet, it proposes some from the description and asks you before writing them onto the work item. If a step turns out to be wrong, it offers a correction and changes the step or the work item’s text only when you say yes.

**What you see in Motir**

The work item is assigned to you and moves to In Progress. Its To-do list ticks each step as you finish it, with who did it. When the last step is ticked, the work item moves to Done, with a comment summarising each step and how it was confirmed.

### `motir-fix-bugs` {#motir-fix-bugs}

**Say**

- `motir fix bugs`
- `motir fix bugs 3`

**What happens**

Works through the bugs in your project’s Bugs folder that are still To Do, one bug at a time, oldest first. Bugs in folders inside Bugs are left alone. For each one it first checks the bug is real on your default branch, then gives it exactly one outcome. A bug it can fix gets one pull request that fixes that bug and nothing else. A bug that waits on another work item that is not finished yet is linked to that work item and moved under the same story. A bug it cannot fix here gets a comment and is set aside: already fixed, with what fixed it; cannot be reproduced, with what it ran; or needs your decision, with the question and its recommendation. Every outcome takes the bug out of To Do, so the run ends by itself. Add a number and it stops after that many bugs. It ends with a report that lists the bugs waiting on you first.

**What you see in Motir**

A fixed bug moves to Implemented with its pull request linked, and to Done when you merge it. A bug waiting on other work moves to Blocked, with a blocked by link to that work item. A bug already fixed moves to Done. One it cannot reproduce, or one needing your decision, moves to Blocked. Each of these has a comment with the evidence or the question. Answer the question and move the bug back to To Do, and the next run picks it up.

## When a work item is wrong {#wrong}

Sometimes a work item cannot be built as written. It may ask for something that does not exist, need a design nobody has drawn, or reach into two repositories. `motir-run` does not guess its way around that. It moves the work item to **Planning**, so no other run picks it up, and asks Motir’s AI planner to plan the correction. Then it stops. The plan waits for you to review and approve in Motir, and nothing is built until you do.

If your token cannot use AI planning, or your AI credits have run out, it stops anyway. It leaves a comment on the work item with the whole correction and says why it could not hand it over.

## Updating {#updating}

A new release has a new tag, and this page moves to it. For a copy install, run your agent’s install step again: it overwrites the skill folders in place. In Claude Code, a marketplace cannot be added again at a different tag, so remove it, add it at the new tag and install the plugin again:

{{slot:update}}

Restart your agent afterwards so it reads the new versions.
