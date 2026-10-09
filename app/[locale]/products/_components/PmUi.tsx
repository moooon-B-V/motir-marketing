import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  CircleDashed,
  CircleDot,
  CircleEllipsis,
  CirclePlay,
  CircleX,
  GitPullRequest,
  Hand,
  Hash,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Stamp,
  Video,
} from 'lucide-react'
import { Button, Pill, cn } from '@motir/design-system'
import { useCopy, type Copy } from '@/lib/copy'
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
 * Motir Project Management's pictures, drawn from the REAL screens (2026-10
 * redesign): the board (`boards/_view.tsx`, `BoardColumn`, `BoardCard` with
 * its exclusive pill slot and `CiStateBadge`), the approvals list
 * (`ApprovalRow`) and the roadmap canvas (`WorkItemCardShell` in its
 * committed, ready and done frames, `WorkItemStatusPill`, and
 * `PlanningCanvas`'s committed and pending edges). Same markup, same element
 * tokens, the design system's own `Button` and `Pill` — so each mock follows
 * the visitor's theme, palette and style as the app does.
 */

type CardData = {
  kind: string
  key: string
  title: string
  pill: string
  points: number
  who: string
  ci?: string
}

/** `BoardCard`'s exclusive slot: awaiting you › Blocked › priority. */
function CardPill({ pill }: Readonly<{ pill: string }>) {
  const u = useCopy().products.projectManagement.ui
  const label = u.pill[pill as keyof typeof u.pill]
  if (pill === 'awaiting')
    return (
      <Pill tone="awaiting" className="shrink-0">
        <Stamp className="h-3 w-3 shrink-0" />
        {label}
      </Pill>
    )
  if (pill === 'blocked')
    return (
      <Pill severity="warning">
        <CircleAlert className="h-3 w-3" />
        {label}
      </Pill>
    )
  const Icon = pill === 'high' ? ArrowUp : pill === 'low' ? ArrowDown : Minus
  return (
    <Pill priority={pill as 'high' | 'medium' | 'low'}>
      <Icon className="h-3 w-3" />
      {label}
    </Pill>
  )
}

function BoardCard({ card }: Readonly<{ card: CardData }>) {
  const u = useCopy().products.projectManagement.ui
  const Icon = KIND_ICON[card.kind as Kind]
  return (
    <div className="flex w-full flex-col gap-2 rounded-(--radius-card) border border-(--el-border) bg-(--el-page-bg) p-(--spacing-card-padding) text-left shadow-(--shadow-subtle)">
      <span className="flex items-center gap-1.5">
        <Icon
          className={cn('h-4 w-4 shrink-0', KIND_ICON_COLOR[card.kind as Kind])}
        />
        <span className="font-mono text-xs text-(--el-text-muted)">
          {card.key}
        </span>
      </span>
      <span className="line-clamp-2 text-[13.5px] leading-snug text-(--el-text)">
        {card.title}
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        <CardPill pill={card.pill} />
        {card.ci === 'failing' ? (
          <Pill severity="danger" className="shrink-0 whitespace-nowrap">
            <CircleX className="h-3 w-3" />
            {u.pill.failing}
          </Pill>
        ) : card.ci === 'running' ? (
          <Pill severity="warning" className="shrink-0 whitespace-nowrap">
            <CircleEllipsis className="h-3 w-3" />
            {u.pill.running}
          </Pill>
        ) : null}
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-(--el-text-secondary)">
          <Hash className="h-3 w-3 shrink-0 text-(--el-text-faint)" />
          {card.points}
        </span>
        <span className="flex-1" />
        {card.who === '–' ? (
          <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-dashed border-(--el-border-strong) bg-(--el-muted) text-[10px] font-semibold text-(--el-text-faint)">
            –
          </span>
        ) : (
          <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-(--el-text) text-[10px] font-semibold text-(--el-text-inverted)">
            {card.who}
          </span>
        )}
      </span>
    </div>
  )
}

/** The board page: its header and a row of `BoardColumn`s. */
export function BoardUi({
  columns,
  header = true,
}: Readonly<{
  columns?: ReadonlyArray<{ name: string; cards: ReadonlyArray<CardData> }>
  header?: boolean
}>) {
  const u = useCopy().products.projectManagement.ui
  const shown = columns ?? u.columns
  return (
    <Frame className="bg-(--el-page-bg) p-5">
      {header ? (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-(family-name:--font-serif) text-2xl font-semibold text-(--el-text)">
              {u.boardsHeading}
            </span>
            <span className="text-sm text-(--el-text-muted)">
              {u.boardsSubtitle}
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {u.newItem}
          </Button>
        </div>
      ) : null}
      <div className="flex gap-3 overflow-hidden">
        {shown.map((column) => (
          <section
            key={column.name}
            className="flex w-60 shrink-0 flex-col rounded-(--radius-card) border border-(--el-border) bg-(--el-surface)"
          >
            <header className="flex items-center gap-2 border-b border-(--el-border) px-3 py-2.5">
              <span className="text-[13px] font-semibold text-(--el-text-strong)">
                {column.name}
              </span>
              <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-(--radius-badge) bg-(--el-count-bg) px-(--spacing-chip-x) text-xs font-semibold text-(--el-count-text)">
                {column.cards.length}
              </span>
            </header>
            <div className="flex min-h-[220px] flex-col gap-2 p-2.5">
              {column.cards.map((card) => (
                <BoardCard key={card.key} card={card} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Frame>
  )
}

const ROW_GLYPH: Record<string, React.ReactNode> = {
  plan: <Sparkles className="h-4 w-4 shrink-0 text-(--el-accent-on-surface)" />,
  pr: (
    <GitPullRequest className="h-4 w-4 shrink-0 text-(--el-accent-on-surface)" />
  ),
  design: <Pencil className="h-4 w-4 shrink-0 text-(--el-type-design)" />,
  video: <Video className="h-4 w-4 shrink-0 text-(--el-type-story)" />,
  manual: <Hand className="h-4 w-4 shrink-0 text-(--el-type-manual)" />,
}

/** The "Waiting on you" list: `ApprovalRow`s under their column headers. */
export function ApprovalsUi() {
  const u = useCopy().products.projectManagement.ui
  // The room's columns, less Details: the hero gives the list half a page.
  const grid = { gridTemplateColumns: 'minmax(0,1fr) 64px 96px' }
  return (
    <Frame className="bg-(--el-page-bg)">
      <div className="border-b border-(--el-border) px-4 py-3">
        <span className="font-(family-name:--font-serif) text-xl font-semibold text-(--el-text)">
          {u.waitingOnYou}
        </span>
      </div>
      <div
        className="hidden gap-x-4 border-b border-(--el-border) px-4 py-2 text-xs font-medium text-(--el-text-secondary) md:grid"
        style={grid}
      >
        {u.waitedHeader.map((h) => (
          <span key={h}>{h}</span>
        ))}
        <span />
      </div>
      {u.rows.map((row) => {
        const [before, after] = row.sentence.split('{title}')
        return (
          <div
            key={row.title + row.kind}
            className="flex flex-col gap-1 border-b border-(--el-border) px-4 py-2.5 last:border-b-0 md:grid md:h-11 md:items-center md:gap-x-4 md:py-0"
            style={grid}
          >
            <div className="flex min-w-0 items-center gap-2">
              {ROW_GLYPH[row.kind]}
              <span className="min-w-0 truncate text-sm">
                {before ? (
                  <span className="text-(--el-text-secondary)">{before}</span>
                ) : null}
                <span className="font-medium text-(--el-text)">
                  {row.title}
                </span>
                {after ? (
                  <span className="text-(--el-text-secondary)">{after}</span>
                ) : null}
              </span>
              {row.key ? (
                <span className="shrink-0 font-mono text-xs text-(--el-text-secondary)">
                  {row.key}
                </span>
              ) : null}
            </div>
            <span className="truncate text-xs text-(--el-text-secondary)">
              {row.waited}
            </span>
            <div className="flex md:justify-end">
              <Button variant="secondary" size="sm">
                {row.action}
              </Button>
            </div>
          </div>
        )
      })}
    </Frame>
  )
}

/* ── The roadmap canvas ─────────────────────────────────────────────── */

const NODE_W = 280
// Tall enough for a two-line title AND a container's progress row.
const NODE_H = 140
const COL = NODE_W + 96
const ROW = NODE_H + 56
/** Column = dependency rank; a blocker sits left of what it blocks. */
const PLACE: Record<string, [number, number]> = {
  'PA-21': [0, 0], // Set a goal
  'PA-24': [0, 1], // Decide which calendar to support
  'PA-22': [1, 0], // Weekly milestones — blocked by the goal
  'PA-25': [1, 1], // Connect a calendar — blocked by the decision
  'PA-23': [2, 0.5], // Book the sessions — blocked by milestones and calendar
}
/** [blocker, blocked]; an edge from a done blocker is drawn committed. */
const EDGES: ReadonlyArray<[string, string]> = [
  ['PA-21', 'PA-22'],
  ['PA-24', 'PA-25'],
  ['PA-22', 'PA-23'],
  ['PA-25', 'PA-23'],
]
const WORLD_W = COL * 2 + NODE_W
const WORLD_H = ROW + NODE_H

const STATUS_PILL: Record<string, { tint: string; Icon: typeof Check }> = {
  todo: {
    tint: 'bg-(--el-muted) text-(--el-text-secondary)',
    Icon: CircleDashed,
  },
  in_progress: {
    tint: 'bg-(--el-tint-sky) text-(--el-text-strong)',
    Icon: CircleDot,
  },
  done: { tint: 'bg-(--el-tint-mint) text-(--el-text-strong)', Icon: Check },
}

function RoadmapNode({
  node,
}: Readonly<{
  node: Copy['products']['projectManagement']['ui']['roadmap'][number]
}>) {
  const u = useCopy().products.projectManagement.ui
  const Icon = KIND_ICON[node.kind as Kind]
  const ready = node.status === 'ready'
  const done = node.status === 'done'
  const frame = ready
    ? 'border-(--el-border) bg-(--el-tint-mint) shadow-(--shadow-card)'
    : done
      ? 'border-(--el-border) bg-(--el-tint-sky) shadow-(--shadow-subtle)'
      : 'border-(--el-border) bg-(--el-surface) shadow-(--shadow-card)'
  const pill = STATUS_PILL[node.status]
  return (
    <div
      className={cn(
        'relative flex h-[140px] w-[280px] flex-col overflow-hidden rounded-(--radius-card) border p-3.5',
        frame,
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        {ready ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-(--radius-badge) border border-(--el-border) bg-(--el-page-bg) px-1.5 py-0.5 text-[11px] font-medium text-(--el-text-strong)">
            <CirclePlay className="size-3 text-(--el-success)" />
            {node.label}
          </span>
        ) : (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-(--radius-badge) px-1.5 py-0.5 text-[11px] font-medium',
              pill.tint,
            )}
          >
            <pill.Icon className="size-3" />
            {node.label}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex min-h-0 flex-1 items-start gap-2 overflow-hidden">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-(--radius-control)',
            KIND_TINT[node.kind as Kind],
          )}
        >
          <Icon className={cn('size-4', KIND_ICON_COLOR[node.kind as Kind])} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs text-(--el-text-secondary)">
              {node.key}
            </span>
            {'manual' in node && node.manual ? (
              <ManualChip label={u.manual} />
            ) : null}
          </span>
          <span
            className={cn(
              'mt-0.5 line-clamp-2 block text-sm leading-snug font-semibold',
              done
                ? 'text-(--el-text-secondary) line-through'
                : 'text-(--el-text)',
            )}
          >
            {node.title}
          </span>
        </div>
      </div>
      {'progress' in node && node.progress ? (
        <div className="mt-2 flex shrink-0 items-center gap-2">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--el-muted)">
            <span className="block h-full w-2/5 bg-(--el-success)" />
          </span>
          <span className="text-xs font-medium text-(--el-text-secondary) tabular-nums">
            {node.progress}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function edgePath(from: string, to: string) {
  const [fc, fr] = PLACE[from]
  const [tc, tr] = PLACE[to]
  const sx = fc * COL + NODE_W
  const sy = fr * ROW + NODE_H / 2
  const tx = tc * COL
  const ty = tr * ROW + NODE_H / 2
  return `M${sx} ${sy} C${sx + 48} ${sy}, ${tx - 48} ${ty}, ${tx} ${ty}`
}

/** `zoom` scales the canvas world to the column it sits in. */
export function RoadmapUi({ zoom = 0.8 }: Readonly<{ zoom?: number }>) {
  const u = useCopy().products.projectManagement.ui
  const doneKeys = new Set(
    u.roadmap.filter((n) => n.status === 'done').map((n) => n.key),
  )
  return (
    <Frame>
      <LevelCrumbs root={u.roadmapRoot} epic={u.roadmapEpic} back={u.back} />
      <div className="flex items-center justify-center overflow-hidden bg-(--el-canvas) px-6 py-10">
        <div style={{ zoom }}>
          <div className="relative" style={{ width: WORLD_W, height: WORLD_H }}>
            <svg
              className="absolute inset-0 overflow-visible"
              width={WORLD_W}
              height={WORLD_H}
              fill="none"
            >
              <defs>
                {(['committed', 'pending'] as const).map((kind) => (
                  <marker
                    key={kind}
                    id={`mk-roadmap-${kind}`}
                    viewBox="0 0 10 10"
                    refX="8.5"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path
                      d="M0 0L10 5L0 10z"
                      className={
                        kind === 'committed'
                          ? 'fill-(--el-canvas-edge-committed)'
                          : 'fill-(--el-canvas-edge-pending)'
                      }
                    />
                  </marker>
                ))}
              </defs>
              {EDGES.map(([from, to]) => {
                const committed = doneKeys.has(from)
                return (
                  <path
                    key={`${from}-${to}`}
                    d={edgePath(from, to)}
                    className={
                      committed
                        ? 'stroke-(--el-canvas-edge-committed)'
                        : 'stroke-(--el-canvas-edge-pending)'
                    }
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray={committed ? undefined : '2 7'}
                    markerEnd={`url(#mk-roadmap-${committed ? 'committed' : 'pending'})`}
                  />
                )
              })}
            </svg>
            {u.roadmap.map((node) => (
              <div
                key={node.key}
                className="absolute"
                style={{
                  left: PLACE[node.key][0] * COL,
                  top: PLACE[node.key][1] * ROW,
                }}
              >
                <RoadmapNode node={node} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}
