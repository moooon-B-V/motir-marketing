import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'

/*
 * The sandbox guide (MOTIR-4046) — committed prose, matching motir-core's
 * published sandbox surface.
 */

export default function SandboxPage() {
  return (
    <>
      <DocsNav current="/docs/sandbox" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.sandbox}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          The hosted sandbox is where a dispatched agent runs work: one checkout
          per work item, a git worktree, and a locked-down environment that can
          read the plan but not reshape it.
        </p>
        <p>
          A sandboxed run carries a narrowed token grant — it can browse the
          project, edit its own work item, comment, and plan, but not author a
          plan or reach outside its repository.
        </p>
      </div>
    </>
  )
}
