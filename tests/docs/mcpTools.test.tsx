import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import McpToolsPage from '@/app/docs/mcp/tools/page'
import { parseMcpToolCatalogue } from '@/lib/docs'

/*
 * THE FETCH-VERSUS-RENDER GUARD, SECOND INSTANCE (MOTIR-4394) — the same shape
 * `tests/docs/apiReference.test.tsx` holds over `/docs/api`, over the tool
 * catalogue.
 *
 * The page rendered 55 tool names, a permission and a summary, and could not do
 * better: the published artifact carried no `inputSchema`. MOTIR-4389 widened
 * it; this asserts the widening REACHES THE READER, using argument names that
 * appear nowhere else in this repository so a match on the page can only have
 * come off the wire.
 *
 * ⚠️ AND IT ASSERTS THE THREE-WAY DISTINCTION, which is the part a reasonable
 * implementation gets wrong. `undefined`, `{ properties: {} }` and a populated
 * schema are THREE different facts:
 *
 *   · undefined            → the SERVER does not publish arguments (an older
 *                            motir-core, or the window before its deploy lands)
 *   · properties: {}       → the TOOL takes none
 *   · properties: { … }    → render them
 *
 * Collapsing the first two into one empty block is this bug one level up: an
 * empty rendering that reads as an answer. The tests below pin all three.
 */

const FIXTURE_ONLY = {
  requiredArg: 'zqCarillonKey',
  optionalArg: 'zqFathomDrift',
  enumMember: 'zqQuince',
} as const

const FIXTURE_TOKENS = Object.values(FIXTURE_ONLY)

/** The document motir-core serves, in the shape MOTIR-4389 publishes. */
const catalogue = {
  endpoint: '/api/mcp',
  toolCount: 3,
  groups: [
    {
      permission: 'thing:browse',
      label: 'Browse things',
      gates: 'Read things and their detail.',
      grantedByDefault: true,
      tools: [
        {
          name: 'zqWithArguments',
          permission: 'thing:browse',
          summary: 'A tool that takes arguments.',
          inputSchema: {
            type: 'object',
            required: [FIXTURE_ONLY.requiredArg],
            properties: {
              [FIXTURE_ONLY.requiredArg]: {
                type: 'string',
                enum: [FIXTURE_ONLY.enumMember, 'other'],
                description: 'Required, and a closed enum.',
              },
              [FIXTURE_ONLY.optionalArg]: {
                anyOf: [{ type: 'number' }, { type: 'null' }],
                description: 'Optional and nullable.',
              },
            },
          },
        },
        {
          name: 'zqWithNoArguments',
          permission: 'thing:browse',
          summary: 'A tool that takes none.',
          inputSchema: { type: 'object', properties: {} },
        },
      ],
    },
    {
      permission: 'thing:edit',
      label: 'Edit things',
      gates: 'Create and change things.',
      grantedByDefault: false,
      tools: [
        {
          name: 'zqFromAnOlderServer',
          permission: 'thing:edit',
          summary: 'A tool from a server that publishes no schemas.',
        },
      ],
    },
  ],
}

function stubCatalogueFetch(document: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(document), { status: 200 })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/** THE PREDICATE, so the counterfactual drives the code the guard runs. */
function missingFromRender(html: string, tokens: readonly string[]): string[] {
  return tokens.filter((token) => !html.includes(token))
}

describe('the tool catalogue RENDERS the arguments it fetches', () => {
  it('puts every fixture-only argument name on the page — the guard', async () => {
    stubCatalogueFetch(catalogue)
    const { container } = render(await McpToolsPage())
    expect(
      missingFromRender(container.innerHTML, FIXTURE_TOKENS),
      'the page fetched the catalogue and did not render its arguments',
    ).toEqual([])
  })

  it('the predicate FIRES on the shape the page rendered BEFORE this card', () => {
    const namesOnly =
      '<li><code>zqWithArguments</code><p>A tool that takes arguments.</p></li>'
    expect(missingFromRender(namesOnly, FIXTURE_TOKENS)).toEqual(FIXTURE_TOKENS)
  })

  it('marks required-ness and shows enum members', async () => {
    stubCatalogueFetch(catalogue)
    const { container } = render(await McpToolsPage())
    const html = container.innerHTML
    const requiredRow = html.slice(html.indexOf(FIXTURE_ONLY.requiredArg))
    expect(requiredRow.slice(0, 400)).toContain('required')
    expect(html).toContain(FIXTURE_ONLY.enumMember)
    const optionalRow = html.slice(html.indexOf(FIXTURE_ONLY.optionalArg))
    expect(optionalRow.slice(0, 400)).toContain('optional')
    // The nullable arm survives — a flattened `type` field would have lost it.
    expect(html).toContain('number | null')
  })
})

