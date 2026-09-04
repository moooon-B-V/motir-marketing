import Link from 'next/link'
import {
  countCatalogueTools,
  describeSchema,
  fetchMcpToolCatalogue,
  type McpToolCatalogue,
  type McpToolEntry,
} from '@/lib/docs'
import { copy } from '@/lib/copy'
import { SchemaTable } from '../../../_components/DocSchema'

/*
 * The MCP tool catalogue (MOTIR-4046 · MOTIR-4180 · MOTIR-4195, WIDENED by
 * MOTIR-4394) — RENDERED from motir-core's PUBLISHED catalogue document,
 * exactly as `/docs/api` renders the published OpenAPI spec. Fetched fresh at
 * request time; NOTHING about the tool surface is written down here.
 *
 * This page names no group and no tool of its own, and that property is
 * unchanged by this card: the names arrive over the wire and live in this file
 * for the length of one render. `tests/docs/docs.test.ts` still asserts this
 * source names no tool, and still passes for the reason it always did — there
 * is no list to find. The argument NAMES are in the same position.
 *
 * ── What MOTIR-4394 added, and why it needed a card in the OTHER repo first ─
 * The page rendered 55 tool names with a permission and a one-line summary, and
 * it could not do better: the published artifact carried `name`, `permission`
 * and `summary` per tool and no `inputSchema`. So a reader was told a tool
 * exists and which grant gates it, and given no way to learn which arguments it
 * takes, which of them are required, or which are closed enums — the only
 * question they arrived with. MOTIR-4389 widened the artifact; this renders it.
 *
 * ⚠️ AND THAT PARAGRAPH NAMES NO TOOL, deliberately. `tests/docs/docs.test.ts`
 * detects a lowercase underscore-joined identifier anywhere in this file,
 * INCLUDING a comment, and that guard is right: this repository cannot check a
 * tool name it types, so it may not type one — not in a list, and not in an
 * example that later reads as one. (It caught this very comment twice while it
 * was being written, which is the guard earning its place.) The concrete
 * subject lives in the test fixture, where it is checked.
 *
 * ⚠️ AND IT IS WRITTEN SO EITHER MERGE ORDER IS SAFE. The two repositories
 * deploy independently, so between this page shipping and motir-core's deploy
 * landing the artifact carries no schemas at all. A page that required them
 * would go red on the ORDER of two merges, which nobody controls. It renders
 * the absence instead, and says which absence it is:
 *
 *   · no `inputSchema` on the row  ⇒ "arguments are not published by this
 *     Motir version" — a fact about the SERVER, not about the tool.
 *   · `inputSchema` with no properties ⇒ "takes no arguments" — a fact about
 *     the tool, and one a reader positively wants.
 *
 * Collapsing those two into one empty block is the failure this card exists to
 * fix, one level up: an empty rendering that reads as an answer.
 *
 * ⚠️ NO FALLBACK, DELIBERATELY. Unreachable or unreadable ⇒ this page SAYS SO.
 * A committed default is stale exactly when it is displayed.
 */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: copy.docs.metaTitleMcpTools,
  description: copy.docs.metaDescriptionMcpTools,
}

/** How deep the argument tables render — stated, as the producer states what it emits. */
function ToolArguments({ tool }: { tool: McpToolEntry }) {
  if (!tool.inputSchema) {
    return (
      <p className="mt-2 text-[13px] text-(--el-text-secondary)">
        This Motir version does not publish this tool&apos;s arguments. A{' '}
        <code className="font-(family-name:--font-mono)">tools/list</code>{' '}
        handshake against the endpoint carries them.
      </p>
    )
  }

  const fields = describeSchema(tool.inputSchema)
  if (fields.length === 0) {
    return (
      <p className="mt-2 text-[13px] text-(--el-text-secondary)">
        Takes no arguments.
      </p>
    )
  }

  return (
    <div className="mt-2">
      <SchemaTable schema={tool.inputSchema} labelledBy={`tool-${tool.name}`} />
    </div>
  )
}

export default async function McpToolsPage() {
  let catalogue: McpToolCatalogue
  try {
    catalogue = await fetchMcpToolCatalogue()
  } catch {
    return (
      <>
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
      <p className="mt-4 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        This list is fetched from Motir when the page is requested, so it is
        whatever the server ships right now. Each tool shows the arguments it
        takes — their names, their types and which are required — read from the
        same registry that answers a{' '}
        <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
          tools/list
        </code>{' '}
        handshake against{' '}
        <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
          {catalogue.endpoint}
        </code>
        , which is still the authoritative surface and carries each tool&apos;s
        full description. Which of these a given token may call depends on the
        grant it carries, so the list your client shows is already scoped to
        you.
      </p>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-relaxed text-(--el-text-secondary)">
        Argument tables render one level: a nested object or a list shows its
        type, and the handshake carries the shape inside it.
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
              <li key={tool.name} className="py-4">
                <code
                  id={`tool-${tool.name}`}
                  className="font-(family-name:--font-mono) text-[13px] text-(--el-text)"
                >
                  {tool.name}
                </code>
                <p className="mt-1 max-w-[68ch] text-[13px] text-(--el-text-secondary)">
                  {tool.summary}
                </p>
                <ToolArguments tool={tool} />
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
