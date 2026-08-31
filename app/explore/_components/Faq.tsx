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
      className="rounded-(--radius-card) border border-(--el-border) bg-(--el-tint-mint) p-(--spacing-card-padding)"
    >
      <h2
        id="explore-faq-heading"
        className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text-strong)"
      >
        {copy.explore.faqHeading}
      </h2>
      <p className="mt-2 max-w-[48rem] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        {copy.explore.faqLede}
      </p>
      <dl className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.q}
            className="rounded-(--radius-card) border border-(--el-border-soft) bg-(--el-surface) p-4"
          >
            <dt className="text-sm font-semibold text-(--el-text)">{item.q}</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-(--el-text-secondary)">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
