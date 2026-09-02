import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { siteUrl } from '@/lib/siteOrigin'
import { deriveDescription, loadProject } from '@/lib/publicProject'
import { MarkdownBody } from '@/app/legal/_components/MarkdownBody'
import { ProjectHeader } from './_components/ProjectHeader'
import { EmptyState, ErrorState } from './_components/States'
import { ProjectJsonLd } from './_components/JsonLd'

/**
 * `motir.co/p/<identifier>` — the public project OVERVIEW (MOTIR-4115), built to
 * `design/public-projects/` panel 1.
 *
 * This is the route that makes every card on `/explore` resolve: the directory
 * has been linking `href="/p/<identifier>"` in production while both hosts
 * answered 404.
 *
 * ⚠️ DYNAMIC. A public project page shows a live board, a live changelog and
 * live counts; a copy frozen at build time would serve a project's state as it
 * was when this site last deployed. `lib/publicProject.ts` reads with
 * `revalidate: 0` for the same reason.
 */
export const dynamic = 'force-dynamic'

const FALLBACK_DESCRIPTION =
  'A public project plan on Motir — work items, boards and a roadmap, free to read with no sign-up.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  const read = await loadProject(identifier)
  // No metadata for a project that is not there, and none invented for one we
  // could not reach: a canonical emitted during an outage would be indexed.
  if (read.status !== 'ok') return {}

  const project = read.data
  const url = siteUrl(`/p/${encodeURIComponent(project.identifier)}`)
  const description = deriveDescription(
    project.publicTagline ?? project.publicOverviewMd,
    FALLBACK_DESCRIPTION,
  )

  return {
    title: `${project.name} · ${project.identifier}`,
    description,
    // ⚠️ SITE_ORIGIN, never APP_ORIGIN. This host owns the canonical now — the
    // whole point of the move — and `lib/siteOrigin.ts` is the one module that
    // answers "where is the public site?". Getting this backwards is silent in
    // production and asserted against in the suite.
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${project.name} · ${project.identifier}`,
      description,
      siteName: 'Motir',
    },
  }
}

export default async function PublicProjectOverviewPage({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params
  const read = await loadProject(identifier)

  // ⚠️ THREE OUTCOMES, and the two failures are NOT the same thing.
  //
  // `not-found` is the API saying the project does not exist or is not public:
  // a real 404, which a crawler must see so it drops the link. `failed` is the
  // API not answering: the project may well exist, and telling a visitor it was
  // deleted every time motir-core restarts is the worse direction — a 404 is a
  // statement about the world, an error is a statement about us.
  if (read.status === 'not-found') notFound()
  if (read.status === 'failed') {
    return <ErrorState what="this project" />
  }

  const project = read.data

  return (
    <>
      <ProjectJsonLd project={project} />
      <ProjectHeader project={project} current="" />

      {project.publicOverviewMd ? (
        <div className="mt-7 max-w-[46rem]">
          <MarkdownBody value={project.publicOverviewMd} />
        </div>
      ) : (
        <EmptyState title="This project has not written an overview yet">
          Its board, work items and roadmap are still public — the tabs above
          are where the work is.
        </EmptyState>
      )}
    </>
  )
}
