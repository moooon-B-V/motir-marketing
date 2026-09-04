import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CliPage from '@/app/docs/cli/page'
import { groupCliCommands, parseCliCommands } from '@/lib/docs'

/*
 * THE FETCH-VERSUS-RENDER GUARD, THIRD INSTANCE (MOTIR-4395) — over the CLI
 * command catalogue.
 *
 * The page was five sentences of positioning: no install line, no
 * authentication, no command list, no flags. Three `<code>` elements and ZERO
 * `<pre>` blocks. The card is explicit that a page with zero after it is not
 * done, so that is asserted rather than assumed.
 *
 * ⚠️ AND THE OTHER HALF OF THE CARD IS A NEGATIVE: the page must contain no
 * hard-coded server URL of its own, because the catalogue carries it and a
 * second copy could disagree with the binary a reader installed. A positive
 * assertion that the URL appears would pass on a typed one; the negative is
 * what makes "read from the catalogue" checkable.
 */

const catalogue = {
  packageName: '@zq/cli-fixture',
  packageVersion: '9.9.9',
  installCommand: 'npm install -g @zq/cli-fixture',
  nodeRequirement: '>=22',
  defaultServer: 'https://zq-fixture.test',
  commandCount: 3,
  commands: [
    {
      path: 'zqlogin',
      signature: '',
      invocation: 'motir zqlogin',
      description: 'Connect this terminal.',
      helpGroup: 'SETUP COMMANDS:',
      options: [
        { flags: '--zq-server <url>', description: 'Server base URL.' },
        { flags: '--no-zq-browser', description: 'Do not launch a browser.' },
      ],
    },
    {
      path: 'zqlogin sub',
      signature: '',
      invocation: 'motir zqlogin sub',
      description: 'A subcommand, which commander gives no group of its own.',
      helpGroup: null,
      options: [],
    },
    {
      path: 'zqrun',
      signature: '<zqscope>',
      invocation: 'motir zqrun <zqscope>',
      description: 'Run a scope.',
      helpGroup: 'WORK LOOP COMMANDS:',
      options: [{ flags: '--zq-max <n>', description: 'Stop after n items.' }],
    },
  ],
}

/** Strings that exist in this fixture and nowhere in the repository. */
const FIXTURE_TOKENS = [
  'motir zqrun <zqscope>',
  '--zq-max <n>',
  '@zq/cli-fixture',
  'https://zq-fixture.test',
]

function stubCliFetch(document: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(document), { status })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/** THE PREDICATE, so the counterfactual drives the code the guard runs. */
function missingFromRender(html: string, tokens: readonly string[]): string[] {
  return tokens.filter((token) => !html.includes(token))
}

describe('the CLI page is GENERATED from the catalogue it fetches', () => {
  it('puts every fixture-only command, flag and version on the page — the guard', async () => {
    stubCliFetch(catalogue)
    const { container } = render(await CliPage())
    expect(
      missingFromRender(container.textContent ?? '', FIXTURE_TOKENS),
      'the page fetched the catalogue and did not render it',
    ).toEqual([])
  })

  it('the predicate FIRES on the positioning paragraph that shipped', () => {
    const positioningOnly =
      '<p>The Motir CLI talks to the same MCP server the hosted agents use.</p>'
    expect(missingFromRender(positioningOnly, FIXTURE_TOKENS)).toEqual(
      FIXTURE_TOKENS,
    )
  })

  it('renders EVERY command in the catalogue — a count, not a spot check', async () => {
    stubCliFetch(catalogue)
    const { container } = render(await CliPage())
    for (const command of catalogue.commands) {
      expect(container.textContent, command.path).toContain(command.invocation)
    }
    const rendered = container.querySelectorAll('section ul > li').length
    expect(rendered).toBe(catalogue.commands.length)
  })

  it('the INVOCATION carries the argument signature, so a scope is not lost', async () => {
    stubCliFetch(catalogue)
    const { container } = render(await CliPage())
    expect(container.textContent).toContain('motir zqrun <zqscope>')
  })

  it('carries install and authentication as <pre> blocks — the page had ZERO', async () => {
    stubCliFetch(catalogue)
    const { container } = render(await CliPage())
    const panes = [...container.querySelectorAll('pre')].map(
      (pane) => pane.textContent ?? '',
    )
    expect(panes.length).toBeGreaterThanOrEqual(3)
    expect(panes.join('\n')).toContain('npm install -g @zq/cli-fixture')
    expect(panes.join('\n')).toContain('motir login')
    expect(panes.join('\n')).toContain('https://zq-fixture.test')
  })

  it('groups in the catalogue’s own order, and a SUBCOMMAND joins its parent’s group', async () => {
    // Catalogue order is REGISTRATION order, which is the order `motir help`
    // renders; a subcommand carries no group of its own and a reader looks for
    // it under the command it hangs on.
    const groups = groupCliCommands(parseCliCommands(catalogue))
    expect(groups.map((g) => g.heading)).toEqual([
      'SETUP COMMANDS:',
      'WORK LOOP COMMANDS:',
    ])
    expect(groups[0]!.commands.map((c) => c.path)).toEqual([
      'zqlogin',
      'zqlogin sub',
    ])
  })
})

