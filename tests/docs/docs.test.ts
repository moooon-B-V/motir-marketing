// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listOperations, type OpenApiDocument } from '@/lib/docs'

/*
 * The /docs drift guard (MOTIR-4046, widened by MOTIR-4180).
 *
 * `/docs` is generated from TWO of motir-core's registries, and each half is
 * guarded on its own terms.
 *
 * The API reference consumes motir-core's PUBLISHED OpenAPI document — served
 * at the versioned, public `/api/openapi/v1.json`, assembled from compile-time
 * declarations — rather than a copied spec. So the guard is two-fold: the spec
 * is fetched from the published URL (never a committed copy), and the parse the
 * reference renders through is asserted against a fixture, so a shape change in
 * motir-core's registry that breaks the parse fails here rather than silently
 * rendering an empty reference.
 *
 * The MCP TOOL registry has no published artifact to consume: motir-core serves
 * no catalogue endpoint, and `/api/mcp` rejects an anonymous caller, so nothing
 * in this repository can read the live list to check a copy against. MOTIR-4046
 * shipped a copy anyway — 24 of 55 tools in five invented groups, with no reader
 * and no checker — which is the outcome its own acceptance criterion had already
 * called unacceptable. MOTIR-4180's answer is that the copy does not exist: the
 * pages under /docs/mcp name NO tools, and the guard below asserts the absence.
 * An absence is the one property this repository CAN check on its own.
 */

const fixture: OpenApiDocument = {
  openapi: '3.1.0',
  info: { title: 'Motir API', version: '1' },
  paths: {
    '/api/public/explore': {
      get: { operationId: 'listDirectory', summary: 'List the square' },
    },
    '/api/v1/projects/{key}': {
      get: { operationId: 'getProject', summary: 'Read a project' },
      patch: { operationId: 'updateProject', summary: 'Update a project' },
    },
  },
}

describe('listOperations', () => {
  it('flattens the spec paths into a sorted operation list', () => {
    expect(listOperations(fixture)).toEqual([
      {
        method: 'GET',
        path: '/api/public/explore',
        operationId: 'listDirectory',
        summary: 'List the square',
        description: undefined,
      },
      {
        method: 'GET',
        path: '/api/v1/projects/{key}',
        operationId: 'getProject',
        summary: 'Read a project',
        description: undefined,
      },
      {
        method: 'PATCH',
        path: '/api/v1/projects/{key}',
        operationId: 'updateProject',
        summary: 'Update a project',
        description: undefined,
      },
    ])
  })

  it('ignores methods that carry no operation', () => {
    const doc: OpenApiDocument = {
      openapi: '3.1.0',
      info: { title: 'x', version: '1' },
      paths: { '/api/x': { get: { summary: 'only get' } } },
    }
    expect(listOperations(doc).map((o) => o.method)).toEqual(['GET'])
  })
})

describe('the reference consumes the published spec, never a copied one', () => {
  it('fetches the versioned public endpoint on the app origin', () => {
    // The spec URL is assembled from the ONE configured app origin and the
    // stable, public `/api/openapi/v1.json` path — a client generator hard-codes
    // it, so this repository must not drift onto a hand-copied file.
    const source = readFileSync('lib/docs.ts', 'utf8')
    expect(source).toContain('/api/openapi/v1.json')
    expect(source).toContain('APP_ORIGIN')
  })

  it('commits no copied spec artifact under content/docs/', () => {
    expect(existsSync('content/docs')).toBe(false)
  })
})

/*
 * A lowercase snake_case identifier is the shape every Motir MCP tool name has
 * (`get_work_item`, `add_plan_items`, `link_pull_request`), and nothing else in
 * these pages is written that way — the Tailwind tokens are kebab-case, the
 * routes are slash-separated, and the motir-core symbols cited in the comments
 * are UPPER_SNAKE. So it is a precise detector for a reintroduced tool list,
 * and it does not depend on knowing which tools exist, which is exactly the
 * thing this repository cannot know.
 */
export function toolNameLiterals(source: string): string[] {
  return source.match(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g) ?? []
}

describe('the MCP pages name no tools, because nothing here could check them', () => {
  // The detector is proved to FIRE before it is trusted to pass: perturb the
  // sample by putting one real tool name back, and it must be reported by name.
  it('reports a tool name that has been put back', () => {
    const perturbed =
      "const GROUPS = [{ name: 'Work items', tools: ['get_work_item'] }]"
    expect(toolNameLiterals(perturbed)).toContain('get_work_item')
  })

  it('ignores the kebab-case tokens and slash-separated routes the pages do use', () => {
    const shipped =
      '<code className="rounded-(--radius-kbd) bg-(--el-muted)">tools/list</code> /api/mcp TOOL_PERMISSIONS'
    expect(toolNameLiterals(shipped)).toEqual([])
  })

  for (const page of ['app/docs/mcp/tools/page.tsx', 'app/docs/mcp/page.tsx']) {
    it(`names no tool in ${page}`, () => {
      expect(toolNameLiterals(readFileSync(page, 'utf8'))).toEqual([])
    })
  }
})
