Motir is a remote MCP connector: Claude Code reaches your Motir project over one URL and acts as you, within what you approve. You sign in with your Motir account and pick one workspace. There is no token to create, paste or keep safe.

There are two ways to add it. Connect it once on claude.ai and Claude Code picks it up wherever you are signed in with your Claude account, or add it in Claude Code itself with one command. Want Motir’s skills as well? The [{{value:pluginPage}}](/docs/claude-code-plugin) brings this connector with it.

## Before you start {#before}

You need a Motir account with access to the project, and Claude Code. For the claude.ai route, Claude Code must be signed in with the same Claude account you connect on claude.ai.

## Connect it on claude.ai {#claude-ai}

A connector you connect on claude.ai is available in your conversations on the web, the desktop app and mobile, and in Claude Code when it is signed in with your Claude account.

1. Open Customize → Connectors.
2. Click “+”, then Add custom connector, and paste the server URL below. Under OAuth client, choose Use Claude’s published identity — claude.ai marks it Detected, because Motir supports it. Leave the OAuth client ID and secret empty — Motir needs neither.
3. Click Add, then Connect. Claude sends you to app.motir.co to sign in and approve.

{{slot:claude-ai}}

On a Team or Enterprise plan an Owner adds the connector once, under Organization settings → Connectors → Add → Custom → Web, and each member then clicks Connect under Customize → Connectors with their own Motir account. · [Anthropic’s claude.ai documentation]({{value:claudeAiDocsUrl}}) · steps checked {{value:claudeAiCheckedOn}}

## Or add it in Claude Code {#claude-code}

Add the connector to Claude Code directly, without claude.ai.

1. Add the server with the command below — no header and no token.
2. In Claude Code, run `/mcp`, select `motir` and follow the sign-in in your browser.

{{slot:claude-code}}

If you signed Claude Code in with your Claude account, a connector you connected on claude.ai is already available there. The Motir plugin for Claude Code brings this server with it, beside the skills. · [Anthropic’s Claude Code documentation]({{value:claudeCodeDocsUrl}}) · steps checked {{value:claudeCodeCheckedOn}}

## Check the connection {#check}

In Claude Code, run `/mcp`: Motir is listed among the servers, and a server that still needs you to sign in says so. Then ask Claude about your project — for example, what is ready to start — and it answers from Motir.

## What you approve, and how to take it back {#consent}

The sign-in page on Motir names the app that is asking, has you choose one workspace, and lists the permissions it wants. Claude then acts as you in that workspace, within what you approved, and never beyond what your own role allows. Claude asks before it uses a tool that changes anything, and [{{value:mcpToolsPage}}](/docs/mcp/tools) shows which tools only read, write or delete.

Every app you connect is listed under [Connected apps]({{value:connectedAppsUrl}}), on Settings → Account → Tokens in Motir, with its workspace, permissions and when it was last used. Revoke ends its access at its next request. The [{{value:mcpPage}}](/docs/mcp) guide has the server’s details, and the token route for other clients and pipelines.
