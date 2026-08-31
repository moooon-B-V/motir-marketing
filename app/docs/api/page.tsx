import { fetchOpenApiSpec, listOperations } from '@/lib/docs'
import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'

/*
 * The API reference (MOTIR-4046) — generated from motir-core's PUBLISHED
 * OpenAPI document (`/api/openapi/v1.json`), fetched fresh so it never drifts
 * from the registry. A failed fetch renders the error state (the artifact is a
 * network hop).
 */
export const dynamic = 'force-dynamic'

export default async function ApiReferencePage() {
  let spec
  try {
    spec = await fetchOpenApiSpec()
  } catch {
    return (
      <>
        <DocsNav current="/docs/api" />
        <h1 className="font-(family-name:--font-serif) text-[30px] font-bold text-(--el-text)">
          {copy.docs.api}
        </h1>
        <p className="mt-4 text-[14px] text-(--el-text-secondary)">
          The API reference is temporarily unreachable. Please try again in a
          moment.
        </p>
      </>
    )
  }

  const operations = listOperations(spec)

  return (
    <>
      <DocsNav current="/docs/api" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.api}
      </h1>
      <p className="mt-2 text-[13px] text-(--el-text-secondary)">
        {spec.info.title} · version {spec.info.version}
      </p>

      <div className="mt-6 flex flex-col divide-y divide-(--el-border) border-y border-(--el-border)">
        {operations.map((op) => (
          <div key={`${op.method} ${op.path}`} className="py-3">
            <div className="flex items-baseline gap-3">
              <span className="rounded-(--radius-kbd) bg-(--el-tint-lavender) px-1.5 py-0.5 font-(family-name:--font-mono) text-[11px] font-semibold text-(--el-text-strong)">
                {op.method}
              </span>
              <code className="font-(family-name:--font-mono) text-[13px] text-(--el-text)">
                {op.path}
              </code>
            </div>
            <p className="mt-1 text-[13px] text-(--el-text-secondary)">
              {op.summary ?? op.description ?? ''}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
