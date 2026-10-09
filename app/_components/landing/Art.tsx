import { Check, Play } from 'lucide-react'
import { cn } from '@motir/design-system'
import { useCopy } from '@/lib/copy'

/*
 * The landing's pictures (2026-10 redesign).
 *
 * Every picture hangs from an index TAB, like a tabbed project folder — the
 * page's own motif — and is a flat colour field holding a small example
 * screen from one example project, an AI personal assistant. They are
 * illustrations: `aria-hidden`, with the meaning carried by the heading and
 * sentence printed under each one. Their colours are the fixed artwork inks
 * in `globals.css` (`.landing-art`), so they read the same in both themes.
 */

export type Tone = 'blue' | 'ink' | 'paper' | 'soft' | 'teal' | 'orange'

/** The showcase field each tone paints — the design system's `data-showcase` hook. */
const SHOWCASE: Record<Tone, string> = {
  blue: 'field',
  ink: 'ground',
  paper: 'paper',
  soft: 'wash',
  teal: 'record',
  orange: 'decision',
}

const FIELD: Record<Tone, string> = {
  blue: 'bg-(--el-showcase-field) text-(--el-showcase-field-text)',
  ink: 'bg-(--el-showcase-ground) text-(--el-showcase-ground-text)',
  paper:
    'bg-(--el-showcase-paper) text-(--el-showcase-text) border border-(--el-showcase-rule)',
  soft: 'bg-(--el-showcase-wash) text-(--el-showcase-text)',
  teal: 'bg-(--el-showcase-record) text-(--el-showcase-record-text)',
  orange: 'bg-(--el-showcase-decision) text-(--el-showcase-decision-text)',
}

export function ArtTile({
  tab,
  tone,
  halftone,
  title,
  body,
  height = 'h-[300px]',
  className,
  children,
}: Readonly<{
  tab: string
  tone: Tone
  halftone?: 'white' | 'yellow'
  title?: string
  body?: string
  height?: string
  className?: string
  children: React.ReactNode
}>) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'ml-3.5 self-start rounded-t-(--radius-control) px-(--spacing-chip-x) py-(--spacing-chip-y) font-(family-name:--font-mono) text-[10.5px] leading-none font-medium tracking-[0.08em] uppercase',
          FIELD[tone],
          tone === 'paper' && 'border-b-0',
        )}
      >
        {tab}
      </span>
      <div
        aria-hidden="true"
        data-showcase={SHOWCASE[tone]}
        data-tilt=""
        className={cn(
          'relative overflow-hidden rounded-(--radius-card) p-(--spacing-card-padding) text-[12.5px] leading-[1.35] border border-(--el-border) shadow-(--shadow-card)',
          height,
          FIELD[tone],
          halftone && 'mk-halftone',
          halftone === 'yellow' && 'mk-halftone-yellow',
        )}
      >
        {children}
      </div>
      {title ? (
        <h3 className="mt-5 mr-5 font-(family-name:--font-serif) text-[24px] leading-[1.1] font-semibold tracking-[-0.02em]">
          {title}
        </h3>
      ) : null}
      {body ? (
        <p className="mt-1.5 mr-5 max-w-[34ch] text-[15px] text-(--el-text-secondary)">
          {body}
        </p>
      ) : null}
    </div>
  )
}

const MONO = 'font-(family-name:--font-mono) tracking-[0.06em] uppercase'

