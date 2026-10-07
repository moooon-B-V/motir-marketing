import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { IMPORT_DOOR } from '@/lib/destinations'

/*
 * Motir Project Manager — the section right under the hero, and the landing's
 * way in for a project that already exists (2026-10 redesign).
 *
 * The visitor is the product owner; Motir Project Manager runs the project and
 * reports back. The import sources all lead to the same door on motir-core
 * (`IMPORT_DOOR`), which owns choosing and connecting the source — motir.co
 * builds nothing behind its doors.
 *
 * Black ground with the yellow touch. The weekly report beside it is an
 * example, labelled as one for assistive technology.
 */

const pm = copy.landing.projectManager
const MONO = 'font-(family-name:--font-mono) tracking-[0.08em] uppercase'

export function ProjectManagerSection() {
  return (
    <section
      id="project-manager"
      aria-labelledby="project-manager-h"
      data-showcase="ground"
      className="landing-art grid gap-10 rounded-(--radius-card) border border-(--el-border) bg-(--el-showcase-ground) shadow-(--shadow-card) p-[calc(var(--spacing-card-padding)*2)] text-(--el-showcase-ground-text) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-[clamp(32px,5vw,72px)]"
    >
      <div>
        <span
          className={cn(
            MONO,
            'inline-flex items-center gap-2.5 text-[12px] font-medium text-(--el-showcase-highlight)',
          )}
        >
          <i
            aria-hidden="true"
            className="size-[9px] bg-(--el-showcase-highlight)"
          />
          {pm.eyebrow}
        </span>
        <h2
          id="project-manager-h"
          className="mt-4 mb-[18px] font-(family-name:--font-serif) text-[clamp(36px,4.2vw,68px)] leading-[0.96] font-bold tracking-[-0.035em] text-balance"
        >
          {pm.headline}
        </h2>
        <p className="mb-6 max-w-[44ch] text-[18px] text-(--el-showcase-ground-muted)">
          {pm.lede}
        </p>
        <ul className="mb-7 grid gap-2.5">
          {pm.points.map((point, i) => (
            <li
              key={point}
              className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 text-(--el-showcase-ground-muted)"
            >
              <i
                aria-hidden="true"
                className={cn(
                  'mt-2 size-2',
                  i === pm.points.length - 1
                    ? 'bg-(--el-showcase-highlight)'
                    : 'bg-(--el-showcase-ground-muted)',
                )}
              />
              {point}
            </li>
          ))}
        </ul>
        <div className="grid gap-2.5">
          <span
            className={cn(
              MONO,
              'text-[11px] text-(--el-showcase-ground-muted)',
            )}
          >
            {pm.importLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['codebase', true],
                ['jira', false],
                ['linear', false],
                ['plane', false],
              ] as const
            ).map(([key, primary]) => (
              <a
                key={key}
                href={IMPORT_DOOR}
                className={cn(
                  'inline-flex items-center rounded-(--radius-btn) border h-(--height-btn-lg) px-(--spacing-btn-x) text-[15px] font-medium no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-showcase-highlight)',
                  primary
                    ? 'border-(--el-showcase-highlight) bg-(--el-showcase-highlight) text-(--el-showcase-ground)'
                    : 'border-(--el-showcase-ground-rule) text-(--el-showcase-ground-text) hover:border-(--el-showcase-highlight)',
                )}
              >
                {pm.sources[key]}
              </a>
            ))}
          </div>
        </div>
      </div>

      <WeeklyReport />
    </section>
  )
}

function WeeklyReport() {
  const r = pm.report
  return (
    <figure
      aria-label={r.ariaLabel}
      data-showcase="ground-raised"
      className="m-0 grid content-start gap-3.5 self-center rounded-(--radius-card) bg-(--el-showcase-ground-raised) p-[22px]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <b className="text-[20px] tracking-[-0.02em]">{r.title}</b>
        <span
          className={cn(
            MONO,
            'text-[10.5px] text-(--el-showcase-ground-muted)',
          )}
        >
          {r.range}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            [14, r.done, false],
            [5, r.inProgress, false],
            [3, r.waiting, true],
          ] as const
        ).map(([n, label, yours]) => (
          <div
            key={label}
            className={cn(
              'grid gap-0.5 rounded-(--radius-control) p-3',
              yours
                ? 'bg-(--el-showcase-highlight) text-(--el-showcase-ground)'
                : 'bg-(--el-showcase-ground)',
            )}
          >
            <b className="text-[34px] leading-none tracking-[-0.03em]">{n}</b>
            <span
              className={cn(
                'text-[12.5px]',
                yours
                  ? 'text-(--el-showcase-ground)'
                  : 'text-(--el-showcase-ground-muted)',
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <ol className="grid">
        {r.log.map((row) => (
          <li
            key={row.what}
            className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-baseline gap-2.5 border-t border-(--el-showcase-ground-rule) py-[9px] text-[13.5px]"
          >
            <span
              className={cn(
                MONO,
                'text-[10.5px] text-(--el-showcase-ground-muted)',
              )}
            >
              {row.day}
            </span>
            <span>{row.what}</span>
            <span
              className={cn(
                MONO,
                'rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[10px] whitespace-nowrap',
                row.tone === 'you' &&
                  'bg-(--el-showcase-highlight) text-(--el-showcase-ground)',
                row.tone === 'cool' &&
                  'bg-(--el-showcase-field) text-(--el-showcase-field-text)',
                row.tone === 'plain' &&
                  'bg-(--el-showcase-ground-rule) text-(--el-showcase-ground-text)',
              )}
            >
              {row.state}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  )
}
