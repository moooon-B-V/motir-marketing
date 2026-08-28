import type { ReactNode } from 'react'
import { Card, cn } from '@motir/design-system'

/*
 * The shared shell of the two CO-EQUAL fork doors.
 *
 * ⚠️ THE POINT OF THIS COMPONENT IS THAT THERE IS EXACTLY ONE OF IT. Yue's
 * 2026-08-28 revision made "I have an existing project" first-class, and the
 * asset spells out what co-equality is expressed as so it cannot erode one
 * attribute at a time: the same grid track, the same `--el-accent` border, the
 * same `--shadow-elevated`, the same `<h2>`, the same tinted tile, the same
 * primary Button. Two hand-kept-in-agreement copies is how that erodes. Do not
 * add a `primary` prop.
 *
 * `Card` supplies the radius, the padding and the transition; the three
 * overrides below are the door treatment on top of it — an accent border in
 * place of the hairline, the elevated shadow, and the page canvas rather than
 * the card fill, all as the asset's primitive table specifies. `tailwind-merge`
 * inside `Card` resolves each against the class it replaces.
 *
 * `Card` renders a `<div>`, so door 1's `<form>` sits INSIDE it rather than
 * replacing it — the primitive has no polymorphic escape hatch and inventing
 * one here would fork it.
 *
 * The `[&>div]` selector reaches Card's own children wrapper. Card renders
 * `outer > div(children)`, so a `flex-1` on the door's content would otherwise
 * measure against a wrapper that does not grow — and the two doors would stop
 * bottoming their footers on the same line, which is one of the attributes the
 * paragraph above says may not erode.
 */
export function DoorCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <Card
      className={cn(
        'flex flex-col border-(--el-accent) bg-(--el-page-bg) shadow-(--shadow-elevated)',
        '[&>div]:flex [&>div]:flex-1 [&>div]:flex-col',
        className,
      )}
    >
      {children}
    </Card>
  )
}

/** The door's head — a tinted icon tile beside an `<h2>` and one line. */
export function DoorHead({
  tint,
  icon,
  title,
  description,
}: {
  tint: 'lavender' | 'sky'
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        aria-hidden="true"
        className={cn(
          'grid size-[38px] flex-none place-items-center rounded-(--radius-control) text-(--el-text-strong)',
          tint === 'lavender'
            ? 'bg-(--el-tint-lavender)'
            : 'bg-(--el-tint-sky)',
        )}
      >
        {icon}
      </span>
      <div>
        {/* Both doors take `h2`, and that is a co-equality requirement rather
            than a formatting one: a reader navigating by heading meets two
            peers, which is the decision expressed in the one channel the
            visual treatment does not reach. */}
        <h2 className="mb-1 text-[17px] font-bold text-(--el-text)">{title}</h2>
        <p className="text-[13px] leading-normal text-(--el-text-secondary)">
          {description}
        </p>
      </div>
    </div>
  )
}

/** The mono uppercase field label both doors use above their body. */
export function DoorLabel({
  children,
  htmlFor,
}: {
  children: ReactNode
  htmlFor?: string
}) {
  /* `--el-text-muted`, NOT `--el-text-faint`, and the divergence from the
     `/onboarding` entrance is deliberate and on the record: theme.css marks
     faint as decoration/disabled ONLY (2.37–2.82:1 on every surface, both
     themes). A field label is active informational text, which WCAG does not
     exempt. Muted is 4.54:1 on this card. */
  const className =
    'mb-2 block font-(family-name:--font-mono) text-[11px] font-semibold tracking-[0.05em] text-(--el-text-muted) uppercase'
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <span className={className}>{children}</span>
  )
}

/** The footer row: the counter slot on the left, the primary action on the right. */
export function DoorFoot({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-(--el-border-soft) pt-[13px]">
      {children}
    </div>
  )
}
