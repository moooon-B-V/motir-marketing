import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import McpPage from '@/app/docs/(guides)/mcp/page'
import { APP_ORIGIN } from '@/lib/appOrigin'
import {
  MCP_AUTH_HEADER,
  MCP_AUTH_SCHEME,
  MCP_ENDPOINT_PATH,
  MCP_TOKEN_ENV_VAR,
  MCP_TOKEN_PLACEHOLDER,
  mcpClients,
  mcpForkRows,
  mcpTransportFactRows,
  mcpTransportFacts,
  mcpVerifyCommand,
} from '@/lib/mcpWiring'

/*
 * THE WIRING GUIDE IS BACK, AND IT IS GENERATED (MOTIR-4429).
 *
 * `/docs/mcp` was two sentences: `0 <pre>` blocks, and `mcpServers` appeared
 * ZERO times across all nine `/docs` pages. A reader was told the endpoint
 * exists and given no way to reach it, on the page the sub-area is named
 * after. This file holds the restore in two halves, and the second is the one
 * the card's acceptance criterion is actually about.
 *
 *  1. The PAGE renders the wiring — a config block per client, each with its
 *     file path and its secret-handling note, plus the token step, the
 *     verification step and the scope table.
 *  2. Every block is INTERPOLATED from one set of transport facts. That is
 *     checked with a SENTINEL origin, which is what makes it a real check: a
 *     block that typed `https://app.motir.co` would satisfy any positive
 *     assertion made against the configured origin and fails here.
 */

const SENTINEL = 'https://sentinel.invalid'

/** The catalogue shape the scope table is derived from. Two invented groups. */
const catalogueFixture = {
  endpoint: MCP_ENDPOINT_PATH,
  toolCount: 2,
  groups: [
    {
      permission: 'zqthing:browse',
      label: 'Browse zqthings',
      gates: 'Read zqthings and their detail.',
      grantedByDefault: true,
      tools: [
        { name: 'zqAlpha', permission: 'zqthing:browse', summary: 'Read one.' },
      ],
    },
    {
      permission: 'zqthing:edit',
      label: 'Edit zqthings',
      gates: 'Create and change zqthings.',
      grantedByDefault: false,
      tools: [
        { name: 'zqBeta', permission: 'zqthing:edit', summary: 'Change one.' },
      ],
    },
  ],
}

