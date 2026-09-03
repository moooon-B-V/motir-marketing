import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ROADMAP_BUCKETS,
  actHref,
  loadRoadmap,
  loadRoadmapColumn,
  pagedTabHref,
  type PublicRoadmapColumnDto,
} from '@/lib/publicProject'
import { publicPathFor, SITE_HOST } from '@/lib/publicHost'
import { renderTabPage, tabMetadata } from '../_components/tabPage'
import { EmptyState, ErrorState } from '../_components/States'
import { MoreLink } from '../_components/Rows'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  return tabMetadata({ identifier, segment: 'roadmap', label: 'Roadmap' })
}

/**
 * The ROADMAP tab (MOTIR-4116) — four demand-ordered buckets, each paging
 * independently.
 *
 * ⚠️ THE VOTE IS A HAND-OFF, added by MOTIR-4119 (AMENDMENT 4 row 4). It is a
 * LINK to `app.motir.co/act`, not a button that posts: `sameSite: 'lax'` means a
 * cross-origin write from this host carries no credential, so there is nothing
 * to post to. The COUNT renders anonymously and never shows a voted state,
 * because `actorUserId` is structurally null here (row 8).
 *
 * ⚠️ ONE COLUMN'S FAILURE MUST NOT BLANK THE PAGE. The card asks for that in
 * terms. Paging a column is a navigation carrying `?bucket=&cursor=`, and when
 * that read fails only that column renders its error; the other three are
 * whatever the tab read returned.
 */
export default async function RoadmapTab({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>
  searchParams: Promise<{
    bucket?: string | string[]
    cursor?: string | string[]
  }>
}) {
  const { identifier } = await params
  const sp = await searchParams
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v
  const bucketParam = one(sp.bucket)
  const cursorParam = one(sp.cursor)

  return renderTabPage({
    identifier,
    current: 'roadmap',
    body: async (_project, host) => {
      const read = await loadRoadmap(identifier)
      if (read.status !== 'ok') {
        return (
          <ErrorState what="this project's roadmap" identifier={identifier} />
        )
      }

      const columns = read.data.columns
      if (columns.every((c) => c.totalCount === 0)) {
        return (
          <EmptyState title="Nothing on the roadmap yet">
            When this project plans or ships something public, it appears here —
            ordered by how many people asked for it.
          </EmptyState>
        )
      }

      // ⚠️ BOTH parameters or neither. The endpoint refuses a bucket with no
      // cursor (`MISSING_ROADMAP_CURSOR`) rather than restarting at the top, so
      // a half-specified URL is simply not a page request.
      const paged =
        bucketParam && cursorParam
          ? await loadRoadmapColumn(
              identifier,
              bucketParam as PublicRoadmapColumnDto['key'],
              cursorParam,
            )
          : null

      return (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ROADMAP_BUCKETS.map(({ key, label }) => {
            const column = columns.find((c) => c.key === key)
            const isPagedOne = paged !== null && bucketParam === key
            // Only the column being paged shows a paging failure; the rest are
            // untouched by it.
            const failedHere = isPagedOne && paged.status !== 'ok'
            const cards =
              isPagedOne && paged.status === 'ok'
                ? paged.data.cards
                : (column?.cards ?? [])
            const nextCursor =
              isPagedOne && paged.status === 'ok'
                ? paged.data.nextCursor
                : (column?.nextCursor ?? null)

            return (
              <section
                key={key}
                aria-label={label}
                className="min-h-[13rem] rounded-(--radius-card) border border-(--el-border) bg-(--el-surface-soft) p-3"
              >
                <h2 className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[12px] font-bold tracking-wider text-(--el-text-secondary) uppercase">
                    {label}
                  </span>
                  <span className="text-[12px] text-(--el-text-secondary)">
                    {column?.totalCount ?? 0}
                  </span>
                </h2>

                {failedHere ? (
                  <p
                    role="alert"
                    className="rounded-(--radius-control) bg-(--el-tint-peach) p-2.5 text-[12px] leading-snug text-(--el-text-secondary)"
                  >
                    This column could not load. The rest of the roadmap is
                    below.
                  </p>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className="mb-2 rounded-(--radius-control) border border-(--el-border) bg-(--el-page-bg) p-2.5 shadow-(--shadow-subtle)"
                    >
                      <span className="font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)">
                        {card.identifier}
                      </span>
                      <Link
                        href={publicPathFor(
                          host,
                          identifier,
                          `requests/${encodeURIComponent(card.identifier)}`,
                        )}
                        className="mt-0.5 block text-[13px] leading-snug text-(--el-text) hover:text-(--el-link)"
                      >
                        {card.title}
                      </Link>
                      {/* Row 4 — the VOTE, a hand-off (MOTIR-4119). A LINK,
                          because `sameSite: 'lax'` means a cross-origin write
                          from here carries no credential at all. It never reads
                          "voted": `actorUserId` is structurally null on this
                          host, so the page cannot know (row 8). */}
                      <Link
                        href={actHref(
                          'vote',
                          identifier,
                          // ⚠️ `SITE_HOST`, on every host — the hand-off
                          // prefixes this with `SITE_ORIGIN`, so a
                          // host-relative return is a URL that does not exist.
                          // `actHref`'s note carries the reasoning.
                          publicPathFor(SITE_HOST, identifier, 'roadmap'),
                        )}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-(--radius-badge) border border-(--el-border-strong) bg-(--el-page-bg) px-2 py-0.5 text-[12px] text-(--el-text-secondary) hover:border-(--el-accent) hover:text-(--el-text)"
                      >
                        <span aria-hidden className="text-[10px]">
                          ▲
                        </span>
                        {card.voteCount}
                        <span className="sr-only">
                          {' '}
                          upvotes — vote on app.motir.co
                        </span>
                        <span aria-hidden className="text-[10px] opacity-80">
                          ↗
                        </span>
                      </Link>
                    </div>
                  ))
                )}

                {nextCursor && !failedHere ? (
                  <MoreLink
                    href={pagedTabHref(host, identifier, 'roadmap', {
                      bucket: key,
                      cursor: nextCursor,
                    })}
                    label="Load more"
                  />
                ) : null}
              </section>
            )
          })}
        </div>
      )
    },
  })
}
