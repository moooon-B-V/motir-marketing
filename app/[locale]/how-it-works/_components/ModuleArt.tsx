import { cn } from '@motir/design-system'
import { useCopy } from '@/lib/copy'

/*
 * The "Module by module" pictures on "How Motir works" (2026-10 redesign): one
 * flat colour field per module, each holding a small example screen from the
 * same example project the landing uses (an AI personal assistant). They are
 * illustrations — `aria-hidden`; the heading and paragraphs beside each one
 * carry the meaning. Colours are the fixed artwork inks (`.landing-art`).
 */

const MONO = 'font-(family-name:--font-mono) tracking-[0.06em] uppercase'
const FIELD =
  'relative h-[300px] overflow-hidden rounded-(--radius-card) p-(--spacing-card-padding) text-[12px] leading-[1.35] border border-(--el-border) shadow-(--shadow-card)'
const H4 = 'm-0 text-[22px] leading-none font-semibold tracking-[-0.03em]'

function Cap({ children }: { children: string }) {
  return (
    <span
      className={cn(MONO, 'absolute bottom-3 left-4 text-[10.5px] opacity-80')}
    >
      {children}
    </span>
  )
}

export function PlannerArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="field"
      className={cn(
        FIELD,
        'grid content-start gap-2.5 bg-(--el-showcase-field) pb-10 text-(--el-showcase-field-text)',
      )}
    >
      <div className="rounded-(--radius-control) bg-(--el-showcase-field-text)/14 px-[11px] py-[9px] text-[13px]">
        <span className="font-(family-name:--font-mono) opacity-70">&gt; </span>
        {a.plan.prompt}
      </div>
      <div className="flex items-center gap-1.5 text-[12px]">
        <span className="min-w-0 flex-1">{a.plan.question}</span>
        {a.plan.answers.map((answer, i) => (
          <b
            key={answer}
            className={cn(
              'rounded-(--radius-control) border px-2 py-[3px] font-(family-name:--font-mono) text-[11px] font-medium',
              i === 1
                ? 'border-(--el-showcase-field-text) bg-(--el-showcase-field-text) text-(--el-showcase-field)'
                : 'border-(--el-showcase-field-text)/50',
            )}
          >
            {answer}
          </b>
        ))}
      </div>
      <ul className="m-0 mt-1 grid list-none gap-[7px] rounded-(--radius-control) bg-(--el-showcase-paper) px-3 py-2.5 text-(--el-showcase-text)">
        {a.plan.tree.map(([level, name, note]) => (
          <li
            key={name}
            className={cn(
              'flex items-center gap-2 text-[12px] whitespace-nowrap',
              level.startsWith('1') && 'pl-4',
              level.startsWith('2') && 'pl-8',
            )}
          >
            <i
              className={cn(
                'size-2 flex-none',
                level.endsWith('m')
                  ? 'bg-(--el-showcase-decision)'
                  : 'bg-(--el-showcase-field)',
              )}
            />
            {name}
            {note ? (
              <em className="ml-auto font-(family-name:--font-mono) text-[10px] text-(--el-showcase-muted) not-italic">
                {note}
              </em>
            ) : null}
          </li>
        ))}
      </ul>
      <Cap>{cap}</Cap>
    </div>
  )
}

export function ApproveArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="wash-warm"
      className={cn(
        FIELD,
        'grid content-start gap-3.5 bg-(--el-showcase-wash-warm) px-5 pt-5 pb-10 text-(--el-showcase-text)',
      )}
    >
      <p className={H4}>{a.approve.title}</p>
      <div className="grid gap-1.5">
        {a.approve.turns.map(([turn, what], i) => {
          const now = i === a.approve.turns.length - 1
          return (
            <div
              key={turn}
              className={cn(
                'flex items-center gap-2 text-[12px]',
                now && 'font-semibold',
              )}
            >
              <span
                className={cn(
                  MONO,
                  'w-[46px] flex-none text-[10.5px] text-(--el-showcase-muted)',
                )}
              >
                {turn}
              </span>
              {now ? (
                <i className="size-1.5 bg-(--el-showcase-decision)" />
              ) : null}
              {what}
            </div>
          )
        })}
      </div>
      <div className="relative flex h-[34px] items-end justify-between">
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'w-[1.5px] bg-(--el-showcase-text)',
              i % 5 === 0 ? 'h-[18px]' : 'h-2.5',
            )}
          />
        ))}
        <i className="absolute right-[2%] -bottom-0.5 h-[30px] w-3.5 rounded-(--radius-control) bg-(--el-showcase-decision)" />
      </div>
      <div
        className={cn(
          MONO,
          'flex justify-between text-[10px] text-(--el-showcase-muted)',
        )}
      >
        <span>{a.approve.min}</span>
        <span>{a.approve.max}</span>
      </div>
      <div className="rounded-(--radius-control) bg-(--el-showcase-ground) p-[9px] text-center text-[13px] font-medium text-(--el-showcase-ground-text)">
        {a.approve.cta}
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}

