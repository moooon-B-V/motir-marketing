Motir’s plugin for Claude Code puts your Motir project inside Claude Code with one install: Motir’s skills, its MCP server and a runner for its CLI. It signs in with your Motir account in the browser, so there is no token. Say `motir run` and Claude Code takes the next ready work item, builds it and opens a linked pull request.

The plugin is published from [{{value:skillsRepo}}]({{value:repoUrl}}), which is also a Claude Code plugin marketplace. Every command on this page installs release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Before you start {#before}

You need Claude Code, a Motir account with access to the project, and `git`. The runner needs Node.js 22 or newer, and the skills that open or read pull requests need the GitHub CLI (`gh`).

## Install {#install}

Add the marketplace at the release tag, then install the plugin. Run both in Claude Code.

{{slot:install}}

## What it brings {#brings}

- **The seven skills.** Every skill in the release, listed under the plugin’s name.
- **The Motir MCP server.** Claude Code signs into it in the browser the first time it is used: run `/mcp`, pick `motir` and choose _Authenticate_, then pick the workspace and approve on Motir’s consent screen. There is no token to create or paste.
- **The `motir` runner.** Runs the pinned Motir CLI with `npx`, so nothing is installed globally. It needs Node.js 22 or newer, and the CLI signs in on its own with `motir login`.

## Check it worked {#check}

To check it: `/plugin` shows `motir` at `{{value:releaseVersion}}`, and `/mcp` lists `motir`. A plugin’s skills are listed under the plugin’s name, for example `/motir:motir-run`.

## Use it {#use}

Say what you want in Claude Code. Each skill’s full behaviour, and what you will see in Motir, is in the [{{value:skillsPage}}](/docs/skills#use) guide.

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Updating {#updating}

A marketplace added at one release cannot be added again at another, so remove it first. Removing it uninstalls the plugin, and the last line installs it again at the new release.

{{slot:update}}

Using another agent, or only want the connector? See the [{{value:skillsPage}}](/docs/skills) guide for every agent, or the [{{value:connectorPage}}](/docs/claude-code-connector).
