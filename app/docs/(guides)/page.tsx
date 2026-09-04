import Link from 'next/link'
import { copy } from '@/lib/copy'
import { DOCS_SURFACES } from '@/lib/docsSurfaces'

/*
 * The docs index (MOTIR-4046) — where the top bar's `Docs` item lands, and the
 * page whose entire content is a list of what this area contains.
 *
 * ⚠️ IT DOES NOT KEEP ITS OWN LIST (MOTIR-4507). It used to: a `groups` array
 * here and `SURFACES` in `DocsRail.tsx` held the same fact, and when
 * MOTIR-4227 added `/docs/public-address` it reached the rail and not this
 * page. One section per surface, drawn from `lib/docsSurfaces.ts`, which is
 * also the rail's first tier — so a page added to that file arrives here with
 * no edit to this one, and there is no number in this comment to go stale.
 */

export default function DocsIndexPage() {
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.indexTitle}
      </h1>
      <p className="mt-2 max-w-[40rem] text-[14px] leading-relaxed text-(--el-text-secondary)">
        {copy.docs.indexIntro}
      </p>

      {DOCS_SURFACES.map((surface) => (
        <section key={surface.href} className="mt-8">
          <h2 className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text)">
            {surface.label}
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-(--el-border) border-y border-(--el-border)">
            {/* The surface's own page first, then the pages inside it — the
                same order the rail's two tiers read, so a reader who has used
                one recognises the other. */}
            {[surface, ...surface.pages].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 py-4 hover:bg-(--el-surface-soft)"
                >
                  <span className="text-[14px] font-semibold text-(--el-text)">
                    {item.label}
                  </span>
                  <span className="text-[13px] text-(--el-text-secondary)">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
