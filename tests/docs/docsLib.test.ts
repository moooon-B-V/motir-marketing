import { describe, expect, it } from 'vitest'
import {
  CliCommandsShapeError,
  McpToolCatalogueShapeError,
  describeSchema,
  exampleRequest,
  groupCliCommands,
  operationAnchorId,
  parseCliCommands,
  parseMcpToolCatalogue,
  resolveSchemaRefs,
  schemaTypeLabel,
  type ApiOperation,
  type CliCommandsDocument,
} from '@/lib/docs'

/*
 * `lib/docs.ts`'s TOP-UP (MOTIR-7083). The story put this file under the
 * coverage floor for the first time, and the branches below were the ones no
 * page test reached: the schema helpers' rarer shapes, the parsers' refusals of
 * a non-object row, and the fallbacks for a document that omits a field. Each
 * case names the branch it is for, so a later reader can tell a test that
 * guards behaviour from one that only buys a percentage — and none of these is
 * the second kind: every fallback here is a page a reader would otherwise see
 * broken.
 */

describe('schemaTypeLabel — every shape a schema can take', () => {
  it('names what it can, and says unknown for what it cannot', () => {
    expect(schemaTypeLabel(undefined)).toBe('unknown')
    expect(schemaTypeLabel({})).toBe('unknown')
    expect(schemaTypeLabel({ properties: { a: { type: 'string' } } })).toBe(
      'object',
    )
  })

  it('joins an allOf, suffixes an array, and uses an object’s title', () => {
    expect(
      schemaTypeLabel({ allOf: [{ type: 'string' }, { type: 'number' }] }),
    ).toBe('string & number')
    expect(schemaTypeLabel({ type: 'array', items: { type: 'integer' } })).toBe(
      'integer[]',
    )
    expect(schemaTypeLabel({ type: 'object', title: 'WorkItem' })).toBe(
      'WorkItem',
    )
  })

  it('carries a format beside its type', () => {
    expect(schemaTypeLabel({ type: 'string', format: 'date-time' })).toBe(
      'string (date-time)',
    )
  })
})

describe('describeSchema — a union whose object arm carries the properties', () => {
  it('reads the properties from the arm, and enum members from a nullable arm', () => {
    const fields = describeSchema({
      anyOf: [
        { type: 'null' },
        {
          type: 'object',
          required: ['mode'],
          properties: {
            mode: {
              anyOf: [{ type: 'string', enum: ['a', 'b'] }, { type: 'null' }],
            },
          },
        },
      ],
    })
    expect(fields).toEqual([
      expect.objectContaining({
        name: 'mode',
        required: true,
        enumValues: ['a', 'b'],
      }),
    ])
  })

  it('answers no fields for a schema with no properties anywhere', () => {
    expect(describeSchema({ type: 'string' })).toEqual([])
    expect(describeSchema(undefined)).toEqual([])
  })
})

describe('exampleRequest — a placeholder of each field’s own type', () => {
  const operation: ApiOperation = {
    method: 'POST',
    path: '/api/v1/things',
    parameters: [],
    responses: [],
    requestBody: {
      required: true,
      mediaType: 'application/json',
      schema: {
        type: 'object',
        required: ['kind', 'tags', 'count', 'size', 'on', 'name'],
        properties: {
          kind: { type: 'string', enum: ['first', 'second'] },
          tags: { type: 'array', items: { type: 'string' } },
          count: { type: 'number' },
          size: { type: 'integer' },
          on: { type: 'boolean' },
          name: { type: 'string' },
          optional: { type: 'string' },
        },
      },
    },
  }

  it('sends the required fields only, each typed', () => {
    const body = JSON.parse(
      /-d '(.*)'$/m.exec(exampleRequest(operation, 'https://x.invalid'))![1]!,
    )
    expect(body).toEqual({
      kind: 'first',
      tags: [],
      count: 0,
      size: 0,
      on: true,
      name: '<name>',
    })
  })

  it('sends no body and no content type for an operation without one', () => {
    const { requestBody: _none, ...bodiless } = operation
    void _none
    const request = exampleRequest(bodiless, 'https://x.invalid')
    expect(request).not.toContain('Content-Type')
    expect(request).not.toContain(' -d ')
  })
})