describe('the page keeps NO copy of what the catalogue carries', () => {
  it('contains no hard-coded server URL of its own', () => {
    // The card's own criterion, and it is a NEGATIVE for a reason: a positive
    // assertion that the URL appears on the page would pass on a typed one.
    const source = readFileSync('app/docs/cli/page.tsx', 'utf8')
    expect(source).not.toContain('https://app.motir.co')
  })

  it('hand-maintains NO command list — the reference is generated, and only the first-run procedure is typed', () => {
    /*
     * ⚠️ THE BOUNDARY THIS DRAWS, because it is a judgement and not an
     * absolute. The card forbids a hand-maintained command LIST; it does not
     * forbid prose. `lib/docs.ts`'s own carve-out says the guide pages are
     * authored documentation, and a first-run procedure — log in, bind a
     * folder, check the setup — is exactly that: four lines a reader types
     * once, in the order they type them, which a generated table sorted by
     * help group cannot express.
     *
     * So the guard is a CEILING on what may be typed, enumerated here with its
     * reason, rather than a zero. It fires the moment somebody starts adding
     * flags to the page instead of letting the catalogue carry them — which is
     * the drift the card is actually about.
     */
    const source = readFileSync('app/docs/cli/page.tsx', 'utf8')

    // A CSS custom property is not a CLI flag. They are the only other thing in
    // this file spelled with two leading dashes.
    const CSS_TOKEN = /^--(el|font|radius|spacing|height|shadow|color)-/
    const flags = [
      ...new Set(
        (source.match(/--[a-z][a-z-]*/g) ?? []).filter(
          (token) => !CSS_TOKEN.test(token),
        ),
      ),
    ].sort()

    // The three the authenticate block types, each carried BY the catalogue as
    // well — they are shown in a worked order, not enumerated as a reference.
    expect(flags).toEqual(['--help', '--project', '--server', '--token'])

    const AUTHORED = [
      'motir login', // the device flow — the shortest first run
      'motir auth', // …and the token form, for someone who already holds one
      'motir link', // bind a folder to a project
      'motir doctor', // check the setup before the first run
      'motir help', // the fallback when the catalogue is unreachable
    ]
    const invocations = [
      ...new Set(source.match(/motir [a-z]+/g) ?? []),
    ].filter((m) => !AUTHORED.includes(m))
    expect(invocations).toEqual([])
  })

  it('commits no catalogue artifact', () => {
    const source = readFileSync('lib/docs.ts', 'utf8')
    expect(source).toContain('/api/docs/cli-commands.json')
    expect(source).toContain('APP_ORIGIN')
  })
})

describe('unreachable — the page says so, and still helps', () => {
  it('renders the introduction and a route out, never a stale list', async () => {
    stubCliFetch({}, 503)
    const { container } = render(await CliPage())
    expect(container.textContent).toContain('temporarily unreachable')
    // ⚠️ The introduction SURVIVES. Between this page shipping and motir-core's
    // deploy landing, the route does not exist, so this is the state a reader
    // meets — and stranding them on an error was never the point of the
    // no-fallback contract.
    expect(container.textContent).toContain('The Motir CLI talks to')
    expect(container.textContent).not.toContain('@zq/cli-fixture')
  })
})

describe('parseCliCommands throws rather than degrading', () => {
  const mutate = (fn: (doc: Record<string, unknown>) => void) => {
    const doc = JSON.parse(JSON.stringify(catalogue)) as Record<string, unknown>
    fn(doc)
    return doc
  }

  it('reads the document motir-core serves', () => {
    const parsed = parseCliCommands(catalogue)
    expect(parsed.commandCount).toBe(3)
    expect(parsed.commands[2]!.options[0]!.flags).toBe('--zq-max <n>')
  })

  it('counts the ROWS, never the served count', () => {
    // A producer whose `commandCount` disagreed with its own list would put a
    // number on the page that the list beneath it contradicts.
    const lying = mutate((doc) => {
      doc.commandCount = 99
    })
    expect(parseCliCommands(lying).commandCount).toBe(3)
  })

  it('tolerates an EMPTY signature, which is a value and not an absence', () => {
    expect(parseCliCommands(catalogue).commands[0]!.signature).toBe('')
  })

  for (const [what, fn] of [
    ['`commands` is missing', (doc) => delete doc.commands],
    [
      '`commands` is renamed',
      (doc) => {
        doc.commandList = doc.commands
        delete doc.commands
      },
    ],
    [
      '`commands` is empty',
      (doc) => {
        doc.commands = []
      },
    ],
    ['`installCommand` is missing', (doc) => delete doc.installCommand],
    ['`defaultServer` is missing', (doc) => delete doc.defaultServer],
    ['`packageVersion` is missing', (doc) => delete doc.packageVersion],
    [
      'a command has lost its options array',
      (doc) => {
        delete (doc.commands as Record<string, unknown>[])[0]!.options
      },
    ],
    [
      'an option has lost its flags',
      (doc) => {
        delete (
          (doc.commands as Record<string, unknown>[])[0]!.options as Record<
            string,
            unknown
          >[]
        )[0]!.flags
      },
    ],
  ] as [string, (doc: Record<string, unknown>) => void][]) {
    it(`throws when ${what}`, () => {
      expect(() => parseCliCommands(mutate(fn))).toThrow()
    })
  }

  it('throws when the document is not an object at all', () => {
    expect(() => parseCliCommands(undefined)).toThrow()
  })
})
