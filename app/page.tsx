import { Sparkles } from 'lucide-react'
import { copy } from '@/lib/copy'
import { FREE_DOOR } from '@/lib/destinations'
import { DoorCard } from './_components/DoorCard'
import { IdeaDoor } from './_components/IdeaDoor'
import { ImportDoor } from './_components/ImportDoor'
import { OpenCore } from './_components/OpenCore'
import { Pillars } from './_components/Pillars'
import { Proof } from './_components/Proof'
import { SiteFooter } from './_components/SiteFooter'
import { SiteHeader } from './_components/SiteHeader'

/*
 * motir.co — the public landing (MOTIR-1152 · 8.3.6).
 *
 * Layout and hierarchy from `design/marketing/` (MOTIR-1143); every word from
 * `messages/en.json` (MOTIR-1144); every primitive and token from
 * `@motir/design-system` and `@motir/brand`, installed from npm rather than
 * re-cut here.
 *
 * ⚠️ THE PAGE'S WHOLE JOB IS TO HAND A READER ACROSS, AND IT BUILDS NOTHING
 * BEHIND ITS OWN DOORS. No connect, import-source, index, generate or chat UI
 * ships on the marketing site — each of those is owned downstream (7.15 /
 * 7.17 / 7.3) and each door stops at the redirect. That boundary is what keeps
 * the split between the two properties legible instead of arbitrary: motir.co
 * decides WHO you are and hands you across; motir-core decides what happens
 * next. A flow surface on this side is a second, half-built onboarding.
 *
 * Server-rendered, with exactly two client islands — the top bar (its narrow
 * menu) and door 1 (its four states).
 */
export default function Page() {
  return (
    <div className="bg-(--el-page-bg) text-(--el-text)">
      <SiteHeader />

      <main>
        <div className="mx-auto max-w-[1080px] px-4 pt-12 pb-2 text-center sm:px-7 sm:pt-[72px]">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-(--radius-badge) bg-(--el-tint-lavender) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[12px] font-semibold text-(--el-text-strong)">
            <Sparkles aria-hidden="true" className="size-3.5" />
            {copy.landing.hero.eyebrow}
          </span>
          {/* Exactly ONE h1 on the page. Both fork doors take h2, the pillars
              take h3 — no level is skipped and none is chosen for its size. */}
          <h1 className="mb-3 font-(family-name:--font-serif) text-[30px] leading-[1.1] font-bold tracking-[-0.02em] text-(--el-text) sm:text-[46px]">
            {copy.landing.hero.headline}
          </h1>
          <p className="mx-auto max-w-[56ch] text-[14.5px] leading-relaxed text-(--el-text-secondary) sm:text-[16px]">
            {copy.landing.hero.lede}
          </p>

          {/*
           * THE FORK — doors 1 and 2, CO-EQUAL (Yue, 2026-08-28). Equal grid
           * tracks, `items-stretch` so both bottom their footers on the same
           * line, and NO `OR` DIVIDER: a divider is precisely what makes one
           * side an alternative to the other. A visitor arrives already
           * belonging to one of these two and the page must not tell them
           * which is the real way in.
           */}
          <div className="mt-7 grid items-stretch gap-[18px] text-left md:grid-cols-2">
            <DoorCard>
              <IdeaDoor />
            </DoorCard>
            <DoorCard>
              <ImportDoor />
            </DoorCard>
          </div>

          <p className="mx-0.5 mt-3 text-center text-[12.5px] text-(--el-text-secondary)">
            {copy.landing.doors.hint}
          </p>

          {/*
           * DOOR 3 (TERTIARY), half two of two: ONE line, not a third card.
           * A third co-equal card would make "project management only" one of
           * three equal things Motir is; it is not — it is the way in for
           * somebody who wants neither AI door, and it needs to be findable
           * rather than promoted. A nav entry plus a line is the convention
           * the mirror PM tools already use.
           */}
          <p className="mx-0.5 mt-3.5 text-center text-[13px] leading-relaxed text-(--el-text-secondary)">
            {copy.landing.doors.free.lead}{' '}
            <a
              href={FREE_DOOR}
              className="font-semibold text-(--el-link) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
            >
              {copy.landing.doors.free.cta}
            </a>{' '}
            {copy.landing.doors.free.tail}
          </p>
        </div>

        <section className="mt-11 border-t border-(--el-border) bg-(--el-surface-soft) px-4 py-9 sm:mt-[72px] sm:px-(--spacing-card-padding) sm:py-14">
          <Pillars />
          <OpenCore />
        </section>

        <Proof />
      </main>

      <SiteFooter />
    </div>
  )
}
