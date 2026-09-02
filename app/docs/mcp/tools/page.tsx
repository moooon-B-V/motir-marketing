import Link from 'next/link'
import { copy } from '@/lib/copy'
import { DocsNav } from '../../_components/DocsNav'

/*
 * The MCP tool catalogue (MOTIR-4046, corrected by MOTIR-4180) — PROSE ONLY.
 *
 * This page deliberately names NO tools. In motir-core the catalogue is DERIVED:
 * a tool that reaches `MCP_TOOL_NAMES` without an entry in `TOOL_PERMISSIONS`
 * fails typecheck, which is what makes "a tool cannot reach the server
 * undocumented" true. Transcribing any part of that registry into this
 * repository breaks the chain — the copy has no reader in motir-core to keep it
 * honest and nothing here can check it, because motir-core publishes no
 * catalogue artifact and `/api/mcp` answers 401 to an anonymous caller, so no
 * guard in this repo can read the live list. A copy that does not exist cannot
 * drift; `tests/docs/docs.test.ts` asserts this file stays that way.
 *
 * If motir-core ever publishes the catalogue the way it publishes
 * `/api/openapi/v1.json`, this page renders THAT through `lib/docs.ts`, exactly
 * as `/docs/api` renders the spec — never a committed list.
 */

export default function McpToolsPage() {
  return (
    <>
      <DocsNav current="/docs/mcp/tools" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.mcpTools}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          The tool catalogue is not published as a document. The authoritative,
          complete list is the one the server itself answers with: open a{' '}
          <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
            tools/list
          </code>{' '}
          handshake against{' '}
          <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
            /api/mcp
          </code>{' '}
          with a workspace token, or read the tool list your MCP client shows
          once it is connected. Every tool arrives with its own description
          there, which is the same text the server gates and meters.
        </p>
        <p>
          This page names no tools on purpose. Motir&apos;s tool surface is
          derived from the permission registry rather than written down twice,
          so any list reproduced here would be a second copy with nothing to
          keep it honest — and the first rename or retirement would leave it
          quietly wrong. What decides which tools a given token may call is the
          grant it carries, so the list you see is already scoped to you.
        </p>
        <p>
          <Link
            href="/docs/mcp"
            className="text-(--el-accent-on-surface) underline underline-offset-2"
          >
            {copy.docs.mcp}
          </Link>{' '}
          covers wiring an agent to the endpoint and the token it needs.
        </p>
      </div>
    </>
  )
}