describe('resolveSchemaRefs — the pointers it cannot follow', () => {
  it('reports an unresolvable, a missing and a cyclic $ref by name, and terminates', () => {
    expect(resolveSchemaRefs({ $ref: 'https://elsewhere/x' }, {})).toEqual({
      type: 'https://elsewhere/x',
      description: undefined,
    })
    expect(
      resolveSchemaRefs({ $ref: '#/components/schemas/Gone' }, {}),
    ).toEqual({ type: 'Gone', description: undefined })
    const cyclic = resolveSchemaRefs(
      { $ref: '#/components/schemas/Node' },
      {
        Node: {
          type: 'object',
          properties: { next: { $ref: '#/components/schemas/Node' } },
        },
      },
    )
    expect(cyclic.properties?.next).toEqual({
      type: 'Node',
      description: undefined,
    })
  })
})

describe('the MCP catalogue parse refuses a row that is not an object', () => {
  const tool = { name: 'zqTool', permission: 'p:x', summary: 'One.' }
  const document = (groups: unknown[]) => ({
    endpoint: '/api/mcp',
    toolCount: 1,
    groups,
  })
  const group = (tools: unknown[]) => ({
    permission: 'p:x',
    label: 'P',
    gates: 'Gates.',
    grantedByDefault: true,
    tools,
  })

  it('a group, and a tool', () => {
    expect(() => parseMcpToolCatalogue(document(['nope']))).toThrow(
      McpToolCatalogueShapeError,
    )
    expect(() => parseMcpToolCatalogue(document([group([42])]))).toThrow(
      McpToolCatalogueShapeError,
    )
  })

  it('reads an EMPTY title as no title — the name alone, not a blank beside it', () => {
    const parsed = parseMcpToolCatalogue(
      document([group([{ ...tool, title: '' }])]),
    )
    expect('title' in parsed.groups[0]!.tools[0]!).toBe(false)
  })
})

describe('the CLI catalogue parse and grouping', () => {
  const command = {
    path: 'next',
    signature: '',
    invocation: 'motir next',
    description: 'Print the next card.',
    helpGroup: 'Work',
    options: [],
  }
  const document = (commands: unknown[]) => ({
    packageName: '@zq/cli',
    packageVersion: '0.0.0',
    installCommand: 'npm i -g @zq/cli',
    nodeRequirement: '>=22',
    defaultServer: 'https://x.invalid',
    commandCount: commands.length,
    commands,
  })

  it('refuses a command or an option that is not an object, and a command with no options', () => {
    expect(() => parseCliCommands(document(['nope']))).toThrow(
      CliCommandsShapeError,
    )
    expect(() =>
      parseCliCommands(document([{ ...command, options: ['nope'] }])),
    ).toThrow(CliCommandsShapeError)
    const { options: _none, ...optionless } = command
    void _none
    expect(() => parseCliCommands(document([optionless]))).toThrow(
      CliCommandsShapeError,
    )
  })

  it('reads a missing signature as empty and a missing group as none', () => {
    const { signature: _s, helpGroup: _g, ...bare } = command
    void _s
    void _g
    const parsed = parseCliCommands(document([bare]))
    expect(parsed.commands[0]).toMatchObject({ signature: '', helpGroup: null })
  })

  it('puts an ungrouped command that comes first in a group of its own, never drops it', () => {
    const parsed: CliCommandsDocument = parseCliCommands(
      document([{ ...command, path: 'early', helpGroup: null }, command]),
    )
    const groups = groupCliCommands(parsed)
    expect(groups.map((g) => g.heading)).toEqual(['Commands', 'Work'])
    expect(groups.flatMap((g) => g.commands).length).toBe(2)
  })
})

describe('operationAnchorId — a document that omits operationId', () => {
  it('slugs the method and path instead', () => {
    expect(
      operationAnchorId({
        method: 'GET',
        path: '/api/v1/work-items/{key}',
        parameters: [],
        responses: [],
      }),
    ).toBe('get-api-v1-work-items-key')
  })
})
