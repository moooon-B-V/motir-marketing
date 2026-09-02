import { APP_ORIGIN } from '@/lib/appOrigin'

/**
 * The `/docs` data layer (MOTIR-4046, corrected by MOTIR-4180).
 *
 * The API reference is GENERATED from `motir-core`'s own registry, and it is
 * PUBLISHED as a served, versioned OpenAPI 3.1 document at
 * `/api/openapi/v1.json` — assembled from compile-time declarations, never a
 * hand-maintained file. This repository consumes that published artifact rather
 * than copying a spec that would drift: the reference page fetches it fresh, so
 * it is always exactly what motir-core serves, and `tests/docs/docs.test.ts`
 * asserts the URL it fetches is the published one and that no spec is committed.
 *
 * ⚠️ THAT COVERS ONE OF THE TWO REGISTRIES `/docs` SPEAKS FOR, AND ONLY ONE.
 * The MCP TOOL registry has no published artifact to consume — motir-core serves
 * no catalogue endpoint, and `/api/mcp` rejects an anonymous caller — so this
 * module reads nothing for it and the guard cannot compare anything against it.
 * The answer is that there is nothing to compare: the pages under `/docs/mcp`
 * name no tools and point the reader at the live `tools/list`, and the guard
 * asserts that ABSENCE instead. Do not read the paragraph above as covering
 * both; a copy of the tool registry here would be unguarded by construction.
 *
 * The guide / policy / MCP / CLI / sandbox pages are committed PROSE — authored
 * documentation rather than a registry, which is why they are allowed to live
 * here at all.
 */

/** The OpenAPI 3.1 document motir-core serves at `/api/openapi/v1.json`. */
export interface OpenApiDocument {
  openapi: string
  info: { title: string; version: string }
  paths: Record<
    string,
    Record<
      string,
      { summary?: string; description?: string; operationId?: string }
    >
  >
  components?: Record<string, unknown>
}

export interface ApiOperation {
  method: string
  path: string
  operationId?: string
  summary?: string
  description?: string
}

const SPEC_URL = `${APP_ORIGIN}/api/openapi/v1.json`

/** Fetch the published spec. Throws when the artifact is unreachable. */
export async function fetchOpenApiSpec(): Promise<OpenApiDocument> {
  const res = await fetch(SPEC_URL, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`openapi spec ${res.status}`)
  return (await res.json()) as OpenApiDocument
}

/** Flatten the spec's paths into an ordered operation list. */
export function listOperations(spec: OpenApiDocument): ApiOperation[] {
  const methods = ['get', 'post', 'patch', 'put', 'delete'] as const
  const out: ApiOperation[] = []
  for (const [path, byMethod] of Object.entries(spec.paths)) {
    for (const method of methods) {
      const op = byMethod[method]
      if (op) {
        out.push({
          method: method.toUpperCase(),
          path,
          operationId: op.operationId,
          summary: op.summary,
          description: op.description,
        })
      }
    }
  }
  return out.sort(
    (a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method),
  )
}
