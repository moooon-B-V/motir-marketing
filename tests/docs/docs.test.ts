// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listOperations, type OpenApiDocument } from '@/lib/docs'

/*
 * The /docs drift guard (MOTIR-4046).
 *
 * The API reference consumes motir-core's PUBLISHED OpenAPI document — served
 * at the versioned, public `/api/openapi/v1.json`, assembled from compile-time
 * declarations — rather than a copied spec. So the guard is two-fold: the spec
 * is fetched from the published URL (never a committed copy), and the parse the
 * reference renders through is asserted against a fixture, so a shape change in
 * motir-core's registry that breaks the parse fails here rather than silently
 * rendering an empty reference.
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
