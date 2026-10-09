import { Plus, SquareTerminal } from 'lucide-react'
import { Button, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { Frame, KIND_ICON, KIND_ICON_COLOR, type Kind } from './realUi'

/*
 * Motir Agent Fleet's pictures, drawn from the REAL screens (2026-10
 * redesign): the Runs page (`runs/_view.tsx`, `RunsIndex`'s sections and
 * rows, `RunTonePill`, and `AgentRunParts`' lane chip for a run on one of
 * your own cloud agents) and the Ready list (`ReadyList`). Same markup, same
 * element tokens. Agent Hosting's My agents room (`MyAgentsRoom`'s header
 * and table) is drawn here too, on the same `RunTonePill`.
 */

const u = copy.products.agentFleet.ui

type Tone = 'running' | 'implemented' | 'failed' | 'cancelled'
const TONE_CLASS: Record<Tone, string> = {
  running: 'bg-(--el-tint-sky)',
  implemented: 'bg-(--el-tint-mint)',
  failed: 'bg-(--el-tint-rose)',
  cancelled: 'bg-(--el-muted)',
}
const DOT_CLASS: Record<Tone, string> = {
  running: 'bg-(--el-status-in-progress)',
  implemented: 'bg-(--el-status-done)',
  failed: 'bg-(--el-danger)',
  cancelled: 'bg-(--el-status-cancelled)',
}

function RunTonePill({
  tone,
  children,
}: Readonly<{ tone: Tone; children: React.ReactNode }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) font-sans text-xs font-medium text-(--el-text-strong)',
        TONE_CLASS[tone],
      )}
    >
      <span className={cn('size-[7px] rounded-full', DOT_CLASS[tone])} />
      {children}
    </span>
  )
}

type Row = (typeof u.live)[number]
const CELL = 'px-(--spacing-control-x) py-(--spacing-control-y)'

function AgentCell({ agent }: Readonly<{ agent: string }>) {
  if (!agent.startsWith('lane:')) return <>{agent}</>
  const [name, profile] = agent.slice(5).split(' · ')
  return (
    <span className="inline-flex items-center gap-1.5 rounded-(--radius-badge) bg-(--el-chip-bg) px-(--spacing-chip-x) py-(--spacing-chip-y) font-sans text-xs font-medium text-(--el-text-strong)">
      <SquareTerminal className="size-3.5" />
      {name} · {profile}
    </span>
  )
}

/** The columns a compact table keeps: Scope, Agent, Status. */
const COMPACT = new Set([1, 2, 4])

