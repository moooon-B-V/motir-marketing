import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { actHref, loadProject } from '@/lib/publicProject'
import {
  publicPathFor,
  publicUrlFor,
  redirectIfNotPrimary,
  requestPublicHost,
  SITE_HOST,
} from '@/lib/publicHost'
import { ProjectHeader } from '../../_components/ProjectHeader'
import { ErrorState } from '../../_components/States'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  const read = await loadProject(identifier)
  if (read.status !== 'ok') return {}
  const url = publicUrlFor(read.data, 'requests/new')
  return {
    title: `Request a feature · ${read.data.name}`,
    description: `Ask the ${read.data.name} team for something. Requests are public.`,
    alternates: { canonical: url },
    // ⚠️ NOT INDEXED. This page is a doorway with no content of its own; a
    // crawler that indexed it would rank a hand-off above the roadmap it hands
    // off from.
    robots: { index: false, follow: true },
  }
}

/**
 * THE REQUEST INTAKE (MOTIR-4117) — and it is a HAND-OFF, not a form.
 *
 * ⚠️ THE CARD ASSUMED THIS FLOW WAS ANONYMOUS AND IT IS NOT. MOTIR-4117 says
 * "Both endpoints are anonymous today (`getSession` is not called in either), so
 * this flow works for a logged-out visitor with no cross-origin session question
 * at all — build it, and confirm that reading rather than assuming it." Read on
 * `origin/main`, both call `requireCompliantSession()` and both 401 a logged-out
 * caller — the submit's own header says "sign-in-to-act", and the duplicate
 * pre-check carries the same gate. The same measurement error is recorded in
 * `public-surface-hosts.md` AMENDMENT 4 §A and filed as MOTIR-4166.
 *
 * So this page cannot be the form the card describes, and the reason it is not
 * even a PARTIAL form is worth stating: the duplicate-suggestion step is gated
 * too, so a visitor typing a title here would get no candidates and then be sent
 * to sign in, losing the draft. Canny — the mirror AMENDMENT 4 row 6 follows —
 * identifies the visitor FIRST for exactly this reason. Handing off before the
 * form is the honest shape, not a reduced one.
 *
 * The route exists rather than being deleted because it is a real address:
 * `/explore`, the roadmap and the request detail all want somewhere to point,
 * and a doorway that explains what is about to happen is better than a raw
 * cross-origin link a visitor cannot preview.
 */
export default async function RequestIntakePage({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params
  const host = await requestPublicHost()
  const read = await loadProject(identifier)

  if (read.status === 'not-found') notFound()
  if (read.status === 'failed')
    return <ErrorState what="this project" host={host} />

  const project = read.data
  await redirectIfNotPrimary(project, host, 'requests/new')

  // ⚠️ TWO PATHS TO THE SAME TAB, AND THEY ARE NOT INTERCHANGEABLE — one
  // variable used to serve both, which was correct only while `motir.co` was
  // the sole host.
  //
  //   • the BACK LINK stays on this host, so it is host-relative;
  //   • the HAND-OFF's return is prefixed with `SITE_ORIGIN` by `actHref`, so
  //     it must be the SITE path or the round trip lands on a URL that does not
  //     exist (`motir.co/roadmap`). `actHref`'s note carries the reasoning.
  const roadmapHref = publicPathFor(host, identifier, 'roadmap')
  const returnPath = publicPathFor(SITE_HOST, identifier, 'roadmap')

  return (
    <>
      <ProjectHeader project={project} current="roadmap" host={host} />

      <div className="mt-6 max-w-[38rem]">
        <p className="mb-5 text-[13px]">
          <Link
            href={roadmapHref}
            className="text-(--el-text-secondary) hover:text-(--el-link)"
          >
            ← {project.name} · Roadmap
          </Link>
        </p>

        <h2 className="font-(family-name:--font-serif) text-[24px] leading-tight font-bold text-(--el-text)">
          Request a feature
        </h2>
        <p className="mt-2.5 text-[14px] leading-[1.6] text-(--el-text-secondary)">
          Tell the {project.name} team what you need. Requests are public:
          anyone reading this project can see and upvote yours.
        </p>

        <div className="mt-6 rounded-(--radius-card) border border-(--el-border) bg-(--el-surface-soft) p-5">
          <h3 className="text-[14px] font-semibold text-(--el-text)">
            You will sign in first
          </h3>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-(--el-text-secondary)">
            Submitting a request needs an account, so the form lives on{' '}
            <strong className="text-(--el-text)">app.motir.co</strong>. You will
            be signed in, shown anything similar that has already been asked for
            — so you can upvote it instead — and brought back to this project.
          </p>
          <p className="mt-4">
            <Link
              href={actHref('request', identifier, returnPath)}
              className="inline-flex h-(--height-btn-md) items-center rounded-(--radius-btn) bg-(--el-accent) px-4 text-[13px] font-medium text-(--el-accent-text) hover:bg-(--el-accent-pressed)"
            >
              Continue to Motir ↗
            </Link>
          </p>
        </div>

        <p className="mt-5 text-[13px] text-(--el-text-secondary)">
          Reading this project needs no account at all — the{' '}
          <Link href={returnPath} className="text-(--el-link) hover:underline">
            roadmap
          </Link>{' '}
          and every tab above are open to everyone.
        </p>
      </div>
    </>
  )
}
