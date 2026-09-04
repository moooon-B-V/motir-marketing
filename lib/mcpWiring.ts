import { APP_ORIGIN } from '@/lib/appOrigin'

/**
 * WIRING A CLIENT TO THE MCP SERVER, AS DATA (MOTIR-4429).
 *
 * ── What was lost, and why it is coming back here ───────────────────────────
 * `motir-core` at `95a2d4468^` served this from `lib/apiDocs/mcp.ts` +
 * `app/(public)/docs/mcp/page.tsx` — a fork table, three numbered steps, five
 * ready-to-paste client blocks and a scope legend. The move to motir.co kept
 * the route and shipped two sentences: `mcpServers` appeared ZERO times across
 * all nine `/docs` pages, and `claude mcp add` zero times. A reader was told
 * the endpoint exists and given no way to reach it, on the page the whole
 * sub-area is named after. MOTIR-4397's parity ledger measured it; this is the
 * restore.
 *
 * ── EVERY BLOCK INTERPOLATES THE FACTS. Nothing here hard-codes a URL ───────
 * {@link mcpTransportFacts} resolves the four facts a client needs — the URL,
 * the transport, the header and the token shape — and every config below is
 * built from them. That is what makes the negative test meaningful: build the
 * blocks with a SENTINEL origin and assert every one carries it, and a block
 * that typed `https://app.motir.co` fails rather than passing by coincidence.
 * The origin comes from `NEXT_PUBLIC_MOTIR_APP_ORIGIN` (`lib/appOrigin.ts`), so
 * a preview build documents the preview it is part of.
 *
 * ── WHY THE PATH IS A LITERAL HERE, and what checks it ──────────────────────
 * `/api/mcp` is a stable public route, and this repository already hard-codes
 * the three sibling public paths it consumes — `/api/openapi/v1.json`,
 * `/api/docs/mcp-tools.json`, `/api/docs/cli-commands.json` — with
 * `tests/docs/docs.test.ts` asserting each literal is present rather than
 * fetched from somewhere. This follows that established shape. The durable
 * cross-repository check is `tests/seam/mcpEndpointSeam.test.ts`, which holds
 * this constant against the `endpoint` motir-core's own published catalogue
 * declares — in the seam lane, because a check that reaches app.motir.co may
 * not run on every pull request (`vitest.seam.config.mts`).
 *
 * ── ⚠️ WHY THE CLIENT BLOCKS LIVE IN A MODULE AND NOT IN THE PAGE ───────────
 * `tests/docs/docs.test.ts`'s tool-name detector scans
 * `app/docs/(guides)/mcp/page.tsx` for a lowercase underscore-joined identifier
 * — the shape every Motir MCP tool name has — because this repository cannot
 * check a tool name it types. Two VENDOR config keys have that same shape
 * (`mcp_servers` and `bearer_token_env_var`, both Codex CLI's TOML), so a page
 * that typed them would trip a guard that is right for a reason unrelated to
 * them. They are the vendor's spelling of its own file format, not a claim
 * about Motir's surface, and they belong beside the other four vendors'
 * spellings rather than inside the page. The guard stays literal, the page
 * stays clean, and this comment is the record of why.
 *
 * ── What is OURS and what is the VENDOR'S ───────────────────────────────────
 * Motir owns exactly the four transport facts. Everything else in a block —
 * the file path, the key names, the nesting, the secret mechanism — is that
 * vendor's, transcribed from that vendor's own documentation on
 * {@link MCP_CLIENT_FORMATS_CHECKED_ON}. So a stale block is wrong about a
 * vendor's syntax and never about Motir, which is why each one carries the
 * vendor's docs link and the date it was read.
 */

/** The served path. See the block comment above for why it is a literal. */
export const MCP_ENDPOINT_PATH = '/api/mcp'

/** The header every request carries; the scheme is separate so blocks compose it. */
export const MCP_AUTH_HEADER = 'Authorization'
export const MCP_AUTH_SCHEME = 'Bearer'

/**
 * The bearer PLACEHOLDER, not a plausible-looking fake. A realistic token in
 * published documentation gets pasted verbatim and then debugged as an auth
 * problem; an obvious placeholder cannot.
 */
export const MCP_TOKEN_PLACEHOLDER = 'motir_pat_<your-token>'

