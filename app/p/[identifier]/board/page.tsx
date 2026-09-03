import type { Metadata } from 'next'
import Link from 'next/link'
import { loadBoard } from '@/lib/publicProject'
import { publicPathFor } from '@/lib/publicHost'
import { renderTabPage, tabMetadata } from '../_components/tabPage'
import { EmptyState, ErrorState } from '../_components/States'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string }>
}): Promise<Metadata> {
  const { identifier } = await params
  return tabMetadata({ identifier, segment: 'board', label: 'Board' })
}

/**
 * The BOARD tab (MOTIR-4116) — the project's default board, public projection.
 *
 * ⚠️ BOUNDED, NOT PAGED, and the UI must say so rather than imply completeness.
 * The endpoint stops at its own cap and reports `truncated`; there is no cursor
 * on this tab by design, because a board is a whole-shape read and the Items tab
 * beside it is the paged surface. A board that silently showed the first N of
 * many would be a lie a visitor cannot detect.
 */
export default async function BoardTab({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params

  return renderTabPage({
    identifier,
    current: 'board',
    body: async (_project, host) => {
      const read = await loadBoard(identifier)
      if (read.status !== 'ok') {
        return (
          <ErrorState what="this project's board" identifier={identifier} />
        )
      }

      const board = read.data
      if (board.columns.length === 0) {
        return (
          <EmptyState title="This project has no public board yet">
            Its work items may still be public — the Items tab is the list.
          </EmptyState>
        )
      }

      return (
        <>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {board.columns.map((column) => (
              <section
                key={column.id}
                aria-label={column.name}
                className="min-h-[13rem] rounded-(--radius-card) border border-(--el-border) bg-(--el-surface-soft) p-3"
              >
                <h2 className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[12px] font-bold tracking-wider text-(--el-text-secondary) uppercase">
                    {column.name}
                  </span>
                  <span className="text-[12px] text-(--el-text-secondary)">
                    {column.totalCount}
                  </span>
                </h2>
                {column.cards.map((card) => (
                  <Link
                    key={card.id}
                    href={publicPathFor(
                      host,
                      identifier,
                      `items/${encodeURIComponent(card.identifier)}`,
                    )}
                    className="mb-2 block rounded-(--radius-control) border border-(--el-border) bg-(--el-page-bg) p-2.5 shadow-(--shadow-subtle) hover:border-(--el-border-strong)"
                  >
                    <span className="font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)">
                      {card.identifier}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-(--el-text)">
                      {card.title}
                    </span>
                    {card.childrenHidden ? (
                      <span className="mt-1.5 block text-[11px] text-(--el-text-secondary)">
                        Children are not public.
                      </span>
                    ) : null}
                  </Link>
                ))}
              </section>
            ))}
          </div>

          {board.truncated ? (
            <p className="mt-4 text-[13px] text-(--el-text-secondary)">
              Showing the first {board.cap} cards on this board. The Items tab
              lists every public work item, a page at a time.
            </p>
          ) : null}
        </>
      )
    },
  })
}