// The board's squares, column by column: a = agent, m = manual task, d = waiting, '' = not started.
const BOARD = [
  ['', '', 'm', 'a', '', 'a', 'a', '', 'm'],
  ['a', 'a', 'm', 'a'],
  ['a', 'a', 'a', 'a', 'd'],
  ['a', 'm', 'a', 'a', 'a', 'd'],
]
const SQUARE: Record<string, string> = {
  a: 'bg-(--el-showcase-field)',
  m: 'bg-(--el-showcase-decision)',
  d: 'bg-(--el-showcase-muted)',
  '': 'bg-(--el-showcase-rule)',
}
export function BoardArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="paper"
      className={cn(
        FIELD,
        'bg-(--el-showcase-paper) pb-10 text-(--el-showcase-text) border border-(--el-showcase-rule)',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={H4}>{a.board.title}</p>
          <small className="mt-1 block text-[12px] text-(--el-showcase-muted)">
            {a.board.sub}
          </small>
        </div>
        <span className="text-[46px] leading-[0.9] tracking-[-0.04em]">
          {a.board.count}
        </span>
      </div>
      <div className="mt-[18px] grid grid-cols-4 gap-2.5">
        {BOARD.map((column, c) => (
          <div key={c} className="grid grid-cols-3 content-end gap-[3px]">
            {column.map((kind, i) => (
              <i
                key={i}
                className={cn(
                  'aspect-square rounded-(--radius-control)',
                  SQUARE[kind],
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        className={cn(
          MONO,
          'mt-[7px] grid grid-cols-4 gap-2.5 text-[9px] text-(--el-showcase-muted)',
        )}
      >
        {a.board.columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[11px] text-(--el-showcase-muted)">
        <span className="inline-flex items-center gap-[5px]">
          <i className="size-1.5 bg-(--el-showcase-field)" />
          {a.board.agent}
        </span>
        <span className="inline-flex items-center gap-[5px]">
          <i className="size-1.5 bg-(--el-showcase-decision)" />
          {a.board.manual}
        </span>
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}

const FADERS = [6, 6, 14, 46, 80]
export function RunArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="ground"
      className={cn(
        FIELD,
        'bg-(--el-showcase-ground) pb-10 text-(--el-showcase-ground-text)',
      )}
    >
      <div
        className={cn(
          MONO,
          'flex justify-between text-[10.5px] text-(--el-showcase-ground-muted)',
        )}
      >
        <span>
          {a.run.run}{' '}
          <b className="font-medium text-(--el-showcase-ground-text)">
            {a.run.key}
          </b>
        </span>
        <span>{a.run.agent}</span>
      </div>
      <p className={cn(H4, 'mt-2.5')}>{a.run.title}</p>
      <div className="mt-4 grid h-[108px] grid-cols-5 gap-1.5">
        {a.run.faders.map((fader, i) => (
          <div key={fader} className="relative grid justify-items-center">
            <span className="absolute top-0 bottom-[18px] w-0.5 bg-(--el-showcase-ground-rule)" />
            <i
              className={cn(
                'absolute h-2 w-[22px] rounded-(--radius-control)',
                i < 3
                  ? 'bg-(--el-showcase-field)'
                  : 'bg-(--el-showcase-ground-text)',
              )}
              style={{ top: FADERS[i] }}
            />
            <span
              className={cn(
                MONO,
                'absolute bottom-0 text-[9px] text-(--el-showcase-ground-muted)',
              )}
            >
              {fader}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-3 border-t border-(--el-showcase-ground-rule) pt-2 text-[11px] text-(--el-showcase-ground-muted)">
        {a.run.stats.map(([label, value]) => (
          <span key={label}>
            {label}
            <b className="block font-(family-name:--font-mono) text-[12px] font-medium text-(--el-showcase-ground-text)">
              {value}
            </b>
          </span>
        ))}
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}

export function ReviewArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="decision"
      className={cn(
        FIELD,
        'grid content-start gap-2 bg-(--el-showcase-decision) p-4 pb-10 text-(--el-showcase-decision-text)',
      )}
    >
      <div className="rounded-(--radius-control) bg-(--el-showcase-paper) px-3 py-[11px] text-(--el-showcase-text)">
        <p className="m-0 mb-[7px] text-[13px] font-semibold">
          {a.review.title}
        </p>
        {a.review.checks.map((check) => (
          <div
            key={check}
            className="flex items-center gap-2 py-[3px] text-[12px]"
          >
            <i className="grid size-3 flex-none place-items-center rounded-(--radius-control) border-[1.5px] border-(--el-showcase-text)">
              <i className="size-1.5 bg-(--el-showcase-text)" />
            </i>
            {check}
          </div>
        ))}
      </div>
      <div className="flex h-[58px] items-center gap-3 rounded-(--radius-control) bg-(--el-showcase-ground) px-3.5 font-(family-name:--font-mono) text-[11px] text-(--el-showcase-ground-text)">
        <span className="size-0 border-y-8 border-l-[13px] border-y-transparent border-l-(--el-showcase-ground-text)" />
        <span>{a.review.video}</span>
        <span className="relative h-[3px] flex-1 bg-(--el-showcase-ground-rule)">
          <i className="absolute inset-y-0 left-0 w-3/5 bg-(--el-showcase-decision)" />
        </span>
        <span>{a.review.length}</span>
      </div>
      <div className="rounded-(--radius-control) bg-(--el-showcase-ground) p-[9px] text-center text-[13px] font-medium text-(--el-showcase-ground-text) underline underline-offset-3">
        {a.review.merge}
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}

export function RepairArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  const row = (what: string, command: string, on: boolean) => (
    <div
      data-tilt=""
      key={what}
      className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-(--radius-control) bg-(--el-showcase-paper) px-2.5 py-[9px]"
    >
      <span
        className={cn(
          'relative h-[17px] w-[30px] rounded-(--radius-btn)',
          on ? 'bg-(--el-showcase-field)' : 'bg-(--el-showcase-rule)',
        )}
      >
        <i
          className={cn(
            'absolute top-0.5 size-[13px] rounded-full bg-(--el-showcase-paper)',
            on ? 'left-[15px]' : 'left-0.5',
          )}
        />
      </span>
      <b className="text-[12px] font-medium">{what}</b>
      <code className="rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) bg-(--el-showcase-rule) font-(family-name:--font-mono) text-[10px] whitespace-nowrap">
        {command}
      </code>
    </div>
  )
  const [first, ...rest] = a.repair.rows
  return (
    <div
      className={cn(
        FIELD,
        'grid content-start gap-2.5 bg-(--el-showcase-rule) pb-10 text-(--el-showcase-text)',
      )}
    >
      <p className={cn(H4, 'mb-1')}>{a.repair.title}</p>
      {row(first[0], first[1], true)}
      <div
        className={cn(
          MONO,
          'flex items-center gap-1 text-[10px] text-(--el-showcase-muted)',
        )}
      >
        {[true, true, false, false, false].map((on, i) => (
          <i
            key={i}
            className={cn(
              'h-1.5 w-3.5',
              on ? 'bg-(--el-showcase-field)' : 'bg-(--el-showcase-paper)',
            )}
          />
        ))}
        <span className="ml-1">{a.repair.attempt}</span>
      </div>
      {rest.map(([what, command]) => row(what, command, false))}
      <Cap>{cap}</Cap>
    </div>
  )
}

export function LearningArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  const dots = Array.from({ length: 16 }, (_, n) => {
    const angle = (n / 16) * Math.PI * 2 - Math.PI / 2
    return {
      left: 45 + Math.cos(angle) * 42,
      top: 45 + Math.sin(angle) * 42,
      hot: n % 5 === 0 && n < 15,
    }
  })
  return (
    <div
      data-tilt=""
      data-showcase="record"
      className={cn(
        FIELD,
        'grid grid-cols-[96px_minmax(0,1fr)] content-start gap-3.5 bg-(--el-showcase-record) pb-10 text-(--el-showcase-record-text)',
      )}
    >
      <div className="relative size-24">
        {dots.map((dot, i) => (
          <i
            key={i}
            className={cn(
              'absolute size-1.5 rounded-full',
              dot.hot
                ? 'bg-(--el-showcase-highlight)'
                : 'bg-(--el-showcase-record-text)/45',
            )}
            style={{ left: dot.left, top: dot.top }}
          />
        ))}
        <b
          className={cn(
            MONO,
            'absolute inset-0 grid place-items-center text-center text-[9.5px] leading-tight font-medium whitespace-pre-line',
          )}
        >
          {a.learning.loop.join('\n')}
        </b>
      </div>
      <p className={cn(H4, 'self-center text-[21px] leading-[1.05]')}>
        {a.learning.title}
      </p>
      <div className="col-span-full grid gap-1.5">
        {a.learning.lessons.map(([lesson, state, strength]) => (
          <div
            key={String(lesson)}
            className="grid gap-[5px] rounded-(--radius-control) bg-(--el-showcase-record-text)/12 px-2.5 py-2"
          >
            <span className="text-[12px]">{lesson}</span>
            <span className="relative h-[3px] bg-(--el-showcase-record-text)/20">
              <i
                className="absolute inset-y-0 left-0 bg-(--el-showcase-record-text)"
                style={{ width: `${strength}%` }}
              />
            </span>
            <em className={cn(MONO, 'text-[9.5px] not-italic opacity-85')}>
              {state}
            </em>
          </div>
        ))}
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}

// Event markers along the history line: s = design, r = run, d = decision.
const EVENTS: Array<[number, 's' | 'r' | 'd']> = [
  [8, 's'],
  [19, 'r'],
  [30, 'd'],
  [41, 'r'],
  [52, 's'],
  [63, 'r'],
  [74, 'd'],
  [86, 'r'],
]
export function MemoryArt({ cap }: { cap: string }) {
  const a = useCopy().howItWorks.art
  return (
    <div
      data-tilt=""
      data-showcase="wash"
      className={cn(
        FIELD,
        'grid content-start gap-3 bg-(--el-showcase-wash) pb-10 text-(--el-showcase-text)',
      )}
    >
      <div
        className={cn(MONO, 'flex items-center justify-between text-[11px]')}
      >
        <span>{a.memory.title}</span>
        <small className="rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) bg-(--el-showcase-paper) text-[10px]">
          {a.memory.span}
        </small>
      </div>
      <div className="relative h-[92px] rounded-(--radius-control) bg-(--el-showcase-paper)">
        <span className="absolute top-2.5 left-[44%] -translate-x-[30%] rounded-(--radius-control) bg-(--el-showcase-ground) px-[7px] py-1 text-[10.5px] whitespace-nowrap text-(--el-showcase-ground-text)">
          {a.memory.tip}
        </span>
        <span className="absolute inset-x-3 top-14 h-[1.5px] bg-(--el-showcase-text)" />
        {EVENTS.map(([left, kind]) => (
          <i
            key={left}
            className={cn(
              'absolute top-[51px] size-[11px] -translate-x-1/2',
              kind === 's' && 'bg-(--el-showcase-field)',
              kind === 'r' && 'rounded-full bg-(--el-showcase-text)',
              kind === 'd' && 'rotate-45 bg-(--el-showcase-decision)',
            )}
            style={{ left: `${left}%` }}
          />
        ))}
        <div
          className={cn(
            MONO,
            'absolute inset-x-3 bottom-2 flex justify-between text-[9px] text-(--el-showcase-muted)',
          )}
        >
          {a.memory.axis.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 rounded-(--radius-control) bg-(--el-showcase-text)/5 p-1">
        {a.memory.tabs.map((tab, i) => (
          <span
            key={tab}
            className={cn(
              MONO,
              'rounded-(--radius-control) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[9.5px]',
              i === 1
                ? 'bg-(--el-showcase-paper) text-(--el-showcase-text)'
                : 'text-(--el-showcase-muted)',
            )}
          >
            {tab}
          </span>
        ))}
      </div>
      <Cap>{cap}</Cap>
    </div>
  )
}
