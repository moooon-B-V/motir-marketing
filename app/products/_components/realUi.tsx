import { BookOpen, Bug, ListChecks, SquareCheckBig, Zap } from 'lucide-react'
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