/* ── Plan ─────────────────────────────────────────────────────────────── */
const PLAN_FILL = [100, 60, 15, 0]
export function PlanArt() {
  const art = useCopy().landing.art
  return (
    <div className="grid content-start gap-2">
      <p className="mb-1 text-[20px] leading-[1.05] font-semibold tracking-[-0.02em]">
        {art.plan.title}
      </p>
      {art.plan.rows.map(([name, state], i) => {
        const yours = i === 2
        return (
          <div
            key={name}
            className={cn(
              'grid gap-1.5 rounded-(--radius-control) px-(--spacing-control-x) py-(--spacing-control-y)',
              yours
                ? 'bg-(--el-showcase-paper) text-(--el-showcase-text)'
                : 'bg-(--el-showcase-field-text)/12',
            )}
          >
            <div className="flex justify-between gap-2 text-[13px]">
              <span>{name}</span>
              <span
                className={cn(
                  MONO,
                  'text-[10.5px] whitespace-nowrap',
                  yours ? 'text-(--el-showcase-decision-ink)' : 'opacity-85',
                )}
              >
                {state}
              </span>
            </div>
            <div
              className={cn(
                'h-1',
                yours
                  ? 'bg-(--el-showcase-rule)'
                  : 'bg-(--el-showcase-field-text)/20',
              )}
            >
              <i
                className={cn(
                  'block h-full',
                  yours
                    ? 'bg-(--el-showcase-decision)'
                    : 'bg-(--el-showcase-field-text)',
                )}
                style={{ width: `${PLAN_FILL[i]}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Design: black ground, the yellow touch ───────────────────────────── */
export function DesignArt() {
  const art = useCopy().landing.art
  return (
    <div className="grid content-start gap-2.5">
      <div className="grid gap-[7px] rounded-(--radius-control) bg-(--el-showcase-ground-raised) p-[11px]">
        <div className="flex justify-between text-[13px] font-semibold">
          <span>{art.design.screen}</span>
          <span
            className={cn(
              MONO,
              'text-[10px] text-(--el-showcase-ground-muted)',
            )}
          >
            {art.design.time}
          </span>
        </div>
        {art.design.items.map(([when, what], i) => (
          <div
            key={what}
            className="grid grid-cols-[42px_minmax(0,1fr)] gap-2 border-t border-(--el-showcase-ground-rule) py-[5px] text-[11.5px] text-(--el-showcase-ground-text)"
          >
            <b
              className={cn(
                MONO,
                'pt-px text-[10px] font-medium',
                i === 0
                  ? 'text-(--el-showcase-highlight)'
                  : 'text-(--el-showcase-ground-muted)',
              )}
            >
              {when}
            </b>
            <span>{what}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[art.design.optionA, art.design.optionB].map((label, i) => {
          const chosen = i === 1
          return (
            <div
              key={label}
              className={cn(
                'grid gap-[5px] rounded-(--radius-control) border p-2',
                chosen
                  ? 'border-(--el-showcase-highlight) ring-1 ring-(--el-showcase-highlight) ring-inset'
                  : 'border-(--el-showcase-ground-rule)',
              )}
            >
              <i
                className={cn(
                  'block h-[5px] rounded-(--radius-control)',
                  chosen
                    ? 'w-[45%] bg-(--el-showcase-highlight)'
                    : 'bg-(--el-showcase-ground-rule)',
                )}
              />
              <i
                className="block h-[5px] rounded-(--radius-control) bg-(--el-showcase-ground-rule)"
                style={{ width: chosen ? '80%' : '70%' }}
              />
              <small
                className={cn(
                  MONO,
                  'text-[10px]',
                  chosen
                    ? 'text-(--el-showcase-highlight)'
                    : 'text-(--el-showcase-ground-muted)',
                )}
              >
                {label}
              </small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Product ──────────────────────────────────────────────────────────── */
export function ProductArt() {
  const art = useCopy().landing.art
  const p = art.product
  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-3.5">
      <div className="grid h-[240px] content-start gap-1.5 rounded-(--radius-card) border border-(--el-showcase-rule) bg-(--el-showcase-paper-soft) p-[9px]">
        <b className="text-[12.5px]">{p.greeting}</b>
        <small className={cn(MONO, 'text-[9.5px] text-(--el-showcase-muted)')}>
          {p.needs}
        </small>
        {p.rows.map(([what, tag], i) => (
          <div
            key={what}
            className={cn(
              'grid gap-0.5 rounded-(--radius-control) border bg-(--el-showcase-paper) px-[7px] py-1.5 text-[10.5px]',
              i === 0
                ? 'border-(--el-showcase-decision)'
                : 'border-(--el-showcase-rule)',
            )}
          >
            <span>{what}</span>
            <em
              className={cn(
                MONO,
                'text-[9px] not-italic',
                i === 0
                  ? 'text-(--el-showcase-decision-ink)'
                  : 'text-(--el-showcase-muted)',
              )}
            >
              {tag}
            </em>
          </div>
        ))}
        <div className="flex gap-1">
          <span className="flex-1 rounded-(--radius-control) border border-(--el-showcase-rule) py-[5px] text-center text-[10px]">
            {p.edit}
          </span>
          <span className="flex-1 rounded-(--radius-control) bg-(--el-showcase-ground) py-[5px] text-center text-[10px] text-(--el-showcase-ground-text)">
            {p.send}
          </span>
        </div>
      </div>
      <div className="grid content-start gap-[7px] text-[12.5px]">
        <span className="text-[42px] leading-[0.9] font-bold tracking-[-0.04em] text-(--el-showcase-field-ink)">
          {p.count}
        </span>
        <span>{p.countLabel}</span>
        {p.checks.map((check) => (
          <div key={check} className="flex items-start gap-[7px]">
            <i className="mt-[3px] size-2.5 flex-none bg-(--el-showcase-record)" />
            {check}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Documents ────────────────────────────────────────────────────────── */
export function DocsArt() {
  const art = useCopy().landing.art
  const d = art.docs
  const lines = (widths: number[]) =>
    widths.map((w) => (
      <i
        key={w}
        className="block h-[5px] rounded-(--radius-control) bg-(--el-showcase-rule)"
        style={{ width: `${w}%` }}
      />
    ))
  return (
    <div className="grid content-start gap-2">
      <p className="mb-1 text-[20px] leading-[1.05] font-semibold tracking-[-0.02em]">
        {d.title}
      </p>
      <div className="grid gap-[7px] rounded-(--radius-control) bg-(--el-showcase-paper) px-[13px] py-3">
        <b className="text-[13.5px]">{d.page}</b>
        {lines([92, 78])}
        <div className="border-l-[3px] border-(--el-showcase-decision) bg-(--el-showcase-wash-warm) px-2 py-1 text-[12px]">
          <span
            className={cn(
              MONO,
              'block text-[9.5px] text-(--el-showcase-muted)',
            )}
          >
            {d.decisionLabel}
          </span>
          {d.decision}
        </div>
        {lines([64])}
      </div>
      <div className="flex flex-wrap gap-[5px]">
        {d.chips.map((chip) => (
          <span
            key={chip}
            className={cn(
              MONO,
              'rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) bg-(--el-showcase-field)/12 text-[10px] text-(--el-showcase-text)',
            )}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── History ──────────────────────────────────────────────────────────── */
export function HistoryArt() {
  const art = useCopy().landing.art
  return (
    <div className="grid content-start gap-0.5">
      <p className="mb-1 text-[20px] leading-[1.05] font-semibold tracking-[-0.02em]">
        {art.history.title}
      </p>
      {art.history.events.map(([date, what, why, who]) => (
        <div
          key={what}
          className="grid grid-cols-[46px_12px_minmax(0,1fr)] items-start gap-2 border-b border-(--el-showcase-record-text)/20 py-1.5 text-[13px]"
        >
          <span className={cn(MONO, 'pt-0.5 text-[10.5px] opacity-85')}>
            {date}
          </span>
          <i
            className={cn(
              'mt-1 size-2.5',
              who === 'you'
                ? 'bg-(--el-showcase-highlight)'
                : 'bg-(--el-showcase-record-text)',
            )}
          />
          <span>
            {what}
            <small className="block text-[11.5px] opacity-80">{why}</small>
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Say it: a written brief, not a chat ─────────────────────────────── */
export function SayArt() {
  const art = useCopy().landing.art
  return (
    <div className="grid content-start gap-2.5">
      <p className="border-b-2 border-(--el-showcase-text) pb-2 text-[21px] leading-tight font-medium tracking-[-0.02em]">
        {art.say.idea}
      </p>
      <div className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 gap-y-1 text-[13px]">
        {art.say.qa.map(([q, a], i) => (
          <QA key={q} n={i + 1} q={q} a={a} />
        ))}
      </div>
    </div>
  )
}
function QA({ n, q, a }: { n: number; q: string; a: string }) {
  return (
    <>
      <b
        className={cn(
          MONO,
          'pt-0.5 text-[10.5px] font-medium text-(--el-showcase-field-ink)',
        )}
      >
        Q{n}
      </b>
      <span>{q}</span>
      <span />
      <span className="text-(--el-showcase-muted)">{a}</span>
    </>
  )
}

/* ── Watch it take shape ─────────────────────────────────────────────── */
/*
 * Motir does not know how FAR along a piece of work is, only where it stands,
 * so the lanes show STATUS, never a percentage: done, an agent running on it
 * (with the file it is in), ready to start, or waiting on another lane — the
 * same states the board and the Ready list show.
 */
type WatchState = 'done' | 'running' | 'ready' | 'waiting'

/** The mark on a lane at rest; the running lane draws its own live dot. */
function WatchMark({ state }: Readonly<{ state: WatchState }>) {
  if (state === 'done')
    return (
      <span className="grid size-[18px] place-items-center rounded-full bg-(--el-showcase-field-text) text-(--el-showcase-field)">
        <Check aria-hidden="true" className="size-3" strokeWidth={3} />
      </span>
    )
  return (
    <span
      className={cn(
        'size-[18px] rounded-full border-2 border-(--el-showcase-field-text)',
        state === 'waiting' && 'border-dashed opacity-70',
      )}
    />
  )
}

export function WatchArt() {
  const art = useCopy().landing.art
  const w = art.watch
  return (
    <ol className="m-0 grid h-full list-none content-center gap-[7px] p-0">
      {w.lanes.map(([lane, raw]) => {
        const state = raw as WatchState
        return (
          <li
            key={lane}
            className={cn(
              'grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-(--radius-control) px-2.5 py-[7px] text-[13px]',
              state === 'running'
                ? 'bg-(--el-showcase-field-text) text-(--el-showcase-field)'
                : 'bg-(--el-showcase-field-text)/12',
            )}
          >
            {state === 'running' ? (
              <span className="relative grid size-[18px] place-items-center">
                <i className="absolute inset-0 animate-ping rounded-full bg-(--el-showcase-field)/40 motion-reduce:animate-none" />
                <i className="size-2.5 rounded-full bg-(--el-showcase-field)" />
              </span>
            ) : (
              <WatchMark state={state} />
            )}
            <span className="grid min-w-0">
              <b className="font-semibold">{lane}</b>
              {state === 'running' ? (
                <small
                  className={cn(MONO, 'truncate text-[9.5px] normal-case')}
                >
                  {w.live}
                </small>
              ) : null}
            </span>
            <span className={cn(MONO, 'text-[10px]')}>{w.states[state]}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* ── You decide ──────────────────────────────────────────────────────── */
/*
 * The acceptance recording a finished piece of work comes back with: a short
 * video of it working, split into chapters, that the person watches before
 * approving. Drawn still — a frame, a play button, the length and the chapter
 * marks on its timeline.
 */
function AcceptanceVideo() {
  const art = useCopy().landing.art
  const v = art.decide.video
  return (
    <div className="grid overflow-hidden rounded-(--radius-control) border border-(--el-showcase-rule) bg-(--el-showcase-ground) text-(--el-showcase-ground-text)">
      <div className="relative grid h-[74px] place-items-center">
        {/* The screen being recorded, as a few quiet rows behind the play button. */}
        <div
          aria-hidden="true"
          className="absolute top-2.5 left-3 grid w-[30%] gap-1.5 opacity-40"
        >
          <i className="h-1.5 w-2/5 rounded-full bg-(--el-showcase-ground-text)" />
          <i className="h-1.5 w-full rounded-full bg-(--el-showcase-ground-text)" />
          <i className="h-1.5 w-3/5 rounded-full bg-(--el-showcase-ground-text)" />
        </div>
        <span className="relative grid size-9 place-items-center rounded-full bg-(--el-showcase-highlight) text-(--el-showcase-ground)">
          <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
        </span>
        <span className={cn(MONO, 'absolute top-2 right-2.5 text-[9.5px]')}>
          {v.length}
        </span>
        <span
          className={cn(
            MONO,
            'absolute bottom-1.5 left-2.5 text-[9.5px] text-(--el-showcase-ground-muted)',
          )}
        >
          {v.label} · {v.chapters.length} chapters
        </span>
      </div>
      {/* The timeline, cut at its chapters. */}
      <div className="flex gap-[3px] px-2.5 pb-2">
        {v.chapters.map((chapter) => (
          <i
            key={chapter}
            title={chapter}
            className="h-1 flex-1 rounded-full bg-(--el-showcase-ground-text)/35"
          />
        ))}
      </div>
    </div>
  )
}

export function DecideArt() {
  const art = useCopy().landing.art
  const d = art.decide
  return (
    <div className="grid h-full content-center">
      <div className="grid gap-2 rounded-(--radius-control) bg-(--el-showcase-paper) p-3.5 text-(--el-showcase-text)">
        <span
          className={cn(
            MONO,
            'text-[10.5px] text-(--el-showcase-decision-ink)',
          )}
        >
          {d.stamp}
        </span>
        <b className="text-[17px]">{d.title}</b>
        <small className="text-[12px] text-(--el-showcase-muted)">
          {d.body}
        </small>
        <AcceptanceVideo />
        <div className="flex gap-2">
          <span className="flex-1 rounded-(--radius-control) border border-(--el-showcase-rule) py-[9px] text-center text-[13px]">
            {d.changes}
          </span>
          <span className="flex-1 rounded-(--radius-control) bg-(--el-showcase-ground) py-[9px] text-center text-[13px] text-(--el-showcase-ground-text)">
            {d.approve}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Welcome back ────────────────────────────────────────────────────── */
export function ResumeArt() {
  const art = useCopy().landing.art
  const r = art.resume
  return (
    <div className="grid gap-4">
      <span className="text-[26px] leading-[1.15] font-semibold tracking-[-0.03em]">
        {r.hello}
      </span>
      <div className="grid gap-2 sm:grid-cols-3">
        {r.cells.map(([label, value], i) => (
          <div
            key={label}
            className={cn(
              'grid content-start gap-1 rounded-(--radius-control) p-3',
              i === 2
                ? 'bg-(--el-showcase-decision) text-(--el-showcase-decision-text)'
                : 'bg-(--el-showcase-field-text)/12',
            )}
          >
            <span className={cn(MONO, 'text-[10px] opacity-85')}>{label}</span>
            <b className="text-[15px] leading-tight">{value}</b>
          </div>
        ))}
      </div>
    </div>
  )
}
