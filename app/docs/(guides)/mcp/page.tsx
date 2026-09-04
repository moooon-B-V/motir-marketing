import Link from 'next/link'
import { copy } from '@/lib/copy'
import { fetchMcpToolCatalogue, type McpToolCatalogue } from '@/lib/docs'
import {
  MCP_REFERENCE_URL,
  mcpClients,
  mcpForkRows,
  mcpTransportFactRows,
  mcpTransportFacts,
  mcpVerifyCommand,
} from '@/lib/mcpWiring'
import { CodeBlock } from '../../_components/DocSchema'

/*
 * The MCP server guide (MOTIR-4046, RESTORED by MOTIR-4429) — how to wire a
 * client to Motir's MCP server, end to end.
 *
 * ⚠️ WHAT THIS CARD FIXED. The page was two sentences: the endpoint exists, and
 * a scope gates every tool. Both true, neither actionable — `0 <pre>` blocks,
 * and `mcpServers` appeared ZERO times across all nine `/docs` pages. The
 * deleted `motir-core` page at `95a2d4468^` carried a fork table, three
 * numbered steps, five ready-to-paste client configurations and a scope legend;
 * the move to motir.co kept the route and dropped all of it. MOTIR-4397's
 * parity ledger measured that; MOTIR-4429 is the restore.
 *
 * ── NOTHING ABOUT THE TRANSPORT IS TYPED IN THIS FILE ───────────────────────
 * The URL, the header, the token shape and every client block come from
 * `lib/mcpWiring.ts`, built by interpolating one set of facts, so a preview
 * build documents the preview it is part of and no block can drift from the
 * endpoint it describes. `tests/docs/mcpWiring.test.tsx` proves the
 * interpolation with a sentinel origin — a block that typed a URL fails there
 * rather than passing by coincidence.
 *
 * ── THE SCOPE TABLE IS DERIVED, NOT COPIED ─────────────────────────────────
 * It is read from the catalogue motir-core publishes at
 * `/api/docs/mcp-tools.json` — the same document `/docs/mcp/tools` renders,
 * whose groups ARE the permissions and whose `gates` sentence is the shipped
 * i18n copy from the Roles & permissions screen. This repository keeps no
 * second copy of a scope list it could not check, and the no-fallback contract
 * applies here as everywhere else in this area: unreachable ⇒ the page says so
 * and the wiring above it still works, because the wiring needs no fetch.
 *
 * ⚠️ AND THIS FILE NAMES NO TOOL AND NO VENDOR CONFIG KEY.
 * `tests/docs/docs.test.ts` scans this source for a lowercase underscore-joined
 * identifier — the shape every Motir MCP tool name has — because this
 * repository cannot check a tool name it types. Two of the five vendor formats
 * spell their keys that way too, which is exactly why the blocks live in
 * `lib/mcpWiring.ts`; see the ⚠️ block there.
 */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: copy.docs.metaTitleMcp,
  description: copy.docs.metaDescriptionMcp,
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mt-9 scroll-mt-6 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)"
    >
      {children}
    </h2>
  )
}

/** A numbered step heading — the ordinal carried in the margin, as prior art. */
function StepHeading({
  index,
  title,
  id,
}: {
  index: number
  title: string
  id: string
}) {
  return (
    <H2 id={id}>
      <span className="mr-2 font-(family-name:--font-mono) text-(--el-text-secondary)">
        {index}
      </span>
      {title}
    </H2>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
      {children}
    </p>
  )
}

/**
 * A two- or three-column table. Scrolls in its own box, as the asset specifies
 * — three columns of prose do not fit a phone, and dropping one hides exactly
 * the fact the reader came to compare.
 */
