import {
  Activity,
  Bug,
  FilePenLine,
  ChevronDown,
  ChevronRight,
  CircleCheckBig,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button, Pill } from '@motir/design-system'
import { useCopy } from '@/lib/copy'
import { Bubble, Composer, RailHeader } from './PlannerUi'
import { Frame } from './realUi'

/*
 * Motir AI Debugging's pictures, drawn from the REAL screens (2026-10
 * redesign): a bug's Errors section with its evidence open
 * (`MonitorErrorsCard` / `MonitorErrorEvidence`), the AI-written Explanation
 * and Description (`ContentSectionCard`, `IssueExplanation`, and the sections
 * `author_bug` must write — `lib/ai/authoredBug.ts`), and the Monitoring room
 * connected (`MonitoringRoom`). Same markup, same element tokens, the design
 * system's own `Button` and `Pill`.
 *
 * One wording change from the app: the app calls Sentry's records "issues";
 * motir.co's copy never says "issue", so here they are errors, as in the docs.
 */

/** `ContentSectionCard`'s header: title, gloss, an optional badge. */
function SectionCard({
  title,
  gloss,
  extra,
  right,
  children,
}: Readonly<{
  title: string
  gloss: string
  extra?: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
}>) {
  return (
    <div className="rounded-(--radius-card) border border-(--el-border) bg-(--el-card) p-(--spacing-card-padding) shadow-(--shadow-card)">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-sans text-base font-semibold text-(--el-text)">
          {title}
        </span>
        <span className="font-sans text-sm text-(--el-text-secondary)">
          {gloss}
        </span>
        {extra}
        {right ? (
          <div className="ml-auto flex items-center">{right}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

const LABEL =
  'mb-1 font-mono text-[11px] font-semibold tracking-[0.06em] text-(--el-text-secondary) uppercase'

/** The bug's Errors section: one linked Sentry error, evidence open. */
export function ErrorsUi() {
  const u = useCopy().products.aiDebugging.ui
  const e = u.error
  return (
    <Frame className="bg-(--el-page-bg) p-3">
      <SectionCard
        title={u.errorsTitle}
        gloss={u.errorsGloss}
        right={
          <Button variant="secondary" size="sm">
            {u.linkError}
          </Button>
        }
      >
        <div className="rounded-(--radius-control) border border-(--el-border) bg-(--el-surface) px-(--spacing-control-x) py-(--spacing-control-y)">
          <div className="flex flex-wrap items-center gap-2.5 gap-y-1">
            <Activity className="h-[17px] w-[17px] shrink-0 text-(--el-icon-muted)" />
            <div className="min-w-0 flex-1 py-1">
              <span className="block truncate font-sans text-[13.5px] font-medium text-(--el-text)">
                {e.title}
              </span>
              <span className="block truncate font-sans text-xs text-(--el-text-identifier)">
                {e.where}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-2.5">
              <Pill severity="danger">{e.level}</Pill>
              <span className="font-sans text-xs whitespace-nowrap text-(--el-text-secondary)">
                {e.seenPre}
                <b className="text-[13px] font-semibold text-(--el-text) tabular-nums">
                  {e.count}
                </b>
                {e.seenPost}
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-(--el-icon-muted)" />
          </div>
          <div className="mt-0.5 mb-1 ml-[27px] flex items-center gap-1.5 py-[3px] pr-1.5 pl-0.5 font-sans text-xs leading-snug text-(--el-text-secondary)">
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            <b className="shrink-0 font-semibold whitespace-nowrap text-(--el-text)">
              {e.hideEvidence}
            </b>
            <span className="min-w-0 truncate">{e.summary}</span>
          </div>
          <div className="mt-1 mb-1.5 ml-[27px] flex flex-col gap-3 rounded-(--radius-control) border border-(--el-border-soft) bg-(--el-card) p-3">
            <div>
              <div className={LABEL}>{e.exception}</div>
              <div className="rounded-(--radius-control) bg-(--el-code-bg) px-2.5 py-2 font-mono text-xs leading-normal [overflow-wrap:anywhere] whitespace-pre-wrap text-(--el-code-text)">
                <span className="font-semibold">{e.exceptionType}</span>
                {e.exceptionMessage}
              </div>
            </div>
            <div>
              <div className={LABEL}>
                {e.stack}{' '}
                <span className="font-normal tracking-normal normal-case">
                  {e.stackGloss}
                </span>
              </div>
              <ul className="m-0 list-none rounded-(--radius-control) bg-(--el-code-bg) p-0">
                {e.frames.map(([at, fn]) => (
                  <li
                    key={at}
                    className="flex flex-wrap items-baseline gap-x-2 border-t border-(--el-border-soft) px-2.5 py-1 font-mono text-xs leading-normal first:border-t-0"
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere] text-(--el-code-text)">
                      {at}
                    </span>
                    <span className="[overflow-wrap:anywhere] text-(--el-text-strong)">
                      {fn}
                    </span>
                  </li>
                ))}
                <li className="flex w-full items-center gap-1.5 border-t border-(--el-border-soft) px-2.5 py-1.5 font-sans text-xs text-(--el-text-secondary)">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {e.showFramework}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SectionCard>
    </Frame>
  )
}

/** The bug as AI wrote it: its Explanation and its Description. */
export function PlannedBugUi() {
  const u = useCopy().products.aiDebugging.ui
  const drafted = (
    <Pill tone="neutral">
      <Sparkles className="h-3 w-3" />
      {u.aiDrafted}
    </Pill>
  )
  return (
    <Frame className="grid gap-3 bg-(--el-page-bg) p-3">
      <SectionCard
        title={u.explanation}
        gloss={u.explanationGloss}
        extra={drafted}
      >
        <p className="m-0 font-sans text-sm leading-relaxed text-(--el-text)">
          {u.explanationBody}
        </p>
      </SectionCard>
      <SectionCard title={u.description} gloss={u.descriptionGloss}>
        <div className="grid gap-3 font-sans text-sm leading-relaxed text-(--el-text)">
          {u.sections.map((section) => (
            <div key={section.heading}>
              <p className="m-0 mb-1 text-[15px] font-semibold">
                {section.heading}
              </p>
              {'note' in section && section.note ? (
                <p className="m-0 mb-1 text-(--el-text-secondary) italic">
                  {section.note}
                </p>
              ) : null}
              <ul className="m-0 grid list-disc gap-0.5 pl-5">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className={
                      section.heading === 'Context refs'
                        ? 'font-mono text-xs'
                        : undefined
                    }
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SectionCard>
    </Frame>
  )
}

/** The design system's `Switch`, on — its markup, since a picture has nothing to toggle. */
function SwitchOn() {
  return (
    <span className="relative mt-px inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-(--el-switch-on-border) bg-(--el-switch-on)">
      <span className="inline-block size-3.5 translate-x-[18px] rounded-full bg-(--el-switch-knob) shadow-(--shadow-subtle)" />
    </span>
  )
}

/** The Monitoring room with Sentry connected and one project monitored. */
export function MonitoringUi() {
  const u = useCopy().products.aiDebugging.ui
  return (
    <Frame className="bg-(--el-page-bg) p-5">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-(family-name:--font-serif) text-2xl font-semibold text-(--el-text)">
            {u.monitoring}
          </span>
          <span className="font-sans text-sm text-(--el-text-secondary)">
            {u.monitoringBody}
          </span>
        </div>
        <div className="flex flex-wrap items-start gap-3 rounded-(--radius-card) border border-(--el-border) bg-(--el-card) p-(--spacing-card-padding)">
          <span className="grid size-[34px] flex-none place-items-center rounded-(--radius-control) border border-(--el-border-soft) bg-(--el-surface-soft) text-(--el-icon-muted)">
            <Activity className="size-[18px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="flex items-center gap-2 font-sans text-sm font-semibold text-(--el-text)">
              {u.sentry}
              <span className="inline-flex items-center gap-1.5 rounded-(--radius-badge) bg-(--el-success-surface) px-(--spacing-chip-x) py-(--spacing-chip-y) font-sans text-xs font-medium text-(--el-text-strong)">
                <CircleCheckBig className="size-3.5 text-(--el-success)" />
                {u.connected}
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-sans text-xs text-(--el-text-secondary)">
              <span className="font-mono">{u.org}</span>
              <span>·</span>
              {u.checked}
            </span>
          </span>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
          >
            {u.recheck}
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] font-semibold tracking-[0.06em] text-(--el-text-secondary) uppercase">
            {u.monitored}
          </span>
          <span className="font-sans text-[13px] leading-relaxed text-(--el-text-secondary)">
            {u.monitoredBody}
          </span>
          <div className="flex flex-col gap-2 rounded-(--radius-card) border border-(--el-border) bg-(--el-card) px-3.5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <Bug className="size-[18px] flex-none text-(--el-icon-muted)" />
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="font-mono text-sm font-semibold text-(--el-text)">
                  {u.project}
                </span>
                <span className="font-sans text-xs text-(--el-text-secondary)">
                  {u.bound}
                </span>
                <span className="font-sans text-xs text-(--el-text-secondary)">
                  {u.poll}
                  <b className="font-semibold text-(--el-text-strong)">
                    {u.filed}
                  </b>
                </span>
              </span>
              <span className="flex flex-none items-center gap-2">
                <span className="font-sans text-xs text-(--el-text-secondary)">
                  {u.minLevel}
                </span>
                <span className="inline-flex h-(--height-control) min-w-[9rem] items-center justify-between gap-2 rounded-(--radius-input) border border-(--el-border) bg-(--el-page-bg) px-(--spacing-control-x) font-sans text-sm text-(--el-text)">
                  {u.everyLevel}
                  <ChevronDown className="size-4 text-(--el-icon-muted)" />
                </span>
              </span>
              <Trash2 className="size-4 flex-none text-(--el-icon-muted)" />
            </div>
            <div className="ml-[30px] flex flex-col gap-2.5 border-t border-(--el-border-soft) pt-2.5">
              <span className="font-sans text-xs text-(--el-text-secondary)">
                {u.sync}
              </span>
              {u.toggles.map(([title, help]) => (
                <div key={title} className="flex items-start gap-2.5">
                  <SwitchOn />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-sans text-[13px] font-medium text-(--el-text)">
                      {title}
                    </span>
                    <span className="font-sans text-xs text-(--el-text-secondary)">
                      {help}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Button variant="secondary" size="sm">
              {u.add}
            </Button>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/** The `.wi-chip` a debug outcome line names its card with (markdown-editor.css). */
function WorkItemChip({
  itemKey,
  title,
}: Readonly<{ itemKey: string; title: string }>) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-(--radius-control) border border-(--el-border) bg-(--el-surface-soft) px-(--spacing-kbd-x) py-(--spacing-kbd-y) align-baseline text-[0.92em] leading-[1.35] whitespace-nowrap text-(--el-text)">
      <Bug className="h-[13px] w-[13px] text-(--el-type-bug)" />
      <span className="font-mono text-[0.9em] font-medium text-(--el-link)">
        {itemKey}
      </span>
      <span className="text-(--el-text)">{title}</span>
    </span>
  )
}

/** A debug turn in the Motir AI rail, finished: the acts, the diagnosis, the one write. */
export function DebugTurnUi() {
  const u = useCopy().products.aiDebugging.ui
  const g = u.debug
  return (
    <Frame className="mx-auto w-full max-w-[540px]">
      <div className="flex flex-col bg-(--el-surface)">
        <RailHeader mode={g.mode} />
        <div className="flex flex-col gap-3 px-4 py-4">
          <Bubble role="user">{g.user}</Bubble>
          <div className="ml-9 flex flex-col gap-1.5 rounded-(--radius-card) bg-(--el-surface-soft) px-3 py-2">
            {g.acts.map(([label, line]) => (
              <div
                key={line}
                className="flex items-start gap-2 text-xs text-(--el-text-secondary)"
              >
                <span className="mt-px w-16 shrink-0 font-mono text-[10px] font-semibold tracking-wide text-(--el-text-secondary) uppercase">
                  {label}
                </span>
                <span className="min-w-0 flex-1">{line}</span>
              </div>
            ))}
          </div>
          <Bubble role="assistant">
            <span className="block">
              <b className="font-semibold">{g.causeLabel}</b> {g.cause}
            </span>
            <span className="mt-1.5 block">{g.cause2}</span>
            <span className="mt-1.5 flex items-start gap-1.5 border-t border-(--el-border-soft) pt-1.5 text-xs text-(--el-text)">
              <FilePenLine className="mt-px size-3.5 flex-none text-(--el-text-secondary)" />
              <span className="min-w-0">
                {g.outcomePre}
                <WorkItemChip itemKey={g.outcomeKey} title={g.outcomeTitle} />
                {g.outcomePost}
              </span>
            </span>
          </Bubble>
        </div>
        <Composer />
      </div>
    </Frame>
  )
}

/** A run's "What this run produced" strip (`RunFindings`), with the bug it filed. */
export function RunFindingsUi() {
  const u = useCopy().products.aiDebugging.ui
  const r = u.run
  return (
    <Frame className="bg-(--el-page-bg)">
      <div className="flex items-center gap-3 border-b border-(--el-border) px-(--spacing-card-padding) py-3">
        <span className="min-w-0 flex-1 truncate font-sans text-sm font-semibold text-(--el-text)">
          {r.title}
        </span>
        <Pill status="in-progress">{r.status}</Pill>
      </div>
      <div className="flex shrink-0 flex-col border-b border-(--el-border-soft) bg-(--el-surface-soft)">
        <div className="flex items-baseline gap-2 px-(--spacing-card-padding) py-1.5 text-xs">
          <span className="size-2 flex-none translate-y-px rounded-(--radius-badge) bg-(--el-type-bug)" />
          <span className="min-w-0 flex-1 text-(--el-text)">
            <strong className="font-medium">{r.bugFiled}</strong>
            <span className="font-mono"> · {r.key}</span>
          </span>
          <span className="flex-none font-medium text-(--el-accent-on-surface)">
            {r.open}
          </span>
        </div>
      </div>
      <div className="grid gap-1 p-(--spacing-card-padding)">
        <span className="flex items-center gap-2 font-sans text-sm font-semibold text-(--el-text)">
          <Bug className="size-4 text-(--el-type-bug)" />
          <span className="font-mono text-xs font-normal text-(--el-text-secondary)">
            {r.key}
          </span>
          {r.bugTitle}
        </span>
        <span className="font-sans text-sm text-(--el-text-secondary)">
          <b className="font-semibold text-(--el-text)">
            {r.found.split(':')[0]}:
          </b>
          {r.found.slice(r.found.indexOf(':') + 1)}
        </span>
      </div>
    </Frame>
  )
}
