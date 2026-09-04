import type { Metadata } from 'next'
import Link from 'next/link'
import { loadChangelog, pagedTabHref } from '@/lib/publicProject'
import { publicPathFor } from '@/lib/publicHost'
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
  return tabMetadata({ identifier, segment: 'changelog', label: 'Changelog' })
}

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/**
 * The CHANGELOG tab (MOTIR-4116) — what shipped, newest first, cursor-paged.
 *
 * The Atom feed beside it is MOTIR-4118's route; this tab links to it because
 * the feed is the anonymous follower tier and the one thing on this surface that
 * survives the API being unreachable.
 */
export default async function ChangelogTab({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>
  searchParams: Promise<{ cursor?: string | string[] }>
}) {
  const { identifier } = await params
  const raw = (await searchParams).cursor
  const cursor = Array.isArray(raw) ? raw[0] : raw

  return renderTabPage({
    identifier,
    current: 'changelog',
    body: async (_project, host) => {
      const read = await loadChangelog(identifier, cursor)
      if (read.status !== 'ok') {
        return (
          <ErrorState what="this project's changelog" identifier={identifier} />
        )
      }

      const page = read.data
      if (page.entries.length === 0) {
        return (
          <EmptyState title="Nothing shipped yet">
            When this project completes public work, it is logged here — and in
            the feed.
          </EmptyState>
        )
      }

      return (
        <>
          <ul className="mt-5 border-t border-(--el-border)">
            {page.entries.map((entry) => (
              <li
                key={entry.identifier}
                className="flex items-baseline gap-3 border-b border-(--el-border) py-3"
              >
                <time
                  dateTime={entry.shippedAt}
                  className="w-[6.5rem] flex-none font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)"
                >
                  {DATE.format(new Date(entry.shippedAt))}
                </time>
                <span className="min-w-0 flex-1">
                  <Link
                    href={publicPathFor(
                      host,
                      identifier,
                      `items/${encodeURIComponent(entry.identifier)}`,
                    )}
                    className="text-[14px] font-medium text-(--el-text) hover:text-(--el-link)"
                  >
                    {entry.title}
                  </Link>
                  {entry.epic ? (
                    <span className="mt-1 block text-[12px] text-(--el-text-secondary)">
                      {entry.epic.title}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          {page.nextCursor ? (
            <MoreLink
              href={pagedTabHref(host, identifier, 'changelog', {
                cursor: page.nextCursor,
              })}
              label="Older"
            />
          ) : null}

          <p className="mt-5 text-[13px]">
            {/* A plain `<a>` — `changelog.xml` is a route handler, so a
                `next/link` prefetches it and takes a 404 (MOTIR-4372, and see
                `ActRail`). */}
            <a
              href={publicPathFor(host, identifier, 'changelog.xml')}
              className="text-(--el-link) underline underline-offset-2"
            >
              Subscribe by Atom
            </a>
          </p>
        </>
      )
    },
  })
}
