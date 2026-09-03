import Link from 'next/link'
import type { PublicWorkItemDto } from '@/lib/publicProject'
import { publicPathFor, type PublicHost } from '@/lib/publicHost'

/**
 * The shared list primitives the tabs compose from (MOTIR-4116) — one status
 * pill and one work-item row, so five tabs cannot drift into five treatments of
 * the same thing.
 */

const TONE: Record<string, string> = {
  done: 'bg-(--el-tint-mint) text-(--el-text-strong)',
  in_progress: 'bg-(--el-tint-sky) text-(--el-text-strong)',
  todo: 'border border-(--el-border) bg-(--el-surface) text-(--el-text-secondary)',
}

export function StatusPill({
  status,
  category,
}: {
  status: string
  category: string
}) {
  const tone = TONE[category] ?? TONE['todo']
  return (
    <span
      className={`rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[11px] leading-normal whitespace-nowrap ${tone}`}
    >
      {status}
    </span>
  )
}

/**
 * One work-item row, linking to its public detail page.
 *
 * ⚠️ THE `childrenHidden` MARKER IS RENDERED, not silently dropped. It is set
 * only on a PRIVATE epic seen by a non-member, and its descendants are already
 * excluded server-side — so the honest thing is to say the row is there and its
 * children are not, rather than show an epic that looks empty.
 */
export function WorkItemRow({
  identifier,
  item,
  host,
}: {
  identifier: string
  item: PublicWorkItemDto
  host: PublicHost
}) {
  return (
    <li className="flex items-baseline gap-3 border-b border-(--el-border) py-3">
      <span className="w-[6.5rem] flex-none font-(family-name:--font-mono) text-[11px] font-medium text-(--el-text-secondary)">
        {item.identifier}
      </span>
      <span className="min-w-0 flex-1 text-[14px] text-(--el-text)">
        <Link
          href={publicPathFor(
            host,
            identifier,
            `items/${encodeURIComponent(item.identifier)}`,
          )}
          className="hover:text-(--el-link) hover:underline hover:underline-offset-2"
        >
          {item.title}
        </Link>
        {item.childrenHidden ? (
          <span className="mt-0.5 block text-[12px] text-(--el-text-secondary)">
            Children are not public.
          </span>
        ) : null}
      </span>
      <StatusPill status={item.status} category={item.statusCategory} />
    </li>
  )
}

/**
 * The no-JS pager — a real `<a href>`, following
 * `app/explore/_components/Gallery.tsx`.
 *
 * A "Load more" that needs JavaScript is a page a crawler cannot walk past the
 * first screen and a reader cannot link to. This whole surface exists to be
 * crawled, so its flat lists page by URL.
 */
export function MoreLink({ href, label }: { href: string; label: string }) {
  return (
    <p className="mt-5">
      <Link
        href={href}
        rel="next"
        className="inline-flex h-(--height-btn-sm) items-center rounded-(--radius-btn) border border-(--el-border-strong) px-3 text-[13px] font-medium text-(--el-text) hover:bg-(--el-surface-soft)"
      >
        {label}
      </Link>
    </p>
  )
}
