import { APP_ORIGIN } from '@/lib/appOrigin'

/**
 * The `/docs` data layer (MOTIR-4046).
 *
 * The API reference is GENERATED from `motir-core`'s own registry, and it is
 * PUBLISHED as a served, versioned OpenAPI 3.1 document at
 * `/api/openapi/v1.json` — assembled from compile-time declarations, never a
 * hand-maintained file. This repository consumes that published artifact rather
 * than copying a spec that would drift: the reference page fetches it fresh, so
 * it is always exactly what motir-core serves. The guide / policy / MCP / CLI /
 * sandbox prose is committed (it is authored documentation, not a registry),
 * and a drift guard test re-fetches the live spec to prove the consumed artifact
 * is still the published one.
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
