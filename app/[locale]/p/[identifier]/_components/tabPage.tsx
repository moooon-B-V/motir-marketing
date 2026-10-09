import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadProject, type PublicProjectOverviewDto } from '@/lib/publicProject'
import {
  publicUrlFor,
  redirectIfNotPrimary,
  requestPublicHost,
  type PublicHost,
} from '@/lib/publicHost'
import { englishCopy, format, getCopy } from '@/lib/copy'
import type { Locale } from '@/i18n/routing'
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
 * the rows and the tab bar synchronous and therefore testable.
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
  locale,
  current,
  body,
}: {
  identifier: string
  /** The page's locale, for the shell's own words (MOTIR-7954). */
  locale: Locale
  current: string
  body: (
    project: PublicProjectOverviewDto,
    host: PublicHost,
  ) => Promise<React.ReactNode>
}) {
  const host = await requestPublicHost()
  const read = await loadProject(identifier)
  if (read.status === 'not-found') notFound()
  if (read.status === 'failed') {
    const copy = (await getCopy(locale)).publicProject
    return <ErrorState title={copy.states.error.project} host={host} />
  }

  const project = read.data

  // ⚠️ ONE CALL, IN THE SHELL, SO EVERY TAB INHERITS IT (MOTIR-4222). A project
  // now answers at several addresses and exactly one of them is canonical; a
  // request on any other lands here and is carried to it. Placed AFTER the read
  // because the primary is a property of the project — and after the 404 arm,
  // because a project that does not exist has no address to be redirected to.
  await redirectIfNotPrimary(project, host, current)
  return (
    <>
      <ProjectHeader project={project} current={current} host={host} />
      {await body(project, host)}
    </>
  )
}

/**
 * Each tab's canonical: its OWN path on the project's PRIMARY address, with no
 * paging cursor (MOTIR-4222; it named `SITE_ORIGIN` before).
 */
export async function tabMetadata({
  identifier,
  segment,
  labelKey,
}: {
  identifier: string
  segment: string
  /** A `publicProject.tabs` key — English until MOTIR-7956 localises metadata. */
  labelKey: keyof typeof englishCopy.publicProject.tabs
}): Promise<Metadata> {
  const meta = englishCopy.publicProject.meta
  const label = englishCopy.publicProject.tabs[labelKey]
  const read = await loadProject(identifier)
  if (read.status !== 'ok') return {}
  const project = read.data
  // ⚠️ THE CURSOR IS DROPPED. Deep pages of one list are the same document to a
  // crawler, so they consolidate onto page one — the rule `/explore` already
  // follows for its own cursor.
  // ⚠️ `metadataBase` stays `SITE_ORIGIN` and is not consulted here: an
  // ABSOLUTE canonical overrides it, which is the only way one document served
  // at three hosts can name one address.
  const url = publicUrlFor(project, segment)
  return {
    title: format(meta.tabTitle, { label, name: project.name }),
    description: format(meta.tabDescription, { label, name: project.name }),
    alternates: { canonical: url },
    openGraph: { type: 'website', url, siteName: 'Motir' },
  }
}
