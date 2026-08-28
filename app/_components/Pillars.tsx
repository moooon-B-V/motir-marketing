import { Bot, LayoutGrid, Sparkles } from 'lucide-react'
import { Card, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'

/*
 * The three pillars — Motir's positioning, in the order and with the names the
 * standing three-pillar framing pins: AI planning · Project management · Agent
 * orchestration. Dropping the third describes a different, smaller product.
 *
 * Agents do ALL KINDS of work — design, decisions, content, tests, code — so
 * the third pillar's body says agents "take over the work", never "coding
 * agent", and never scoped to Motir-hosted ones: a reader may run their own.
 */

const pillars = [
  {
    ordinal: '01',
    tint: 'bg-(--el-tint-lavender)',
    icon: <Sparkles className="size-5" />,
    ...copy.landing.pillars.planning,
  },
  {
    ordinal: '02',
    tint: 'bg-(--el-tint-sky)',
    icon: <LayoutGrid className="size-5" />,
    ...copy.landing.pillars.projectManagement,
  },
  {
    ordinal: '03',
    tint: 'bg-(--el-tint-mint)',
    icon: <Bot className="size-5" />,
    ...copy.landing.pillars.agents,
  },
]

export function Pillars() {
  return (
    <>
      <div className="mx-auto mb-8 max-w-[720px] text-center">
        <span className="mb-2 block font-(family-name:--font-mono) text-[11px] font-semibold tracking-[0.06em] text-(--el-text-muted) uppercase">
          {copy.landing.pillars.eyebrow}
        </span>
        <h2 className="mb-2 font-(family-name:--font-serif) text-[26px] leading-[1.2] font-bold tracking-[-0.015em] text-(--el-text) sm:text-[30px]">
          {copy.landing.pillars.headline}
        </h2>
        <p className="mx-auto max-w-[58ch] text-[15px] leading-relaxed text-(--el-text-secondary)">
          {copy.landing.pillars.lede}
        </p>
      </div>
      <div className="mx-auto grid max-w-[1080px] gap-[18px] md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card
            key={pillar.ordinal}
            className="bg-(--el-page-bg) shadow-(--shadow-subtle)"
          >
            <article>
              <span
                aria-hidden="true"
                className={cn(
                  'mb-3.5 grid size-10 place-items-center rounded-(--radius-control) text-(--el-text-strong)',
                  pillar.tint,
                )}
              >
                {pillar.icon}
              </span>
              <span className="mb-1.5 block font-(family-name:--font-mono) text-[11px] font-semibold tracking-[0.06em] text-(--el-text-muted)">
                {pillar.ordinal}
              </span>
              <h3 className="mb-2 text-[17px] font-bold text-(--el-text)">
                {pillar.title}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-(--el-text-secondary)">
                {pillar.body}
              </p>
            </article>
          </Card>
        ))}
      </div>
    </>
  )
}
