import type { Metadata } from 'next'
import { loadItems, pagedTabHref } from '@/lib/publicProject'
import { renderTabPage, tabMetadata } from '../_components/tabPage'
import { EmptyState, ErrorState } from '../_components/States'
import { MoreLink, WorkItemRow } from '../_components/Rows'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  return tabMetadata({ identifier, segment: 'items', label: 'Work items' })
}

/**
 * The ITEMS tab (MOTIR-4116) — every public work item, cursor-paged.
 *
 * ⚠️ THE PAGER IS A REAL URL (`?cursor=…`), so it works with JavaScript
 * disabled — the `/explore` precedent, and the reason this page is crawlable
 * past its first screen at all.
 */
export default async function ItemsTab({
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
    current: 'items',
    body: async (_project, host) => {
      const read = await loadItems(identifier, cursor)
      if (read.status !== 'ok') {
        return (
          <ErrorState
            what="this project's work items"
            identifier={identifier}
          />
        )
      }

      const page = read.data
      if (page.items.length === 0) {
        return (
          <EmptyState title="No public work items yet">
            This project has published its overview but not its work. When items
            are made public they appear here.
          </EmptyState>
        )
      }

      return (
        <>
          <ul className="mt-5 border-t border-(--el-border)">
            {page.items.map((item) => (
              <WorkItemRow
                key={item.id}
                identifier={identifier}
                item={item}
                host={host}
              />
            ))}
          </ul>
          {page.nextCursor ? (
            <MoreLink
              href={pagedTabHref(host, identifier, 'items', {
                cursor: page.nextCursor,
              })}
              label="Load more"
            />
          ) : null}
        </>
      )
    },
  })
}
