import { copy } from '@/lib/copy'

/*
 * The GEO FAQ block + its Q/A feed (MOTIR-4045). A concise, citable lead
 * paragraph + a small Q/A set, rendered as semantic <h2> + <dl>; the SAME Q/A
 * feed the FAQPage JSON-LD (so answer engines cite both).
 */

export interface ExploreFaqItem {
  q: string
  a: string
}

export function exploreFaqItems(): ExploreFaqItem[] {
  return [
    { q: copy.explore.faqQ1, a: copy.explore.faqA1 },
    { q: copy.explore.faqQ2, a: copy.explore.faqA2 },
    { q: copy.explore.faqQ3, a: copy.explore.faqA3 },
  ]
}

export function ExploreFaq() {
  const items = exploreFaqItems()
  return (
    <section
      aria-labelledby="explore-faq-heading"
      data-showcase="ground"
      className="landing-art rounded-(--radius-card) border border-(--el-border) bg-(--el-showcase-ground) p-[calc(var(--spacing-card-padding)*2)] text-(--el-showcase-ground-text) shadow-(--shadow-card)"
    >
      <h2
        id="explore-faq-heading"
        className="m-0 font-(family-name:--font-serif) text-[clamp(28px,3.2vw,48px)] leading-[1] font-bold tracking-[-0.03em]"
      >
        {copy.explore.faqHeading}
      </h2>
      <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-(--el-showcase-ground-muted)">
        {copy.explore.faqLede}
      </p>
      <dl className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.q}
            data-showcase="ground-raised"
            className="rounded-(--radius-card) border border-(--el-showcase-ground-rule) bg-(--el-showcase-ground-raised) p-(--spacing-card-padding)"
          >
            <dt className="text-[16px] font-semibold text-(--el-showcase-ground-text)">
              {item.q}
            </dt>
            <dd className="mt-2 text-[14px] leading-relaxed text-(--el-showcase-ground-muted)">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
