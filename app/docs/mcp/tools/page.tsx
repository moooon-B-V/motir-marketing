import Link from 'next/link'
import {
  countCatalogueTools,
  fetchMcpToolCatalogue,
  type McpToolCatalogue,
} from '@/lib/docs'
import { copy } from '@/lib/copy'
import { DocsNav } from '../../_components/DocsNav'

/*
 * The MCP tool catalogue (MOTIR-4046 · MOTIR-4180 · MOTIR-4195) — RENDERED from
 * motir-core's PUBLISHED catalogue document, exactly as `/docs/api` renders the
 * published OpenAPI spec. Fetched fresh at request time; NOTHING about the tool
 * surface is written down in this repository.
 *
 * This page names no group and no tool of its own, and that is the same property
 * MOTIR-4180 established rather than a weaker version of it. Over in motir-core
 * the catalogue is DERIVED: a tool that reaches the registry without a gating
 * permission fails typecheck, which is what makes "a tool cannot reach the server
 * undocumented" true. A transcription here would break that chain — it would have
 * no reader over there to keep it honest, and nothing here could check it. So the
 * list arrives over the wire and lives in this file for the length of one render.
 * `tests/docs/docs.test.ts` still asserts this source names no tool, and it still
 * passes for the reason it always did: there is no list to find.
 *
 * ⚠️ NO FALLBACK, DELIBERATELY. A committed default rendered when the fetch fails
 * is the removed defect in its strongest form — stale precisely when it is
 * displayed, and unreachable by every guard, since a guard runs when the fetch
 * works. When the document is unreachable or is not the shape the parse reads,
 * `lib/docs.ts` throws and this page SAYS SO. A reader who is told the catalogue
 * is unavailable goes to the endpoint; a reader shown a quietly wrong list does
 * not.
 */
export const dynamic = 'force-dynamic'

export default async function McpToolsPage() {
  let catalogue: McpToolCatalogue
  try {
    catalogue = await fetchMcpToolCatalogue()
  } catch {
    return (
      <>
        <DocsNav current="/docs/mcp/tools" />
        <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
          {copy.docs.mcpTools}
        </h1>
        <p className="mt-4 text-[14px] text-(--el-text-secondary)">
          The tool catalogue is temporarily unreachable. The list this page
          renders is published by Motir itself and is never copied here, so
          there is nothing to show you in the meantime — open a{' '}
          <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
            tools/list
          </code>{' '}
          handshake against the endpoint, or try again in a moment.
        </p>
      </>
    )
  }

  const total = countCatalogueTools(catalogue)

  return (
    <>
      <DocsNav current="/docs/mcp/tools" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.mcpTools}
      </h1>
      <p className="mt-2 text-[13px] text-(--el-text-secondary)">
        {total} tools at{' '}
        <code className="font-(family-name:--font-mono)">
          {catalogue.endpoint}
        </code>
        , grouped by the permission that gates them
      </p>
      <p className="mt-4 max-w-[40rem] text-[14px] leading-relaxed text-(--el-text-secondary)">
        This list is fetched from Motir when the page is requested, so it is
        whatever the server ships right now. The authoritative surface is still
        the one the server answers with — a{' '}
        <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
          tools/list
        </code>{' '}
        handshake against{' '}
        <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
          {catalogue.endpoint}
        </code>
        , which carries each tool&apos;s full description. Which of these a
        given token may call depends on the grant it carries, so the list your
        client shows is already scoped to you.
      </p>

      {catalogue.groups.map((group) => (
        <section key={group.permission} className="mt-8">
          <h2 className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text)">
            {group.label}
          </h2>
          <p className="mt-1 max-w-[40rem] text-[13px] text-(--el-text-secondary)">
            {group.gates}
            {group.grantedByDefault ? ' · granted by default' : ''}
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-(--el-border) border-y border-(--el-border)">
            {group.tools.map((tool) => (
              <li key={tool.name} className="py-3">
                <code className="font-(family-name:--font-mono) text-[13px] text-(--el-text)">
                  {tool.name}
                </code>
                <p className="mt-1 text-[13px] text-(--el-text-secondary)">
                  {tool.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-8 text-[14px] text-(--el-text-secondary)">
        <Link
          href="/docs/mcp"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.mcp}
        </Link>{' '}
        covers wiring an agent to the endpoint and the token it needs.
      </p>
    </>
  )
}
