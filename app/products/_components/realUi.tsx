import {
  BookOpen,
  Bug,
  ChevronLeft,
  ChevronRight,
  Hand,
  ListChecks,
  SquareCheckBig,
  Zap,
} from 'lucide-react'
import { cn } from '@motir/design-system'

/*
 * What every real-UI mock on the product pages shares (2026-10 redesign): the
 * framed window a mock sits in — a picture, `aria-hidden` and `inert`, so
 * none of its controls can be reached — and the work-item kinds as the app
 * draws them (`IssueTypeIcon`'s icon and hue, `KIND_TINT`'s tile).
 */

export type Kind = 'epic' | 'story' | 'task' | 'bug' | 'subtask'
export const KIND_ICON = {
  epic: Zap,
  story: BookOpen,
  task: SquareCheckBig,
  bug: Bug,
  subtask: ListChecks,
} as const
/** `IssueTypeIcon`'s hue and `KIND_TINT`'s tile, per kind. */
export const KIND_ICON_COLOR: Record<Kind, string> = {
  epic: 'text-(--el-type-epic)',
  story: 'text-(--el-type-story)',
  task: 'text-(--el-type-task)',
  bug: 'text-(--el-type-bug)',
  subtask: 'text-(--el-type-subtask)',
}
export const KIND_TINT: Record<Kind, string> = {
  epic: 'bg-(--el-tint-rose)',
  story: 'bg-(--el-tint-mint)',
  task: 'bg-(--el-tint-sky)',
  bug: 'bg-(--el-tint-peach)',
  subtask: 'bg-(--el-tint-lavender)',
}

/** The app window the workspace opens in: a full-screen overlay, drawn framed. */
export function Frame({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div
      aria-hidden="true"
      inert
      data-surface="card"
      className={cn(
        'overflow-hidden rounded-(--radius-card) border border-(--el-border) bg-(--el-page-bg) text-(--el-text) shadow-(--shadow-modal)',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * The roadmap's breadcrumb row when a canvas is drilled into one work item
 * (`ProjectRoadmapCanvas`): Back, the Roadmap root, then that item — here an
 * epic — as the active crumb.
 */
export function LevelCrumbs({
  root,
  epic,
  back,
}: Readonly<{ root: string; epic: string; back: string }>) {
  const EpicIcon = KIND_ICON.epic
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-(--el-border-soft) bg-(--el-surface) px-2 text-sm">
      <span
        aria-hidden="true"
        className="inline-flex size-(--height-control) items-center justify-center rounded-(--radius-control) text-(--el-text-secondary)"
      >
        <ChevronLeft className="size-4" />
      </span>
      <span className="sr-only">{back}</span>
      <span className="text-(--el-text-secondary)">{root}</span>
      <ChevronRight
        aria-hidden="true"
        className="size-3.5 shrink-0 text-(--el-text-faint)"
      />
      <span className="flex min-w-0 items-center gap-1.5 font-semibold text-(--el-text)">
        <EpicIcon
          aria-hidden="true"
          className={cn('size-4 shrink-0', KIND_ICON_COLOR.epic)}
        />
        <span className="truncate">{epic}</span>
      </span>
    </div>
  )
}

/**
 * `WorkItemNode`'s Manual chip, on a node's id line: a person does this work
 * (a decision defaults to a human).
 */
export function ManualChip({ label }: Readonly<{ label: string }>) {
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-(--radius-badge) border border-(--el-border) bg-[color-mix(in_srgb,var(--el-type-manual)_18%,var(--el-page-bg))] px-1.5 text-[10.5px] font-medium text-(--el-text-strong)">
      <Hand className="size-3 text-(--el-type-manual)" />
      {label}
    </span>
  )
}