function DocTable({
  columns,
  rows,
  caption,
}: {
  columns: string[]
  rows: React.ReactNode[][]
  caption: string
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="mt-3 mb-4 overflow-x-auto"
    >
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((heading, index) => (
              <th
                key={`${heading}-${index}`}
                scope="col"
                className="border-b border-(--el-border) px-2.5 py-1.5 text-left text-[11px] font-semibold tracking-wide text-(--el-text-secondary) uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex}>
              {cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-(--el-border-soft) px-2.5 py-2 align-top text-(--el-text-secondary)"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[12.5px] break-all text-(--el-text)">
      {children}
    </code>
  )
}

/** The scope legend, derived from the published catalogue. */
function Scopes({ catalogue }: { catalogue: McpToolCatalogue | null }) {
  if (!catalogue) {
    return (
      <Prose>
        The scope table is temporarily unreachable. It is derived from the
        catalogue Motir publishes and is never copied here, so there is nothing
        to show you in the meantime — a{' '}
        <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
          tools/list
        </code>{' '}
        handshake with your own token answers the same question for that token.
      </Prose>
    )
  }

  return (
    <DocTable
      caption="Token scopes"
      columns={['Scope', 'What it gates', 'Default']}
      rows={catalogue.groups.map((group) => [
        /* ⚠️ `whitespace-nowrap`, not the shared `Mono`. A scope is ONE token
           and breaking it mid-word — `project:brow` / `se` — turns a name a
           reader is about to type into two strings. The table scrolls in its
           own box, so a column that refuses to wrap costs nothing. */
        <code
          key="scope"
          className="font-(family-name:--font-mono) text-[12.5px] whitespace-nowrap text-(--el-text)"
        >
          {group.permission}
        </code>,
        group.gates,
        <span key="default" className="whitespace-nowrap">
          {group.grantedByDefault ? 'Granted' : 'Off by default'}
        </span>,
      ])}
    />
  )
}

export default async function McpPage() {
  const facts = mcpTransportFacts()
  const clients = mcpClients(facts)

  /*
   * ⚠️ THE FETCH IS CAUGHT, and only this one section depends on it. The
   * wiring — the whole reason a reader is on this page — is built from
   * configuration and needs no network at all, so an unreachable catalogue
   * degrades the scope table and nothing else. That is a different judgement
   * from `/docs/mcp/tools`, whose ENTIRE body is the catalogue and which
   * therefore renders the unreachable state instead of a page.
   */
  let catalogue: McpToolCatalogue | null = null
  try {
    catalogue = await fetchMcpToolCatalogue()
  } catch {
    catalogue = null
  }

  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.mcp}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        Motir exposes a Model Context Protocol server — one streamable-HTTP
        endpoint that agents and the CLI call to read and drive the
        project-management core. It is the same surface the hosted agents use to
        execute a plan. Three steps below take you from nothing to a client that
        is connected.
      </p>

      <H2 id="fork">This server, or the REST API?</H2>
      <Prose>
        Both speak to the same data and take the same credential. They are built
        for different consumers, and the difference that matters is what each
        promises about changing under you.
      </Prose>
      <DocTable
        caption="MCP server compared with the REST API"
        columns={['', copy.docs.mcp, copy.docs.api]}
        rows={mcpForkRows(facts).map((row) => [
          <strong key="axis" className="text-(--el-text)">
            {row.axis}
          </strong>,
          row.mcp,
          row.rest,
        ])}
      />
      <Prose>
        Wiring an agent? Stay here. Writing software other people install? The{' '}
        <Link
          href="/docs/api"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.api}
        </Link>{' '}
        is the other half — it is the one that promises not to change under you.
      </Prose>

      <StepHeading index={1} id="token" title="Mint a token" />
      <Prose>
        Every request carries a personal access token, minted in Motir under
        Settings → Account → Tokens. Choose the workspace it is bound to and
        grant it the narrowest scope set that does the job — the table at the
        bottom of this page says what each scope gates. A grant narrows your own
        role and never widens it, so a token can never do something you could
        not.
      </Prose>
      <Prose>
        The secret is shown once, when the token is created. Copy it then; there
        is no way to read it again, and a lost token is replaced rather than
        recovered.
      </Prose>

      <StepHeading index={2} id="wire" title="Wire your client" />
      <Prose>
        Every client needs the same four facts under whatever names it gives
        them.
      </Prose>
      <DocTable
        caption="What every client needs"
        columns={['', '']}
        rows={mcpTransportFactRows(facts).map((row) => [
          <strong key="label" className="text-(--el-text)">
            {row.label}
          </strong>,
          <Mono key="value">{row.value}</Mono>,
        ])}
      />
      <Prose>
        Keep the token out of a file your repository tracks. Where a client can
        read it from your environment or prompt you for it, the block below uses
        that instead of a literal — which is why two of them name{' '}
        <Mono>{facts.tokenEnvVar}</Mono> rather than a secret.
      </Prose>

      {clients.map((client) => (
        <div key={client.id} className="mt-6">
          <h3 className="mb-1.5 text-[11px] font-semibold tracking-wide text-(--el-text-secondary) uppercase">
            {client.label}
          </h3>
          <CodeBlock caption={client.file} code={client.config} />
          <p className="mt-1.5 max-w-[68ch] text-[12px] leading-relaxed text-(--el-text-secondary)">
            {client.note} ·{' '}
            <a
              className="text-(--el-accent-on-surface) underline underline-offset-2"
              href={client.docsUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              {client.label} documentation
            </a>{' '}
            · format checked {client.checkedOn}
          </p>
        </div>
      ))}

      <StepHeading index={3} id="check" title="Check the connection" />
      <Prose>
        Restart the client and ask it what tools it has; the server answers with
        the whole catalogue, scoped to your grant. To check the endpoint itself
        before involving a client, ask it directly — this is the same handshake,
        with the token in your environment.
      </Prose>
      <div className="mt-3">
        <CodeBlock caption="your machine" code={mcpVerifyCommand(facts)} />
      </div>
      <Prose>
        <strong className="text-(--el-text)">
          An unauthorized answer is about the TOKEN, not the wiring.
        </strong>{' '}
        A missing, malformed, unknown, revoked or expired token all return the
        same refusal, deliberately — distinguishing them would turn the endpoint
        into an oracle that answers whether a secret exists. Check that the
        header is spelled <Mono>{facts.authHeader}</Mono>, that the value begins{' '}
        <Mono>{facts.authScheme}</Mono>, and that the token has not been revoked
        in Motir.
      </Prose>

      <H2 id="scopes">What a token may call</H2>
      <Prose>
        Every tool is gated by a scope, and the grant a token carries decides
        which tools it may call — so the list your client shows is already
        scoped to you. These are read from Motir itself when this page is
        requested, so they are whatever the server ships right now.
      </Prose>
      <Scopes catalogue={catalogue} />

      <H2 id="what-next">What next</H2>
      <Prose>
        <Link
          href="/docs/mcp/tools"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.mcpTools}
        </Link>{' '}
        lists every tool the server exposes with the arguments it takes.{' '}
        <a
          className="text-(--el-accent-on-surface) underline underline-offset-2"
          href={MCP_REFERENCE_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          The full reference
        </a>{' '}
        in motir-core carries each tool’s complete description. Driving the same
        data from a terminal instead is the{' '}
        <Link
          href="/docs/cli"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.cli}
        </Link>
        .
      </Prose>
    </>
  )
}
