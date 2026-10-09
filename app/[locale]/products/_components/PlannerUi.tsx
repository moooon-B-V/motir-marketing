import {
  Check,
  ChevronRight,
  Plus,
  SignalMedium,
  X,
  List,
  Workflow,
} from 'lucide-react'
import { BrandMark } from '@motir/brand'
import { Button, Pill, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import {
  Frame,
  KIND_ICON,
  KIND_ICON_COLOR,
  KIND_TINT,
  LevelCrumbs,
  ManualChip,
  type Kind,
} from './realUi'

/*
 * Motir AI Planner's pictures, drawn from the REAL planning workspace
 * (2026-10 redesign). The visitor pages on app.motir.co ask for a sign-in, so a
 * link cannot show a visitor the planner; these mocks show it instead. Each part
 * copies the markup of the shipped component it names in motir-core —
 * `PlanChangeRail` (the rail and its `Bubble`), `WorkItemCardShell` +
 * `PlanItemNode` (a proposed `add` card), `PlanningCanvas` (the pending
 * dependency edge and its arrowhead), `PlanningWorkspaceHost` and
 * `PlanChangeConfirmBar` (the overlay's Close bar and the Approve / Decline bar)
 * — with the same element tokens, so the mock follows the visitor's theme,
 * palette and style exactly as the app does. The design system's own `Button`
 * and `Pill` are the real components.
 *
 * A picture, not a control: each frame is `aria-hidden` and `inert`, so none of
 * its buttons can be reached; the copy beside it says what it shows.
 */

const u = copy.products.aiPlanner.ui

/** `PlanChangeRail`'s header: the live dot, the label and the mode chip. */
export function RailHeader({
  mode = u.modeFirstPlan,
}: Readonly<{ mode?: string }>) {
  return (
    <div className="flex items-center gap-2 border-b border-(--el-border-soft) px-4 py-3">
      <span className="size-2 rounded-full bg-(--el-success)" />
      <span className="font-mono text-xs font-semibold tracking-wide text-(--el-text-secondary) uppercase">
        {u.railLabel}
      </span>
      <Pill tone="neutral" className="ml-auto">
        {mode}
      </Pill>
    </div>
  )
}

/** `PlanChangeRail`'s `Bubble`. */
export function Bubble({
  role,
  tone,
  children,
}: Readonly<{
  role: string
  tone?: string
  children: React.ReactNode
}>) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex items-start gap-2', isUser && 'flex-row-reverse')}>
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
          isUser
            ? 'bg-(--el-muted) text-(--el-text-secondary)'
            : 'bg-(--el-accent) text-(--el-accent-text)',
        )}
      >
        {isUser ? '·' : <BrandMark variant="mark" tone="inverted" size={13} />}
      </span>
      <div
        className={cn(
          'min-w-0 rounded-(--radius-card) px-3 py-2 text-sm',
          isUser
            ? 'bg-(--el-chat-bubble-user) text-(--el-accent-text)'
            : tone === 'asking'
              ? 'bg-(--el-warning-surface) text-(--el-warning-text)'
              : 'bg-(--el-chat-bubble-ai) text-(--el-text)',
        )}
      >
        {tone === 'asking' ? (
          <span className="mb-0.5 flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide uppercase opacity-80">
            {u.asking}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  )
}

export function Composer() {
  return (
    <div className="border-t border-(--el-border) px-3 py-3">
      <div className="flex items-center gap-2 rounded-(--radius-input) border border-(--el-border) bg-(--el-page-bg) px-(--spacing-input-x) py-(--spacing-input-y) text-sm text-(--el-text-secondary)">
        <span className="flex-1">{u.composer}</span>
        <span className="flex size-7 items-center justify-center rounded-(--radius-control) bg-(--el-accent) text-(--el-accent-text)">
          <ChevronRight className="size-4" />
        </span>
      </div>
    </div>
  )
}

