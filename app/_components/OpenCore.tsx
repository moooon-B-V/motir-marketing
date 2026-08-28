import { GitFork } from 'lucide-react'
import { Card } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { SOURCE_REPO } from '@/lib/destinations'

/*
 * Open core, as POSITIONING rather than a footnote — a full-width row under
 * the pillars. It is deliberately NOT drawn as a fourth pillar: the three
 * pillars are what Motir IS, and this is how it is licensed and distributed.
 */
export function OpenCore() {
  return (
    /* ⚠️ THE FLEX GOES ON `[&>div]`, NOT ON THE CARD. `Card` renders
       `outer > div(children)`, so a `flex` on the outer lays out that single
       wrapper and leaves the tile stacked ABOVE the text — which is what this
       row looked like until it was rendered. It stacks on a narrow viewport by
       design (`.mobile .opencore { flex-direction: column }`) and sits beside
       its tile from `sm` up. */
    <Card className="mx-auto mt-6 max-w-[1080px] bg-(--el-page-bg) [&>div]:flex [&>div]:flex-col [&>div]:gap-4 sm:[&>div]:flex-row sm:[&>div]:items-start">
      <span
        aria-hidden="true"
        className="grid size-10 flex-none place-items-center rounded-(--radius-control) bg-(--el-tint-peach) text-(--el-text-strong)"
      >
        <GitFork className="size-5" />
      </span>
      <div>
        <h3 className="mb-1.5 text-[16px] font-bold text-(--el-text)">
          {copy.landing.openCore.title}
        </h3>
        <p className="max-w-[72ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
          {copy.landing.openCore.body}{' '}
          {/* The one destination on this page that is NOT motir-core's origin,
              and so is not built from the configured variable. */}
          <a
            href={SOURCE_REPO}
            className="font-semibold text-(--el-link) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
          >
            {copy.landing.openCore.cta} →
          </a>
        </p>
      </div>
    </Card>
  )
}
