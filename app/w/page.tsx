import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, ArrowRight } from 'lucide-react'
import { SiteShell } from '@/app/_components/SiteShell'
import { EmptyState, ErrorState } from '@/app/p/[identifier]/_components/States'
import { resolveHost } from '@/lib/hostResolution'
import { publicPathFor, requestPublicHost } from '@/lib/publicHost'

/**
 * THE WORKSPACE ROOT (Story MOTIR-3878 · MOTIR-4220) — what `acme.motir.site/`
 * answers: that workspace's public projects.
 *
 * ── ⚠️ THE HOST IS NOT IN THE PATH, AND THAT IS THE DECISION ─────────────
 *
 * The card offers `app/w/[hostname]/page.tsx`. This is `app/w/page.tsx`,
 * because the host already travels in the request header `proxy.ts` sets and
 * OVERWRITES — putting it in the path as well would be a second copy of the
 * same fact that a visitor could make disagree with the first, by asking for
 * `/w/someone-elses-host` on `motir.co`. There is exactly one authority for
 * which host this request arrived on, and it is the router.
 *
 * The route is still reachable directly (`motir.co/w`), so it says so: a
 * request that did not come through the router is not a workspace, and it 404s.
 *
 * ── ⚠️ NO NEW DESIGN ASSET, AND THE NOTES WERE READ BEFORE CONCLUDING IT ──
 *
 * The card says one is not needed "for a list of the shipped project cards; if
 * the design card's notes say otherwise, stop and read them". Both were read.
 * `design/projects/` (MOTIR-4211) draws the settings pane a customer configures
 * an address FROM — a motir-core surface, not this one — and
 * `design/public-projects/design-notes.md`'s panel table and its ⚠️ Planning
 * flags name no workspace-list screen and record "no other deferral". So this
 * screen invents nothing: the chrome is `SiteShell`, the card is
 * `app/explore/_components/Gallery.tsx`'s square with the two fields this
 * contract actually carries, and the empty and error states are the `/p/*`
 * components rather than second treatments of the same two states.
 *
 * ⚠️ AND THE CARD IS DELIBERATELY THINNER THAN `/explore`'s. The host contract
 * answers `{ identifier, name }` per project and nothing else — no description,
 * no upvote count, no last activity. Drawing the explore square's stat row here
 * would mean either a second API call per project or four dashes where the
 * numbers go, and a stat that is always `—` is worse than no stat.
 */

export const metadata: Metadata = {
  title: 'Public projects',
  description: 'The public projects this workspace publishes on Motir.',
}

export default async function WorkspaceRootPage() {
  const host = await requestPublicHost()

  // Not routed here by the proxy — `motir.co/w` is not a workspace.
  if (host.kind !== 'workspace' || !host.host) notFound()

  const read = await resolveHost(host.host)
  if (read.status === 'not-found') notFound()
  if (read.status === 'failed') {
    return (
      <SiteShell
        host={host}
        contentClassName="mx-auto w-full max-w-[72rem] px-6 py-10"
      >
        <ErrorState what="this workspace’s projects" />
      </SiteShell>
    )
  }
  // The router resolved this host as a workspace one request ago. A different
  // kind here means the address changed mid-flight, which is a 404 rather than
  // a page drawing a shape it was not given.
  if (read.data.kind !== 'workspace') notFound()

  const { workspace, projects } = read.data

  return (
    <SiteShell
      host={host}
      contentClassName="mx-auto w-full max-w-[72rem] px-6 py-10"
    >
      <header>
        <p className="flex items-center gap-1.5 text-[13px] text-(--el-text-secondary)">
          <Building2 className="h-3.5 w-3.5 flex-none" aria-hidden />
          {workspace.name}
        </p>
        <h1 className="mt-1 font-(family-name:--font-serif) text-[30px] leading-tight font-bold tracking-[-0.01em] text-(--el-text)">
          Public projects
        </h1>
      </header>

      {projects.length === 0 ? (
        <EmptyState title="Nothing is public here yet">
          This workspace has claimed its address but has not made a project
          public. When it does, the project appears here.
        </EmptyState>
      ) : (
        <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.identifier} className="min-w-0">
              <Link
                href={publicPathFor(host, project.identifier)}
                className="group flex h-full min-w-0 flex-col rounded-(--radius-card) border border-(--el-border) bg-(--el-surface) p-(--spacing-card-padding) shadow-(--shadow-card) transition-shadow hover:border-(--el-border-strong) hover:shadow-(--shadow-elevated)"
              >
                <span className="font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)">
                  {project.identifier}
                </span>
                <span className="mt-1.5 truncate text-[15px] font-bold text-(--el-text)">
                  {project.name}
                </span>
                <ArrowRight
                  className="mt-auto ml-auto h-4 w-4 text-(--el-text-faint) transition-colors group-hover:text-(--el-link)"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SiteShell>
  )
}