/**
 * The environment variable the two vendors that can read a secret out of the
 * environment are pointed at. One name, so a reader who wires two clients sets
 * one variable.
 */
export const MCP_TOKEN_ENV_VAR = 'MOTIR_TOKEN'

/** The four facts, resolved. Passed into every block so none hard-codes them. */
export interface McpTransportFacts {
  origin: string
  path: string
  url: string
  authHeader: string
  authScheme: string
  tokenPlaceholder: string
  tokenEnvVar: string
}

/**
 * The shipped facts. `origin` is overridable so a test can prove a block
 * INTERPOLATES it rather than reproducing a string somebody expected.
 */
export function mcpTransportFacts(
  origin: string = APP_ORIGIN,
): McpTransportFacts {
  return {
    origin,
    path: MCP_ENDPOINT_PATH,
    url: `${origin}${MCP_ENDPOINT_PATH}`,
    authHeader: MCP_AUTH_HEADER,
    authScheme: MCP_AUTH_SCHEME,
    tokenPlaceholder: MCP_TOKEN_PLACEHOLDER,
    tokenEnvVar: MCP_TOKEN_ENV_VAR,
  }
}

/** One row of the "every client needs these four" table. */
export interface McpTransportFactRow {
  label: string
  value: string
}

export function mcpTransportFactRows(
  facts: McpTransportFacts = mcpTransportFacts(),
): McpTransportFactRow[] {
  return [
    { label: 'URL', value: facts.url },
    {
      label: 'Transport',
      value: 'Streamable HTTP — not SSE, and not a stdio command',
    },
    {
      label: 'Header',
      value: `${facts.authHeader}: ${facts.authScheme} <token>, on every request`,
    },
    {
      label: 'Token',
      value: `${facts.tokenPlaceholder} — the one you minted in step 1`,
    },
  ]
}

/** One client's wiring block. Everything except `config` is the VENDOR's. */
export interface McpClient {
  /** Stable id — the React key and the section anchor. */
  id: string
  /** How the client is known to its users. */
  label: string
  /** Where the snippet goes — becomes the code pane's caption. */
  file: string
  /** The snippet, built by interpolating {@link McpTransportFacts}. */
  config: string
  /**
   * One line on what this vendor does about the secret, or what to watch for.
   * REQUIRED: every block has something worth saying, and an optional field
   * bought nothing but a dead branch in the page that renders it.
   */
  note: string
  /** That vendor's own MCP documentation — the authority when a block is stale. */
  docsUrl: string
  /** When the FORMAT was last read from `docsUrl`. */
  checkedOn: string
}

/**
 * The date the vendor formats below were read from their own documentation.
 * ONE constant, because they were checked in one pass and a per-client date
 * that nobody updates is worse than an honest shared one.
 */
export const MCP_CLIENT_FORMATS_CHECKED_ON = '2026-09-04'

/**
 * Every client block. **No entry hard-codes the endpoint, the header or the
 * token shape** — each interpolates `facts`, which is what
 * `tests/docs/mcpWiring.test.ts`'s sentinel-origin case is able to prove.
 *
 * Where a vendor supports reading the secret from somewhere else, the block
 * uses it. A guide whose first instruction is "paste a live credential into a
 * file your repository tracks" has taught the wrong habit in the first five
 * minutes.
 */
