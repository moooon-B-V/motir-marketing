import type { Metadata } from 'next'
import Link from 'next/link'
import { loadTreeLevel, pagedTabHref } from '@/lib/publicProject'
import { renderTabPage, tabMetadata } from '../_components/tabPage'
import { EmptyState, ErrorState } from '../_components/States'
import { MoreLink, StatusPill } from '../_components/Rows'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  return tabMetadata({ identifier, segment: 'tree', label: 'Tree' })
}

/**
 * The TREE tab (MOTIR-4116) — the work-item hierarchy, ONE LEVEL AT A TIME.
 *
 * ⚠️ EXPANSION IS A NAVIGATION, NOT A CLIENT ISLAND, and that is the decision
 * this tab makes. The card says to draw the interactive line where the design
 * draws it and to say which side each control is on; this control is on the
 * NO-JS side, and here is why:
 *
 *   • the endpoint is offset-paged per level, so a level is addressable by
 *     `?parentId=&offset=` with no client state to keep;
 *   • a tree whose expansion lives only in JavaScript is a tree a crawler sees
 *     one level of — and this surface exists to be crawled;
 *   • a shared link to a deep node then works, which a client-only tree cannot
 *     offer without inventing its own URL model anyway.
 *
 * The cost, stated: expanding is a page load rather than an in-place reveal.
 * That is the right trade for a public, crawlable, read-only tree; it would be
 * the wrong one inside the application, where the authed tree is a client
 * island for exactly the opposite reason.
 */
export default async function TreeTab({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>
  searchParams: Promise<{
    parentId?: string | string[]
    offset?: string | string[]
  }>
}) {
  const { identifier } = await params
  const sp = await searchParams
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v
  const parentId = one(sp.parentId)
  const offsetRaw = Number(one(sp.offset))
  const offset = Number.isInteger(offsetRaw) && offsetRaw > 0 ? offsetRaw : 0

  return renderTabPage({
    identifier,
    current: 'tree',
    body: async () => {
      const read = await loadTreeLevel(identifier, {
        ...(parentId ? { parentId } : {}),
        ...(offset ? { offset } : {}),
      })
      if (read.status !== 'ok') {
        return <ErrorState what="this project's tree" identifier={identifier} />
      }

      const level = read.data
      if (level.rows.length === 0) {
        return (
          <EmptyState title="Nothing to show at this level">
            {parentId
              ? 'This item has no public children.'
              : 'This project has no public work items yet.'}
          </EmptyState>
        )
      }

      return (
        <>
          {parentId ? (
            <p className="mt-5 text-[13px]">
              <Link
                href={pagedTabHref(identifier, 'tree', {})}
                className="text-(--el-text-secondary) hover:text-(--el-link)"
              >
                ← Back to the top level
              </Link>
            </p>
          ) : null}

          <ul className="mt-5">
            {level.rows.map((row) => (
              <li
                key={row.id}
                className="flex items-baseline gap-2.5 border-b border-(--el-border-soft) py-2"
              >
                <span className="w-3.5 flex-none text-[11px] text-(--el-text-secondary)">
                  {row.hasChildren ? '▸' : ''}
                </span>
                <span className="w-[6.5rem] flex-none font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)">
                  {row.identifier}
                </span>
                <span className="min-w-0 flex-1 text-[14px] text-(--el-text)">
                  {row.hasChildren ? (
                    <Link
                      href={pagedTabHref(identifier, 'tree', {
                        parentId: row.id,
                      })}
                      className="hover:text-(--el-link) hover:underline hover:underline-offset-2"
                    >
                      {row.title}
                    </Link>
                  ) : (
                    <Link
                      href={`/p/${encodeURIComponent(identifier)}/items/${encodeURIComponent(row.identifier)}`}
                      className="hover:text-(--el-link) hover:underline hover:underline-offset-2"
                    >
                      {row.title}
                    </Link>
                  )}
                  {row.childrenHidden ? (
                    <span className="mt-0.5 block text-[12px] text-(--el-text-secondary)">
                      Children are not public.
                    </span>
                  ) : null}
                </span>
                <StatusPill status={row.status} category={row.statusCategory} />
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[13px] text-(--el-text-secondary)">
            Showing {offset + level.rows.length} of {level.total}
          </p>

          {level.hasMore ? (
            <MoreLink
              href={pagedTabHref(identifier, 'tree', {
                parentId,
                offset: String(offset + level.rows.length),
              })}
              label="Load more at this level"
            />
          ) : null}
        </>
      )
    },
  })
}
