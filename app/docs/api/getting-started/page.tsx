import { copy } from '@/lib/copy'
import { DocsNav } from '../../_components/DocsNav'

/*
 * The getting-started guide (MOTIR-4046) — committed prose, matching
 * motir-core's published five-step path.
 */

export default function GettingStartedPage() {
  return (
    <>
      <DocsNav current="/docs/api/getting-started" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.apiGettingStarted}
      </h1>
      <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          The public read API is anonymous — every read endpoint returns project
          data without a sign-in, which is what lets the project square work for
          a logged-out visitor. Here is the path from nothing to your first
          request.
        </p>
        <ol className="list-decimal space-y-4 pl-6">
          <li>
            <strong className="text-(--el-text-strong)">
              Pick your origin.
            </strong>{' '}
            The API is served from the application host. Every path below is
            relative to it.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">
              Read the reference.
            </strong>{' '}
            The API reference lists every endpoint, its parameters and its
            status codes, generated from the served OpenAPI document.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">
              Make an anonymous read.
            </strong>{' '}
            <code className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px]">
              GET /api/public/explore
            </code>{' '}
            returns the public project square with no token.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">
              Sign in for writes.
            </strong>{' '}
            Account-bound operations carry a bearer token; reads stay open.
          </li>
          <li>
            <strong className="text-(--el-text-strong)">
              Respect the contract version.
            </strong>{' '}
            Breaking changes bump the version — see Stability &amp; deprecation.
          </li>
        </ol>
      </div>
    </>
  )
}