export function mcpClients(
  facts: McpTransportFacts = mcpTransportFacts(),
): McpClient[] {
  const bearer = `${facts.authScheme} ${facts.tokenPlaceholder}`
  return [
    {
      id: 'claude-code',
      label: 'Claude Code',
      file: '.mcp.json',
      config: [
        '{',
        '  "mcpServers": {',
        '    "motir": {',
        '      "type": "http",',
        `      "url": "${facts.url}",`,
        `      "headers": { "${facts.authHeader}": "${bearer}" }`,
        '    }',
        '  }',
        '}',
      ].join('\n'),
      note: `Or one command: claude mcp add --transport http motir ${facts.url} --header "${facts.authHeader}: ${bearer}"`,
      docsUrl: 'https://docs.claude.com/en/docs/claude-code/mcp',
      checkedOn: MCP_CLIENT_FORMATS_CHECKED_ON,
    },
    {
      id: 'cursor',
      label: 'Cursor',
      file: '~/.cursor/mcp.json — or .cursor/mcp.json for one project',
      config: [
        '{',
        '  "mcpServers": {',
        '    "motir": {',
        `      "url": "${facts.url}",`,
        `      "headers": { "${facts.authHeader}": "${facts.authScheme} \${env:${facts.tokenEnvVar}}" }`,
        '    }',
        '  }',
        '}',
      ].join('\n'),
      note: `Cursor interpolates \${env:…}, so the token stays in your environment and out of the file.`,
      docsUrl: 'https://cursor.com/docs/context/mcp',
      checkedOn: MCP_CLIENT_FORMATS_CHECKED_ON,
    },
    {
      id: 'vscode',
      label: 'VS Code',
      file: '.vscode/mcp.json',
      config: [
        '{',
        '  "inputs": [',
        '    {',
        '      "type": "promptString",',
        '      "id": "motir-token",',
        '      "description": "Motir personal access token",',
        '      "password": true',
        '    }',
        '  ],',
        '  "servers": {',
        '    "motir": {',
        '      "type": "http",',
        `      "url": "${facts.url}",`,
        `      "headers": { "${facts.authHeader}": "${facts.authScheme} \${input:motir-token}" }`,
        '    }',
        '  }',
        '}',
      ].join('\n'),
      note: 'VS Code prompts for the token the first time the server starts and stores it securely — nothing secret is written to the file.',
      docsUrl:
        'https://code.visualstudio.com/docs/agents/reference/mcp-configuration',
      checkedOn: MCP_CLIENT_FORMATS_CHECKED_ON,
    },
    {
      id: 'codex',
      label: 'Codex CLI',
      file: '~/.codex/config.toml',
      config: [
        '[mcp_servers.motir]',
        `url = "${facts.url}"`,
        `bearer_token_env_var = "${facts.tokenEnvVar}"`,
      ].join('\n'),
      note: 'bearer_token_env_var takes the variable’s NAME, not the token.',
      docsUrl: 'https://developers.openai.com/codex/mcp',
      checkedOn: MCP_CLIENT_FORMATS_CHECKED_ON,
    },
    {
      id: 'other',
      label: 'Any other streamable-HTTP client',
      file: 'whatever your client calls its config',
      config: [
        'Transport:  streamable HTTP',
        `URL:        ${facts.url}`,
        `Header:     ${facts.authHeader}: ${bearer}`,
      ].join('\n'),
      note: 'Windsurf, Zed, Cline, Goose, or something you wrote yourself — the same four facts under different key names.',
      docsUrl:
        'https://modelcontextprotocol.io/docs/develop/connect-local-servers',
      checkedOn: MCP_CLIENT_FORMATS_CHECKED_ON,
    },
  ]
}

/** How a reader verifies the connection, once the config is in place. */
export function mcpVerifyCommand(
  facts: McpTransportFacts = mcpTransportFacts(),
): string {
  return [
    `curl -sS -X POST ${facts.url} \\`,
    `  -H "${facts.authHeader}: ${facts.authScheme} $${facts.tokenEnvVar}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -H "Accept: application/json, text/event-stream" \\`,
    `  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
  ].join('\n')
}

/** One row of the reader's fork — MCP server, or the REST API? */
export interface McpForkRow {
  axis: string
  mcp: string
  rest: string
}

export function mcpForkRows(
  facts: McpTransportFacts = mcpTransportFacts(),
): McpForkRow[] {
  return [
    { axis: 'Endpoint', mcp: `POST ${facts.path}`, rest: '/api/v1/…' },
    {
      axis: 'Built for',
      mcp: 'An agent you control — it reads tool descriptions at run time.',
      rest: 'A client you ship — code written once against a fixed shape.',
    },
    {
      axis: 'Stability',
      mcp: 'Expected to change. Rewording a description or renaming an argument is how an agent’s behaviour gets tuned.',
      rest: 'Additive only. A breaking change mints /api/v2; v1 keeps its promise.',
    },
    {
      axis: 'Shape',
      mcp: 'The same. MCP payloads are derived from the v1 response schemas, so the two describe provably identical objects.',
      rest: 'The same, and it is the source the MCP derives from.',
    },
    {
      axis: 'Auth',
      mcp: 'One personal access token, one scope set.',
      rest: 'The same credential works on both.',
    },
  ]
}

/** motir-core's own MCP reference — the authority beyond this page. */
export const MCP_REFERENCE_URL =
  'https://github.com/moooon-B-V/motir-core/blob/main/docs/mcp.md'
