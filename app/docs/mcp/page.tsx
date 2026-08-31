import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'

/*
 * The MCP server overview (MOTIR-4046) — committed prose, matching motir-core's
 * published overview.
 */

export default function McpPage() {
  return (
    <>
      <DocsNav current="/docs/mcp" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.mcp}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          Motir exposes a Model Context Protocol server — one streamable-HTTP
          endpoint that AI agents and the CLI call to read and drive the
          project-management core. It is the same surface the hosted agents use
          to execute a plan.
        </p>
        <p>
          The endpoint is{' '}
          <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
            /api/mcp
          </code>
          , authenticated by a workspace-scoped token. Every tool is gated by a
          scope; the grant a token carries decides which tools it may call.
        </p>
      </div>
    </>
  )
}
