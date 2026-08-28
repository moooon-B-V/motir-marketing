import { copy } from '@/lib/copy'

/*
 * The directory-listing band. THE SLOTS ARE DRAWN HERE AND THE CONTENT IS NOT
 * THIS CARD'S — MOTIR-1156 (8.3.9) owns the listings and their wording, and
 * each badge it lands will be an image owing real `alt` text naming the
 * directory.
 *
 * Until then they are dashed, captioned placeholders rather than links: a
 * tinted chip that looks like a badge and goes nowhere is worse than an empty
 * slot, and a dead outbound link is something a crawler follows.
 */
export function Proof() {
  return (
    <section className="border-t border-(--el-border) bg-(--el-page-bg) px-4 py-10 text-center sm:px-(--spacing-card-padding)">
      <p className="mb-4 font-(family-name:--font-mono) text-[11px] font-semibold tracking-[0.08em] text-(--el-text-muted) uppercase">
        {copy.landing.proof.caption}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {copy.landing.proof.slots.map((slot) => (
          <span
            key={slot}
            className="inline-flex h-11 items-center gap-2 rounded-(--radius-control) border border-dashed border-(--el-border-strong) bg-(--el-surface) px-4 text-[12.5px] font-semibold text-(--el-text-secondary)"
          >
            {slot}
          </span>
        ))}
      </div>
    </section>
  )
}
