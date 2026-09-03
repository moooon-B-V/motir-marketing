import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { siteUrl } from '@/lib/siteOrigin'
import { loadProject, type PublicProjectOverviewDto } from '@/lib/publicProject'
import { requestPublicHost, type PublicHost } from '@/lib/publicHost'
import { ProjectHeader } from './ProjectHeader'
import { ErrorState } from './States'

/**
 * The shape every tab route shares (MOTIR-4116): resolve the project, dispose
 * of the three outcomes, render the shell, then render the tab's own body.
 *
 * ⚠️ THE PROJECT READ IS THE TAB'S TOO. A tab needs the hero, so it makes the
 * subject read itself and hands the result to `ProjectHeader` — one API call for
 * the shell rather than one in a layout plus one in the page.
 *
 * ⚠️ THE HOST IS READ HERE, ONCE (MOTIR-4220). This is the async component at
 * the top of every tab route, so it is the one place per request that can ask
 * `headers()` — everything below takes it as a parameter, which is what keeps
 * `WorkItemRow` and the tab bar synchronous and therefore testable.
 * `lib/publicHost.ts`'s header carries the full argument.
 *
 * ⚠️ AND THE TAB'S OWN READ FAILING IS NOT THE PROJECT FAILING. The project read
 * decides 404-vs-error for the PAGE; a tab whose own endpoint is unreachable
 * still renders the hero and the tab bar, with the error state in the body. A
 * roadmap column that fails must not blank the page — the card asks for that in
 * terms, and this is where it is arranged.
 */

export async function renderTabPage({
  identifier,
  current,
  body,
}: {
  identifier: string
  current: string
  body: (
    project: PublicProjectOverviewDto,
    host: PublicHost,
  ) => Promise<React.ReactNode>
}) {
  const host = await requestPublicHost()
  const read = await loadProject(identifier)
  if (read.status === 'not-found') notFound()
  if (read.status === 'failed')
    return <ErrorState what="this project" host={host} />

  const project = read.data
  return (
    <>
      <ProjectHeader project={project} current={current} host={host} />
      {await body(project, host)}
    </>
  )
}

/** Each tab's canonical: its OWN path on SITE_ORIGIN, with no paging cursor. */
export async function tabMetadata({
  identifier,
  segment,
  label,
}: {
  identifier: string
  segment: string
  label: string
}): Promise<Metadata> {
  const read = await loadProject(identifier)
  if (read.status !== 'ok') return {}
  const project = read.data
  // ⚠️ THE CURSOR IS DROPPED. Deep pages of one list are the same document to a
  // crawler, so they consolidate onto page one — the rule `/explore` already
  // follows for its own cursor.
  const url = siteUrl(`/p/${encodeURIComponent(project.identifier)}/${segment}`)
  return {
    title: `${label} · ${project.name}`,
    description: `${label} for ${project.name} — public on Motir.`,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, siteName: 'Motir' },
  }
}
