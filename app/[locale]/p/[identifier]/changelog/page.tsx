import type { Metadata } from 'next'
import {
  dateLocaleFor,
  loadChangelog,
  pagedTabHref,
  visitorViewUrl,
} from '@/lib/publicProject'
import { getCopy } from '@/lib/copy'
import { enterLocale } from '@/i18n/locale'
import { publicPathFor } from '@/lib/publicHost'
import { renderTabPage, tabMetadata } from '../_components/tabPage'
import { EmptyState, ErrorState } from '../_components/States'
import { MoreLink } from '../_components/Rows'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  return tabMetadata({
    locale: await enterLocale(params),
    identifier,
    segment: 'changelog',
    labelKey: 'changelog',
  })
}

/** The entry date, in the page's locale — `9 Oct 2026` in English. */
function dateFormat(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(dateLocaleFor(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

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
  params: Promise<{ locale?: string; identifier: string }>
  searchParams: Promise<{ cursor?: string | string[] }>
}) {
  const { identifier } = await params
  const locale = await enterLocale(params)
  const copy = (await getCopy(locale)).publicProject
  const DATE = dateFormat(locale)
  const raw = (await searchParams).cursor
  const cursor = Array.isArray(raw) ? raw[0] : raw

  return renderTabPage({
    identifier,
    locale,
    current: 'changelog',
    body: async (_project, host) => {
      const read = await loadChangelog(identifier, cursor)
      if (read.status !== 'ok') {
        return (
          <ErrorState
            title={copy.states.error.changelog}
            identifier={identifier}
          />
        )
      }

      const page = read.data
      if (page.entries.length === 0) {
        return (
          <EmptyState title={copy.changelog.empty.title}>
            {copy.changelog.empty.body}
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
                  {/* A plain `<a>` straight into the app (MOTIR-6745): the
                      item page on this host is a redirect now (MOTIR-6743),
                      and a cross-origin `next/link` would be prefetched. */}
                  <a
                    href={visitorViewUrl(identifier, 'items', entry.identifier)}
                    className="text-[14px] font-medium text-(--el-text) hover:text-(--el-link)"
                  >
                    {entry.title}
                  </a>
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
              label={copy.changelog.older}
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
              {copy.changelog.subscribeAtom}
            </a>
          </p>
        </>
      )
    },
  })
}