describe('the THREE-WAY distinction — absent, empty, populated', () => {
  it('a tool that takes NONE says so, rather than rendering an empty block', async () => {
    stubCatalogueFetch(catalogue)
    const { container } = render(await McpToolsPage())
    const row = container.innerHTML.slice(
      container.innerHTML.indexOf('zqWithNoArguments'),
    )
    expect(row.slice(0, 500)).toContain('Takes no arguments')
  })

  it('a tool whose SERVER publishes no schemas says THAT, which is a different fact', async () => {
    stubCatalogueFetch(catalogue)
    const { container } = render(await McpToolsPage())
    const row = container.innerHTML.slice(
      container.innerHTML.indexOf('zqFromAnOlderServer'),
    )
    expect(row.slice(0, 600)).toContain('does not publish')
    // …and it must NOT say the tool takes none, which is the collapse.
    expect(row.slice(0, 600)).not.toContain('Takes no arguments')
  })

  it('the whole page renders against a catalogue with NO schemas at all', async () => {
    // ⚠️ THE MERGE-ORDER ARM. Between this page shipping and motir-core's deploy
    // landing, every row looks like `zqFromAnOlderServer`. A page that required
    // `inputSchema` would be red for that whole window, on an order nobody
    // controls. This is the boundary-contract rule as a test.
    const older = {
      ...catalogue,
      groups: catalogue.groups.map((group) => ({
        ...group,
        tools: group.tools.map(({ name, permission, summary }) => ({
          name,
          permission,
          summary,
        })),
      })),
    }
    stubCatalogueFetch(older)
    const { container } = render(await McpToolsPage())
    expect(container.innerHTML).toContain('zqWithArguments')
    expect(container.innerHTML).toContain('does not publish')
  })
})

describe('the parse tolerates the field, and never invents it', () => {
  it('reads `inputSchema` when the artifact carries one', () => {
    const parsed = parseMcpToolCatalogue(catalogue)
    expect(parsed.groups[0]!.tools[0]!.inputSchema?.required).toEqual([
      FIXTURE_ONLY.requiredArg,
    ])
  })

  it('leaves it undefined when the artifact does not — not `{}`', () => {
    const parsed = parseMcpToolCatalogue(catalogue)
    expect(parsed.groups[1]!.tools[0]!.inputSchema).toBeUndefined()
  })

  it('treats a non-object `inputSchema` as absent rather than reddening the page', () => {
    // The field is outside the shape contract the parse throws on, so a
    // producer that ships something unreadable there must not take the page
    // down — it must lose that one row's arguments.
    const odd = JSON.parse(JSON.stringify(catalogue)) as typeof catalogue
    ;(odd.groups[0]!.tools[0] as Record<string, unknown>).inputSchema = 'nope'
    expect(() => parseMcpToolCatalogue(odd)).not.toThrow()
    expect(
      parseMcpToolCatalogue(odd).groups[0]!.tools[0]!.inputSchema,
    ).toBeUndefined()
  })

  it('still throws on the fields that ARE the shape contract', () => {
    const broken = JSON.parse(JSON.stringify(catalogue)) as Record<
      string,
      unknown
    >
    delete broken.groups
    expect(() => parseMcpToolCatalogue(broken)).toThrow()
  })
})

describe('the tokens really are unique to this file', () => {
  function sourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) sourceFiles(path, out)
      else if (/\.(tsx?|json|css|md)$/.test(path)) out.push(path)
    }
    return out
  }

  it('no argument name appears in app/, lib/ or messages/', () => {
    const files = [
      ...sourceFiles('app'),
      ...sourceFiles('lib'),
      ...sourceFiles('messages'),
    ]
    const offenders: string[] = []
    for (const file of files) {
      const contents = readFileSync(file, 'utf8')
      for (const token of FIXTURE_TOKENS) {
        if (contents.includes(token)) offenders.push(`${file}: ${token}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
