import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'

/*
 * The CLI guide (MOTIR-4046) — committed prose, matching motir-core's published
 * CLI surface.
 */

export default function CliPage() {
  return (
    <>
      <DocsNav current="/docs/cli" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.cli}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          The Motir CLI talks to the same MCP server the hosted agents use. It
          automates the planning-and-execution loop —{' '}
          <code className="font-(family-name:--font-mono) text-[13px]">
            motir plan
          </code>
          ,{' '}
          <code className="font-(family-name:--font-mono) text-[13px]">
            motir run
          </code>
          ,{' '}
          <code className="font-(family-name:--font-mono) text-[13px]">
            motir next
          </code>{' '}
          — over a workspace-scoped token.
        </p>
        <p>
          A run claims the next ready work item, fetches the server-generated
          prompt, and dispatches an agent in a sandbox to execute it. The card
          is the system of record; the CLI is the driver.
        </p>
      </div>
    </>
  )
}
