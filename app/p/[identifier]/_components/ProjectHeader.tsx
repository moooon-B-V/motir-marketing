import Link from 'next/link'
import {
  PROJECT_TABS,
  projectTabHref,
  type PublicProjectOverviewDto,
} from '@/lib/publicProject'
import { SITE_HOST, type PublicHost } from '@/lib/publicHost'
import { ActRail } from './ActRail'

/**
 * The project HERO and the TAB BAR (MOTIR-4115) — panel 1 of
 * `design/public-projects/`.
 *
 * Composed by every `/p/*` screen from the subject read it has already made, so
 * a tab renders the hero and its own body from ONE API call.
 *
 * ⚠️ THERE IS NO ACCOUNT MENU AND NO EDIT AFFORDANCE HERE, by decision rather
 * than omission. `public-surface-hosts.md` AMENDMENT 4 row 1 makes the account
 * menu ABSENT (a cross-origin page cannot compute who is looking) and row 7
 * makes in-place overview editing ABSENT (it lives in the application, where the
 * author already signs in). `viewerCanManage` is structurally `false` on this
 * host, so a branch on it would be drawing a state that cannot occur.
 */
export function ProjectHeader({
  project,
  current,
  host = SITE_HOST,
}: {
  project: PublicProjectOverviewDto
  /** The tab segment that is current — `''` for the Overview. */
  current: string
  /**
   * The address this request arrived on (MOTIR-4220). Defaulted to the site,
   * which is what an unrouted request already is — so the shipped behaviour is
   * the default rather than a case.
   */
  host?: PublicHost
}) {
  // The act rail returns the visitor to the tab they were on, not to the
  // project root — a hand-off that dropped you somewhere else would be a worse
  // round trip than no round trip.
  //
  // ⚠️ BUILT FROM `SITE_HOST`, NOT FROM `host`, ON EVERY HOST. The hand-off
  // prefixes this with `SITE_ORIGIN`, so a host-relative path would become
  // `motir.co/board` — a URL that does not exist. `actHref`'s note carries the
  // reasoning and the consequence.
  const returnPath = projectTabHref(SITE_HOST, project.identifier, current)
  const { identifier, name, workspaceName, publicTagline, publicTags, stats } =
    project

  return (
    <header>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[13px] text-(--el-text-secondary)">
            {workspaceName}
          </p>
          <h1 className="mt-1 font-(family-name:--font-serif) text-[30px] leading-tight font-bold tracking-[-0.01em] text-(--el-text)">
            {name}
          </h1>
          {publicTagline ? (
            <p className="mt-2 max-w-[44rem] text-[15px] leading-[1.55] text-(--el-text-secondary)">
              {publicTagline}
            </p>
          ) : null}
          {publicTags.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {publicTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-(--radius-badge) border border-(--el-border) bg-(--el-surface) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[12px] leading-snug text-(--el-text-secondary)"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* The four stat figures the design puts opposite the name. `dl` rather
            than a list of divs: each is a term and its value. */}
        <dl className="flex gap-[22px]">
          <Stat n={stats.publicRequests} k="requests" />
          <Stat n={stats.upvotes} k="upvotes" />
          <Stat n={stats.planned} k="planned" />
          <Stat n={stats.shipped} k="shipped" />
        </dl>
      </div>

      <ActRail identifier={identifier} returnPath={returnPath} host={host} />

      {/* ⚠️ SCROLLS, never wraps. Six short labels; a wrapped row would push the
          content down by a line on every project whose window is narrow, which
          the design's narrow panel (16) settles. */}
      <nav
        aria-label="Project"
        className="mt-6 flex gap-0.5 overflow-x-auto border-b border-(--el-border)"
      >
        {PROJECT_TABS.map((tab) => {
          const isCurrent = tab.segment === current
          return (
            <Link
              key={tab.segment || 'overview'}
              href={projectTabHref(host, identifier, tab.segment)}
              aria-current={isCurrent ? 'page' : undefined}
              className={
                isCurrent
                  ? 'border-b-2 border-(--el-accent) px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-(--el-text)'
                  : 'border-b-2 border-transparent px-3 py-2.5 text-[13px] font-medium whitespace-nowrap text-(--el-text-secondary) hover:text-(--el-text)'
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

function Stat({ n, k }: { n: number; k: string }) {
  return (
    <div className="text-right">
      <dd className="text-[20px] leading-[1.1] font-bold text-(--el-text)">
        {n.toLocaleString('en')}
      </dd>
      <dt className="mt-0.5 text-[12px] text-(--el-text-muted)">{k}</dt>
    </div>
  )
}
