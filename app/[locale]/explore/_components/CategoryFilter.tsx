import Link from 'next/link'
import { Tag, X } from 'lucide-react'
import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import {
  buildExploreHref,
  type ExploreQuery,
  type ProjectCategoryDto,
} from '@/lib/explore'

/*
 * The category / topic filter chips (MOTIR-4045). Each chip is a real `<a>`
 * that sets / clears `?category=` (composing with rank + search, resetting the
 * cursor). The selected chip gets the lavender tint + an `x` clear affordance.
 */

const CHIP_BASE =
  'inline-flex items-center gap-1.5 rounded-(--radius-badge) border px-(--spacing-chip-x) py-(--spacing-chip-y) text-[13px] font-medium'

export function CategoryFilter({
  basePath,
  query,
  categories,
}: {
  basePath: string
  query: ExploreQuery
  categories: ProjectCategoryDto[]
}) {
  const active = query.category
  const top = categories.slice(0, 6)
  if (active && !top.some((c) => c.slug === active)) {
    const found = categories.find((c) => c.slug === active)
    top.unshift(found ?? { slug: active, label: active, projectCount: 0 })
  }

  return (
    <div
      role="group"
      aria-label={copy.explore.topicFilterAria}
      className="flex flex-wrap items-center gap-1.5"
    >
      <Link
        href={buildExploreHref(basePath, query, { category: null })}
        aria-pressed={!active}
        className={cn(
          CHIP_BASE,
          !active
            ? 'border-(--el-border-soft) bg-(--el-tint-lavender) text-(--el-text-strong)'
            : 'border-(--el-border-soft) bg-(--el-surface) text-(--el-text-secondary) hover:border-(--el-border)',
        )}
      >
        {copy.explore.allTopics}
      </Link>
      {top.map((cat) => {
        const isActive = cat.slug === active
        return (
          <Link
            key={cat.slug}
            href={buildExploreHref(basePath, query, {
              category: isActive ? null : cat.slug,
            })}
            aria-pressed={isActive}
            className={cn(
              CHIP_BASE,
              isActive
                ? 'border-(--el-border-soft) bg-(--el-tint-lavender) text-(--el-text-strong)'
                : 'border-(--el-border-soft) bg-(--el-surface) text-(--el-text-secondary) hover:border-(--el-border)',
            )}
          >
            <Tag className="h-3 w-3" aria-hidden />
            {cat.label}
            {isActive ? <X className="h-3 w-3" aria-hidden /> : null}
          </Link>
        )
      })}
    </div>
  )
}
