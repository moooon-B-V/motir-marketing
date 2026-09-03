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
 * THE MCP TOOL REGISTRY IS NOW THE SAME SHAPE (MOTIR-4194 / MOTIR-4195).
 * motir-core publishes the tool catalogue as an anonymous, unversioned
 * documentation artifact at `/api/docs/mcp-tools.json` — derived from the same
 * permission registry that gates the tools, so a tool cannot reach the server
 * undocumented. This module consumes it exactly as it consumes the spec: fetched
 * fresh at request time, parsed through a function a fixture pins, and nothing
 * committed. MOTIR-4180 removed a hand-copied list from this repository because
 * nothing here could check it; what replaced it is not a checked copy but no copy
 * at all.
 *
 * ⚠️ NEITHER READER HAS A FALLBACK, AND THAT IS THE DESIGN. A committed default
 * rendered when the fetch fails is stale exactly when it is displayed and
 * invisible exactly when it is wrong — every guard in this repository runs on the
 * path where the fetch WORKS. Both readers throw instead, and both pages say the
 * artifact is unreachable rather than showing something that looks like an
 * answer.
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

// ── The MCP tool catalogue (MOTIR-4195) ─────────────────────────────────────
//
// `GET /api/docs/mcp-tools.json` on the app origin — motir-core's
// `lib/apiDocs/mcp.ts`, served by `app/api/docs/mcp-tools.json/route.ts`. Every
// field below is DERIVED over there: the group order is the permission catalog's
// own, a tool's group is the permission that gates it, and the count is computed
// from the rows. Nothing about the tool set is authored in this repository.
//
// ⚠️ WHAT THE PRODUCER PROMISES, AND WHAT IT DOES NOT. It is unversioned on
// purpose: a consumer may rely on the path and on the field names, and must
// tolerate the tool set, the summaries, the labels, the group membership and the
// count changing without notice — and must tolerate NEW fields appearing. So the
// parse below validates the fields this page renders and ignores every other,
// which is what lets motir-core add one without turning this page red.

/** One tool row of the published catalogue. */
export interface McpToolEntry {
  name: string
  permission: string
  summary: string
}

/** One group — a permission, and the tools it gates. */
export interface McpToolGroup {
  permission: string
  label: string
  gates: string
  grantedByDefault: boolean
  tools: McpToolEntry[]
}

/** The published catalogue document. */
export interface McpToolCatalogue {
  endpoint: string
  toolCount: number
  groups: McpToolGroup[]
}

const CATALOGUE_URL = `${APP_ORIGIN}/api/docs/mcp-tools.json`

/** Thrown when the served document is not the shape this page renders. */
export class McpToolCatalogueShapeError extends Error {
  override readonly name = 'McpToolCatalogueShapeError'

  constructor(what: string) {
    super(
      `the published MCP tool catalogue at ${CATALOGUE_URL} ${what}. ` +
        `This page renders that document and keeps no copy of it, so a shape ` +
        `it cannot read is an error rather than an empty list.`,
    )
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(
  holder: Record<string, unknown>,
  key: string,
  where: string,
): string {
  const value = holder[key]
  if (typeof value !== 'string' || value === '') {
    throw new McpToolCatalogueShapeError(`is missing ${where}.${key}`)
  }
  return value
}

/**
 * Parse the served document into what the page renders.
 *
 * ⚠️ IT THROWS RATHER THAN DEGRADING, on every axis. A parse that skipped a
 * malformed group, or read a renamed `groups` key as absent, would render a page
 * that looks finished and is short — and nothing downstream could tell that from
 * a genuinely smaller tool surface. `tests/docs/docs.test.ts` pins it against a
 * fixture in both directions: the shape motir-core serves today, and each way it
 * could stop being that shape.
 *
 * An EMPTY `groups` is an error too, deliberately. motir-core drops groups that
 * gate no tool and its catalogue is total over the registry by typecheck, so zero
 * groups is not a smaller answer — it is the failure this whole card exists to
 * make impossible to render quietly.
 */
export function parseMcpToolCatalogue(value: unknown): McpToolCatalogue {
  if (!isRecord(value)) {
    throw new McpToolCatalogueShapeError('is not a JSON object')
  }
  const endpoint = requireString(value, 'endpoint', 'the document')
  if (typeof value.toolCount !== 'number') {
    throw new McpToolCatalogueShapeError('is missing the document.toolCount')
  }
  if (!Array.isArray(value.groups)) {
    throw new McpToolCatalogueShapeError('is missing the document.groups')
  }
  if (value.groups.length === 0) {
    throw new McpToolCatalogueShapeError('carries no groups')
  }

  const groups = value.groups.map((raw, index) => {
    const where = `groups[${index}]`
    if (!isRecord(raw))
      throw new McpToolCatalogueShapeError(
        `has a ${where} that is not an object`,
      )
    if (typeof raw.grantedByDefault !== 'boolean') {
      throw new McpToolCatalogueShapeError(
        `is missing ${where}.grantedByDefault`,
      )
    }
    if (!Array.isArray(raw.tools)) {
      throw new McpToolCatalogueShapeError(`is missing ${where}.tools`)
    }
    return {
      permission: requireString(raw, 'permission', where),
      label: requireString(raw, 'label', where),
      gates: requireString(raw, 'gates', where),
      grantedByDefault: raw.grantedByDefault,
      tools: raw.tools.map((entry, position) => {
        const at = `${where}.tools[${position}]`
        if (!isRecord(entry)) {
          throw new McpToolCatalogueShapeError(
            `has a ${at} that is not an object`,
          )
        }
        return {
          name: requireString(entry, 'name', at),
          permission: requireString(entry, 'permission', at),
          summary: requireString(entry, 'summary', at),
        }
      }),
    }
  })

  return { endpoint, toolCount: value.toolCount, groups }
}

/** Fetch the published catalogue. Throws when the artifact is unreachable. */
export async function fetchMcpToolCatalogue(): Promise<McpToolCatalogue> {
  const res = await fetch(CATALOGUE_URL, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`mcp tool catalogue ${res.status}`)
  return parseMcpToolCatalogue(await res.json())
}

/**
 * How many tools the catalogue carries, counted from the rows this page is about
 * to render — never the served `toolCount`. The producer computes that field the
 * same way and the two agree; counting here is what makes it impossible for the
 * number a reader sees to disagree with the list beneath it.
 */
export function countCatalogueTools(catalogue: McpToolCatalogue): number {
  return catalogue.groups.reduce(
    (total, group) => total + group.tools.length,
    0,
  )
}
