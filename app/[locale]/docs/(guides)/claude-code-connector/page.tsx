import Link from 'next/link'

import { englishCopy, getCopy } from '@/lib/copy'
import {
  CONNECTED_APPS_PATH,
  claudeRoutes,
  mcpTransportFacts,
  type ClaudeRoute,
} from '@/lib/mcpWiring'
import { CodeBlock } from '../../_components/DocSchema'
import { enterLocale, type LocalePageProps } from '@/i18n/locale'

/*
 * The CLAUDE CODE CONNECTOR guide (2026-10 redesign) — Motir's MCP server as a
 * remote connector in Claude Code, over OAuth, with no token. The Products menu
 * opens it for "Motir Claude Code connector".
 *
 * ⚠️ NOTHING ABOUT A CLAUDE CLIENT IS TYPED IN THIS FILE. The steps, the URL,
 * the command, Anthropic's documentation links and their check dates are
 * `claudeRoutes()` in `lib/mcpWiring.ts` — the same routes the MCP guide's
 * "Add Motir to Claude" renders — so the two pages cannot disagree. This file
 * picks the two routes that reach Claude Code (claude.ai, whose connectors
 * Claude Code inherits, and Claude Code's own command) and arranges them.
 */

export const metadata = {
  title: englishCopy.docs.metaTitleClaudeCodeConnector,
  description: englishCopy.docs.metaDescriptionClaudeCodeConnector,
}

const linkClass = 'text-(--el-accent-on-surface) underline underline-offset-2'

export default async function ClaudeCodeConnectorDocsPage({
  params,
}: LocalePageProps) {
  const locale = await enterLocale(params)
  const copy = await getCopy(locale)
  const facts = mcpTransportFacts()
  const routes = claudeRoutes(facts)
  const byId = (id: string) => routes.find((route) => route.id === id)!
  const claudeAi = byId('claude-ai')
  const claudeCode = byId('claude-code')
  const connectedAppsUrl = `${facts.origin}${CONNECTED_APPS_PATH}`

  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.claudeCodeConnector}
      </h1>

      <Prose>
        Motir is a remote MCP connector: Claude Code reaches your Motir project
        over one URL and acts as you, within what you approve. You sign in with
        your Motir account and pick one workspace. There is no token to create,
        paste or keep safe.
      </Prose>
      <Prose>
        There are two ways to add it. Connect it once on claude.ai and Claude
        Code picks it up wherever you are signed in with your Claude account, or
        add it in Claude Code itself with one command. Want Motir’s skills as
        well? The{' '}
        <Link href="/docs/claude-code-plugin" className={linkClass}>
          {copy.docs.claudeCodePlugin}
        </Link>{' '}
        brings this connector with it.
      </Prose>

      <H2 id="before">Before you start</H2>
      <Prose>
        You need a Motir account with access to the project, and Claude Code.
        For the claude.ai route, Claude Code must be signed in with the same
        Claude account you connect on claude.ai.
      </Prose>

      <H2 id="claude-ai">Connect it on claude.ai</H2>
      <Prose>
        A connector you connect on claude.ai is available in your conversations
        on the web, the desktop app and mobile, and in Claude Code when it is
        signed in with your Claude account.
      </Prose>
      <Route route={claudeAi} />

      <H2 id="claude-code">Or add it in Claude Code</H2>
      <Prose>
        Add the connector to Claude Code directly, without claude.ai.
      </Prose>
      <Route route={claudeCode} />

      <H2 id="check">Check the connection</H2>
      <Prose>
        In Claude Code, run <Mono>/mcp</Mono>: Motir is listed among the
        servers, and a server that still needs you to sign in says so. Then ask
        Claude about your project — for example, what is ready to start — and it
        answers from Motir.
      </Prose>

      <H2 id="consent">What you approve, and how to take it back</H2>
      <Prose>
        The sign-in page on Motir names the app that is asking, has you choose
        one workspace, and lists the permissions it wants. Claude then acts as
        you in that workspace, within what you approved, and never beyond what
        your own role allows. Claude asks before it uses a tool that changes
        anything, and{' '}
        <Link href="/docs/mcp/tools" className={linkClass}>
          {copy.docs.mcpTools}
        </Link>{' '}
        shows which tools only read, write or delete.
      </Prose>
      <Prose>
        Every app you connect is listed under{' '}
        <a className={linkClass} href={connectedAppsUrl}>
          Connected apps
        </a>
        , on Settings → Account → Tokens in Motir, with its workspace,
        permissions and when it was last used. Revoke ends its access at its
        next request. The{' '}
        <Link href="/docs/mcp" className={linkClass}>
          {copy.docs.mcp}
        </Link>{' '}
        guide has the server’s details, and the token route for other clients
        and pipelines.
      </Prose>
    </>
  )
}

/** One of `claudeRoutes()`, as the MCP guide renders it. */
function Route({ route }: { route: ClaudeRoute }) {
  return (
    <div className="mt-3">
      <ol className="mt-1 max-w-[68ch] list-decimal space-y-1 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        {route.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="mt-3">
        <CodeBlock
          caption={route.caption}
          code={route.code}
          copyLabel={route.copyLabel}
        />
      </div>
      <p className="mt-1.5 max-w-[68ch] text-[12px] leading-relaxed text-(--el-text-secondary)">
        {route.note} ·{' '}
        <a
          className={linkClass}
          href={route.docsUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          Anthropic’s {route.label} documentation
        </a>{' '}
        · steps checked {route.checkedOn}
      </p>
    </div>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
      {children}
    </p>
  )
}

function H2({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="pt-6 font-(family-name:--font-serif) text-[20px] leading-snug font-bold text-(--el-text-strong)"
    >
      {children}
    </h2>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px] whitespace-nowrap">
      {children}
    </code>
  )
}
