import { ArrowRight } from 'lucide-react'
import { useCopy } from '@/lib/copy'
import { FREE_DOOR } from '@/lib/destinations'

/*
 * The Build in public page's closing band (2026-10 redesign): the landing's
 * accent field, inviting the reader to build their own project in public —
 * the app's "Build in public" switch, reached through a free account.
 */
export function ExploreClose() {
  const c = useCopy().explore.close
  return (
    <section
      aria-labelledby="explore-close-h"
      data-showcase="field"
      className="landing-art mk-halftone grid gap-6 overflow-hidden rounded-(--radius-card) border border-(--el-border) bg-(--el-showcase-field) p-[calc(var(--spacing-card-padding)*2)] text-(--el-showcase-field-text) shadow-(--shadow-card) md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
    >
      <div className="grid gap-3">
        <h2
          id="explore-close-h"
          className="m-0 font-(family-name:--font-serif) text-[clamp(40px,5.4vw,80px)] leading-[0.94] font-bold tracking-[-0.035em]"
        >
          {c.headline}
        </h2>
        <p className="m-0 max-w-[52ch] text-[18px]">{c.body}</p>
      </div>
      <a
        href={FREE_DOOR}
        className="inline-flex h-(--height-btn-lg) items-center gap-2 justify-self-start rounded-(--radius-btn) bg-(--el-showcase-field-text) px-(--spacing-btn-x) text-[15px] font-medium text-(--el-showcase-field) no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-showcase-field-text)"
      >
        {c.cta}
        <ArrowRight aria-hidden="true" className="size-4" />
      </a>
    </section>
  )
}
