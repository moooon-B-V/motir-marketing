import { copy } from '@/lib/copy'
import { DocsNav } from '../../_components/DocsNav'

/*
 * The stability & deprecation policy (MOTIR-4046) — committed prose, matching
 * motir-core's published policy.
 */

export default function StabilityPage() {
  return (
    <>
      <DocsNav current="/docs/api/stability" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.apiStability}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          The public read API is versioned. The contract version travels in the
          served OpenAPI document&apos;s{' '}
          <code className="font-(family-name:--font-mono) text-[13px]">
            info.version
          </code>{' '}
          field, and a change that breaks a client is a version bump, not a
          silent edit.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong className="text-(--el-text-strong)">
              Additive changes
            </strong>{' '}
            — a new endpoint, a new optional field — ship without a version
            bump.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">
              Breaking changes
            </strong>{' '}
            — a removed field, a changed response shape, a renamed path — ship
            only in a new major version.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">Deprecation</strong> —
            an endpoint marked deprecated keeps working for one version before
            it is removed.
          </li>
        </ul>
      </div>
    </>
  )
}