/** The hero picture: the planner asking until the "what" is clear. */
export function PlannerChatUi() {
  return (
    <Frame className="mx-auto w-full max-w-[520px]">
      <div className="flex flex-col bg-(--el-surface)">
        <RailHeader />
        <div className="flex flex-col gap-3 px-4 py-4">
          {u.chat.map((turn) => (
            <Bubble
              key={turn.text}
              role={turn.role}
              tone={'tone' in turn ? turn.tone : undefined}
            >
              {turn.text}
            </Bubble>
          ))}
        </div>
        <Composer />
      </div>
    </Frame>
  )
}

/** `WorkItemCardShell` in `PlanItemNode`'s pending `add` frame. */
function ProposedCard({
  kind,
  title,
  children,
  difficulty,
  manual,
}: Readonly<{
  kind: Kind
  title: string
  children?: boolean
  difficulty?: string
  manual?: boolean
}>) {
  const Icon = KIND_ICON[kind]
  return (
    <div className="relative flex h-[124px] w-[280px] flex-col overflow-hidden rounded-(--radius-card) border border-dashed border-(--el-accent) bg-(--el-tint-lavender) p-3.5 shadow-(--shadow-card)">
      <div className="flex shrink-0 items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-(--radius-badge) bg-(--el-surface) px-1.5 py-0.5 text-[11px] font-semibold text-(--el-accent-on-surface)">
          <Plus className="size-3" />
          {u.opAdd}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {children ? (
            <ChevronRight className="size-4 shrink-0 text-(--el-text-muted)" />
          ) : null}
          {difficulty ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-(--el-text-secondary)">
              <SignalMedium className="h-3 w-3 shrink-0 text-(--el-text-faint)" />
              {difficulty}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-1.5 flex min-h-0 flex-1 items-start gap-2 overflow-hidden">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-(--radius-control)',
            KIND_TINT[kind],
          )}
        >
          <Icon className={cn('size-4', KIND_ICON_COLOR[kind])} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-(--el-text-secondary)">
              {u.newItem}
            </span>
            {/* A person does this one — a decision defaults to a human — so it
                carries `WorkItemNode`'s Manual chip on the id line. */}
            {manual ? <ManualChip label={u.manual} /> : null}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-sm leading-snug font-semibold text-(--el-text)">
            {title}
          </span>
        </div>
      </div>
    </div>
  )
}

/*
 * The plan's level as `PlanReviewCanvas` lays it out: dependency rank decides
 * the column, so a blocker sits left of what it blocks, and every edge is
 * `PlanningCanvas`'s PENDING edge — the quiet dashed ink with its arrowhead,
 * pointing blocker → blocked.
 */
const NODE_W = 280
const NODE_H = 124
const COL = NODE_W + 96
const ROW = NODE_H + 56
const PLACE: ReadonlyArray<[number, number]> = [
  [0, 0], // Set a goal with a target date
  [1, 0], // Break a goal into weekly milestones — blocked by the goal
  [0, 1], // Decide which calendar to support
  [1, 1], // Connect a calendar — blocked by the calendar decision
  [2, 0.5], // Book the week's sessions — blocked by the milestones and the calendar
]
const EDGES: ReadonlyArray<[number, number]> = [
  [0, 1],
  [2, 3],
  [1, 4],
  [3, 4],
]
const WORLD_W = COL * 2 + NODE_W
const WORLD_H = ROW + NODE_H

function edgePath(from: number, to: number) {
  const [fc, fr] = PLACE[from]
  const [tc, tr] = PLACE[to]
  const sx = fc * COL + NODE_W
  const sy = fr * ROW + NODE_H / 2
  const tx = tc * COL
  const ty = tr * ROW + NODE_H / 2
  return `M${sx} ${sy} C${sx + 48} ${sy}, ${tx - 48} ${ty}, ${tx} ${ty}`
}

/*
 * The canvas is drilled into the epic being planned, so it carries the
 * roadmap's breadcrumb row; the cards are that epic's stories.
 */