function stubCatalogue(document: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(document), { status })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the transport facts are ONE source, and every block reads them', () => {
  it('composes the URL from the origin it is given', () => {
    const facts = mcpTransportFacts(SENTINEL)
    expect(facts.url).toBe(`${SENTINEL}${MCP_ENDPOINT_PATH}`)
    expect(facts.authHeader).toBe(MCP_AUTH_HEADER)
    expect(facts.authScheme).toBe(MCP_AUTH_SCHEME)
    expect(facts.tokenPlaceholder).toBe(MCP_TOKEN_PLACEHOLDER)
  })

  it('defaults to the ONE configured app origin, never a literal', () => {
    expect(mcpTransportFacts().url).toBe(`${APP_ORIGIN}${MCP_ENDPOINT_PATH}`)
  })

  it('THE GUARD — every client config carries the sentinel origin', () => {
    // ⚠️ THE NEGATIVE CASE, and the whole reason the blocks are built rather
    // than typed. A hand-copied config would carry `https://app.motir.co` and
    // would pass any assertion made against the configured origin, because
    // that IS the configured origin in production. Building with an origin
    // that appears nowhere in the repository is what separates "interpolated"
    // from "happens to match".
    const clients = mcpClients(mcpTransportFacts(SENTINEL))
    expect(clients.length).toBeGreaterThanOrEqual(5)
    const missing = clients
      .filter((client) => !client.config.includes(SENTINEL))
      .map((client) => client.id)
    expect(missing, 'a config that does not interpolate the origin').toEqual([])
  })

  it('THE PREDICATE FIRES on a hand-copied block', () => {
    // The counterfactual, so the guard above is known to be able to go red.
    const handCopied = [
      { id: 'typed', config: '{ "url": "https://app.motir.co/api/mcp" }' },
    ]
    expect(
      handCopied
        .filter((client) => !client.config.includes(SENTINEL))
        .map((client) => client.id),
    ).toEqual(['typed'])
  })

  it('carries no literal Motir origin anywhere in its source', () => {
    // The other direction, stated as an absence — the same shape
    // `tests/docs/cli.test.tsx` uses for the CLI's default server.
    const text = readFileSync('lib/mcpWiring.ts', 'utf8')
    // Comments are exempt: the block comment above the module EXPLAINS the
    // rule by quoting the string it forbids, which is the right place for it.
    const codeOnly = text.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(codeOnly).not.toContain('https://app.motir.co')
    expect(codeOnly).not.toContain('motir.co/api/mcp')
  })

  it('every block names its file, its note, its vendor docs and a date', () => {
    // Each field is the reason a block is usable rather than decorative: the
    // file says where it goes, the note says what to do about the secret, and
    // the vendor link is the authority when the format goes stale.
    for (const client of mcpClients()) {
      expect(client.file, client.id).not.toBe('')
      expect(client.note, client.id).not.toBe('')
      expect(client.docsUrl, client.id).toMatch(/^https:\/\//)
      expect(client.checkedOn, client.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('reads the secret from the environment where the vendor supports it', () => {
    // A guide whose first instruction is "paste a live credential into a file
    // your repository tracks" has taught the wrong habit in five minutes.
    const configs = mcpClients().map((client) => client.config)
    const fromEnvironment = configs.filter((config) =>
      config.includes(MCP_TOKEN_ENV_VAR),
    )
    expect(fromEnvironment.length).toBeGreaterThanOrEqual(2)
    // VS Code prompts instead, and stores it outside the file.
    expect(configs.join('\n')).toContain('promptString')
  })

  it('the verification command and the fork table read the same facts', () => {
    const facts = mcpTransportFacts(SENTINEL)
    expect(mcpVerifyCommand(facts)).toContain(`${SENTINEL}${MCP_ENDPOINT_PATH}`)
    expect(mcpVerifyCommand(facts)).toContain(`$${MCP_TOKEN_ENV_VAR}`)
    expect(mcpForkRows(facts)[0]!.mcp).toContain(MCP_ENDPOINT_PATH)
    expect(mcpTransportFactRows(facts).map((row) => row.label)).toEqual([
      'URL',
      'Transport',
      'Header',
      'Token',
    ])
  })
})

describe('/docs/mcp is a wiring GUIDE, not a definition', () => {
  it('carries a config block per client — the page had ZERO', async () => {
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())

    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    // One per client, plus the verification command.
    expect(panes.length).toBeGreaterThanOrEqual(mcpClients().length + 1)

    const code = panes.join('\n')
    // The two strings MOTIR-4397 measured at ZERO across the whole surface.
    expect(code).toContain('mcpServers')
    expect(container.textContent).toContain('claude mcp add')
  })

  it('every rendered block carries the SERVED origin', async () => {
    // The card's own criterion. In this lane the served origin is the test
    // value `vitest.config.mts` sets, which is not production — so a block
    // that typed the production URL fails here.
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())
    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    const configs = panes.filter((pane) => pane.includes('motir'))
    expect(configs.length).toBeGreaterThanOrEqual(mcpClients().length)
    for (const pane of configs) {
      expect(pane, pane.slice(0, 40)).toContain(APP_ORIGIN)
    }
  })

  it('names every supported client, with the file its config goes in', async () => {
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())
    const text = container.textContent ?? ''
    for (const client of mcpClients()) {
      expect(text, client.id).toContain(client.label)
      expect(text, `${client.id} file`).toContain(client.file)
    }
  })

  it('walks the three steps: mint, wire, check', async () => {
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())
    const headings = [...container.querySelectorAll('h2')].map(
      (heading) => heading.textContent ?? '',
    )
    expect(headings).toEqual([
      'This server, or the REST API?',
      '1Mint a token',
      '2Wire your client',
      '3Check the connection',
      'What a token may call',
      'What next',
    ])
  })

  it('warns that an unauthorized answer is about the TOKEN', async () => {
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())
    expect(container.textContent).toMatch(/unauthorized answer is about the/i)
  })

  it('DERIVES the scope table from the published catalogue', async () => {
    // Every scope on the page comes from the fixture and from nowhere else —
    // this repository keeps no copy of a scope list it could not check.
    stubCatalogue(catalogueFixture)
    const { container } = render(await McpPage())
    const text = container.textContent ?? ''
    for (const group of catalogueFixture.groups) {
      expect(text, group.permission).toContain(group.permission)
      expect(text, `${group.permission} gates`).toContain(group.gates)
    }
    expect(text).toContain('Off by default')
  })

  it('UNREACHABLE degrades the scope table only — the wiring still renders', async () => {
    // ⚠️ THE JUDGEMENT THIS CARD MAKES, stated as a test. `/docs/mcp/tools`
    // renders the unreachable state instead of a page, because its whole body
    // IS the catalogue. Here the catalogue is one section of eight, and the
    // wiring — the reason a reader is on this page — needs no network at all.
    // Blanking the page would strand a reader on the one thing that still
    // worked.
    stubCatalogue({}, 503)
    const { container } = render(await McpPage())
    const text = container.textContent ?? ''
    expect(text).toContain('The scope table is temporarily unreachable')
    expect(text).toContain('claude mcp add')
    expect(
      [...container.querySelectorAll('pre')].length,
      'the config blocks survive an unreachable catalogue',
    ).toBeGreaterThanOrEqual(mcpClients().length)
  })
})
