import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'

/*
 * The lesson library picture on Motir AI Planner's page (2026-10 redesign), in
 * the landing's flat showcase language. Lessons live on the platform side and
 * have no screen a customer sees, so this one is an illustration rather than a
 * mock of the app (the page's other pictures are, `./PlannerUi`). Every colour
 * is a design-system token and every shape a style token. Decorative: it sits
 * beside the copy that says the same thing.
 */

const a = copy.products.aiPlanner
const MONO = 'font-(family-name:--font-mono) tracking-[0.06em] uppercase'

function Panel({
  showcase,
  className,
  children,
}: Readonly<{
  showcase: 'wash'
  className: string
  children: React.ReactNode
}>) {
  return (
    <div
      aria-hidden="true"
      data-showcase={showcase}
      data-tilt=""
      className={cn(
        'landing-art relative overflow-hidden rounded-(--radius-card) border border-(--el-border) p-[calc(var(--spacing-card-padding)*1.25)] shadow-(--shadow-elevated)',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** The lesson library every new plan reads first. */
export function LessonsArt() {
  const l = a.learns
  return (
    <Panel
      showcase="wash"
      className="bg-(--el-showcase-wash) text-(--el-showcase-text)"
    >
      <p
        className={cn(
          MONO,
          'm-0 mb-3 text-[11px] text-(--el-showcase-field-ink)',
        )}
      >
        {l.library}
      </p>
      <ul className="m-0 grid list-none gap-2 p-0">
        {l.lessons.map(([lesson, used]) => (
          <li
            key={lesson}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-(--radius-control) bg-(--el-showcase-paper) px-(--spacing-control-x) py-(--spacing-control-y)"
          >
            <span className="text-[14.5px]">{lesson}</span>
            <span
              className={cn(
                MONO,
                'rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[10px] whitespace-nowrap',
                used === 'New'
                  ? 'bg-(--el-showcase-decision) text-(--el-showcase-decision-text)'
                  : 'text-(--el-showcase-muted)',
              )}
            >
              {used}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