function RunsSection({
  heading,
  rows,
  compact,
}: Readonly<{ heading: string; rows: ReadonlyArray<Row>; compact?: boolean }>) {
  const show = (i: number) => !compact || COMPACT.has(i)
  return (
    <section className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-wide text-(--el-text-secondary) uppercase">
        {heading}
      </span>
      <div className="overflow-hidden rounded-(--radius-card) border border-(--el-border)">
        <table className="w-full border-collapse">
          <thead className="border-b border-(--el-border) bg-(--el-surface)">
            <tr>
              {u.columns.map((c, i) =>
                show(i) ? (
                  <th
                    key={c}
                    className={cn(
                      CELL,
                      'text-left text-xs font-semibold whitespace-nowrap text-(--el-text-secondary)',
                    )}
                  >
                    {c}
                  </th>
                ) : null,
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((run) => (
              <tr
                key={run.scope + run.started}
                className="border-b border-(--el-border-soft) last:border-b-0"
              >
                {show(0) ? (
                  <td
                    className={cn(CELL, 'font-mono text-xs whitespace-nowrap')}
                  >
                    <span className="text-(--el-accent-on-surface)">
                      {run.command}
                    </span>
                  </td>
                ) : null}
                <td className={cn(CELL, 'text-sm text-(--el-text-secondary)')}>
                  {run.scope}
                </td>
                <td
                  className={cn(
                    CELL,
                    'text-xs whitespace-nowrap text-(--el-text-secondary)',
                  )}
                >
                  <AgentCell agent={run.agent} />
                </td>
                {show(3) ? (
                  <td
                    className={cn(
                      CELL,
                      'text-xs whitespace-nowrap text-(--el-text-secondary)',
                    )}
                  >
                    {run.started}
                  </td>
                ) : null}
                <td className={cn(CELL, 'whitespace-nowrap')}>
                  <RunTonePill tone={run.tone as Tone}>
                    {run.status}
                  </RunTonePill>
                </td>
                {show(5) ? (
                  <td
                    className={cn(CELL, 'text-xs text-(--el-text-secondary)')}
                  >
                    {run.summary}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** The Runs page: its header and one or both of its sections. */
export function RunsUi({
  sections = ['live'],
  compact,
}: Readonly<{ sections?: ReadonlyArray<'live' | 'past'>; compact?: boolean }>) {
  return (
    <Frame className="flex flex-col gap-6 bg-(--el-page-bg) p-5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-(family-name:--font-serif) text-2xl font-semibold text-(--el-text)">
          {u.runsHeading}
        </span>
        <span className="text-sm text-(--el-text-secondary)">
          {u.runsSubtitle}
        </span>
      </div>
      {sections.includes('live') ? (
        <RunsSection heading={u.runningNow} rows={u.live} compact={compact} />
      ) : null}
      {sections.includes('past') ? (
        <RunsSection heading={u.pastRuns} rows={u.past} />
      ) : null}
    </Frame>
  )
}

/** The Ready list: what any agent may claim next. */
export function ReadyUi() {
  return (
    <Frame className="flex flex-col gap-4 bg-(--el-page-bg) p-5">
      <span className="font-(family-name:--font-serif) text-2xl font-semibold text-(--el-text)">
        {u.readyHeading}
      </span>
      <span className="text-xs font-semibold tracking-wide text-(--el-text-secondary) uppercase">
        {u.readyLane}
      </span>
      <div className="flex flex-col gap-2">
        {u.ready.map((item) => {
          const Icon = KIND_ICON[item.kind as Kind]
          return (
            <div
              key={item.key}
              className="flex min-h-(--height-control) items-center gap-3 rounded-(--radius-card) border border-(--el-border) bg-(--el-page-bg) px-(--spacing-control-x) py-(--spacing-control-y) shadow-(--shadow-subtle)"
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  KIND_ICON_COLOR[item.kind as Kind],
                )}
              />
              <span className="shrink-0 font-mono text-xs text-(--el-text-secondary)">
                {item.key}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-(--el-text)">
                {item.title}
              </span>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

/**
 * The My agents room: its header and table. One wording change from the app:
 * its column says "Coding agent"; motir.co's copy never says that, so here it
 * is "Agent". The hero gives it half a page, so the Project column (one value
 * for every row here) is left out.
 */
export function MyAgentsUi() {
  const m = copy.products.agentHosting.ui
  return (
    <Frame className="flex flex-col gap-6 bg-(--el-page-bg) p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-(family-name:--font-serif) text-2xl font-semibold text-(--el-text)">
            {m.title}
          </span>
          <span className="text-sm text-(--el-text-secondary)">
            {m.subtitle}
          </span>
        </div>
        <Button leftIcon={<Plus aria-hidden="true" />}>{m.newAgent}</Button>
      </div>
      <div className="overflow-hidden rounded-(--radius-card) border border-(--el-border)">
        <table className="w-full border-collapse">
          <thead className="border-b border-(--el-border) bg-(--el-surface)">
            <tr>
              {m.columns.map((c, i) => (
                <th
                  key={c}
                  className={cn(
                    CELL,
                    'text-xs font-semibold whitespace-nowrap text-(--el-text-secondary)',
                    i >= 3 ? 'text-right' : 'text-left',
                  )}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.rows.map((row) => (
              <tr
                key={row.name}
                className="border-b border-(--el-border-soft) last:border-b-0"
              >
                <td className={cn(CELL, 'align-middle whitespace-nowrap')}>
                  <strong className="text-sm text-(--el-text)">
                    {row.name}
                  </strong>
                </td>
                <td
                  className={cn(
                    CELL,
                    'align-middle text-sm whitespace-nowrap text-(--el-text)',
                  )}
                >
                  {row.agent}
                </td>
                <td className={cn(CELL, 'align-middle whitespace-nowrap')}>
                  <RunTonePill tone={row.tone as Tone}>{row.state}</RunTonePill>
                </td>
                <td
                  className={cn(
                    CELL,
                    'align-middle text-right text-sm whitespace-nowrap text-(--el-text) tabular-nums',
                  )}
                >
                  {row.time}
                </td>
                <td
                  className={cn(
                    CELL,
                    'align-middle text-right text-sm whitespace-nowrap text-(--el-text) tabular-nums',
                  )}
                >
                  {row.credits}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  )
}