function PlanCanvas() {
  const cards = u.cards as ReadonlyArray<{
    kind: Kind
    title: string
    children?: boolean
    difficulty?: string
    manual?: boolean
  }>
  return (
    <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden bg-(--el-canvas) px-6 py-8">
      <div style={{ zoom: 0.85 }}>
        <div className="relative" style={{ width: WORLD_W, height: WORLD_H }}>
          <svg
            className="absolute inset-0 overflow-visible"
            width={WORLD_W}
            height={WORLD_H}
            fill="none"
          >
            <defs>
              <marker
                id="mk-plan-pending"
                viewBox="0 0 10 10"
                refX="8.5"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path
                  d="M0 0L10 5L0 10z"
                  className="fill-(--el-canvas-edge-pending)"
                />
              </marker>
            </defs>
            {EDGES.map(([from, to]) => (
              <path
                key={`${from}-${to}`}
                d={edgePath(from, to)}
                className="stroke-(--el-canvas-edge-pending)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="2 7"
                markerEnd="url(#mk-plan-pending)"
              />
            ))}
          </svg>
          {cards.map((card, i) => (
            <div
              key={card.title}
              className="absolute"
              style={{ left: PLACE[i][0] * COL, top: PLACE[i][1] * ROW }}
            >
              <ProposedCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * The planning overlay with a plan waiting on you — `PlanningWorkspaceHost`'s
 * Close bar, the left pane's List | Canvas switch over the canvas and
 * `PlanChangeConfirmBar` (gated: the count, the consequence line, Decline,
 * Approve), and the conversation rail beside it.
 */
export function PlannerWorkspaceUi() {
  return (
    <Frame>
      <div className="flex items-center gap-3 border-b border-(--el-border-soft) bg-(--el-surface) px-4 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-(--radius-control) px-(--spacing-control-x) py-(--spacing-control-y) text-sm font-medium text-(--el-text-secondary)">
          <X className="size-4" />
          {u.close}
          <kbd className="ml-1 rounded-(--radius-kbd) border border-(--el-border) px-(--spacing-kbd-x) py-(--spacing-kbd-y) font-mono text-[0.6875rem] text-(--el-text-secondary)">
            {u.esc}
          </kbd>
        </span>
        <span className="truncate text-sm font-semibold text-(--el-text)">
          {u.project}
        </span>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col bg-(--el-canvas)">
          <div className="flex h-11 shrink-0 items-center border-b border-(--el-border) bg-(--el-surface) px-(--spacing-control-x)">
            <div className="inline-flex items-center gap-0.5 rounded-(--radius-btn) border border-(--el-border) bg-(--el-tabnav-track) p-0.5">
              <span className="inline-flex h-(--height-control) items-center gap-1.5 rounded-[calc(var(--radius-btn)-2px)] px-(--spacing-control-x) text-[13px] font-medium text-(--el-text-secondary)">
                <List className="size-3.5 text-(--el-text-faint)" />
                {u.list}
              </span>
              <span className="inline-flex h-(--height-control) items-center gap-1.5 rounded-[calc(var(--radius-btn)-2px)] bg-(--el-page-bg) px-(--spacing-control-x) text-[13px] font-medium text-(--el-text-strong) shadow-(--shadow-subtle)">
                <Workflow className="size-3.5 text-(--el-tabnav-active)" />
                {u.canvas}
              </span>
            </div>
          </div>
          <LevelCrumbs root={u.roadmap} epic={u.epic} back={u.back} />
          <PlanCanvas />
          <div className="flex shrink-0 items-center gap-3 border-t border-(--el-border) bg-(--el-surface) px-4 py-2.5">
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-(--el-text)">
                {u.barCounts}
              </span>
              <span className="text-xs text-(--el-text-secondary)">
                {u.consequence}
              </span>
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm">
                {u.decline}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="size-4" aria-hidden="true" />}
              >
                {u.approve}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-(--el-border) bg-(--el-surface)">
          <RailHeader mode={u.modeInContext} />
          <div className="flex flex-1 flex-col gap-3 px-4 py-4">
            {u.changeTurns.map((turn) => (
              <Bubble key={turn.text} role={turn.role}>
                {turn.text}
              </Bubble>
            ))}
          </div>
          <Composer />
        </div>
      </div>
    </Frame>
  )
}
