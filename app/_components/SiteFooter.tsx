import Link from 'next/link'
import { BrandMark } from '@motir/brand'
import { copy, format } from '@/lib/copy'
import {
  DOCS,
  EXPLORE,
  FREE_DOOR,
  LEGAL_INDEX,
  LEGAL_PRIVACY,
  LEGAL_TERMS,
  SIGN_IN,
  SOURCE_REPO,
} from '@/lib/destinations'

/*
 * The footer — the `ExploreFooter` four-column shape: the brand column plus
 * Product / Resources / Legal, then the legal strip.
 *
 * ⚠️ EVERY ITEM HERE RESOLVES, AND THE ONES THAT DO NOT ARE ABSENT RATHER THAN
 * DRAWN AS LABELS. The design asset's own footer sketches `Overview`,
 * `Pricing`, `Blog`, `About` and `Contact` as plain text for pages that do not
 * exist yet. This ships the rule the same asset applies ONE SECTION UP, where
 * it drops `Product` and `Pricing` from the nav because they "render as dead
 * text there and are simply absent here" — and it means the footer needs no
 * copy MOTIR-1144 did not write. When those pages land they arrive with their
 * own strings and their own links.
 *
 * MOTIR-1144's catalogue supplies exactly these nine items and three headings;
 * the mapping below spends all of them and invents none.
 */

const columns = [
  {
    heading: copy.footer.productHeading,
    items: [
      { href: FREE_DOOR, label: copy.footer.startFree },
      { href: SIGN_IN, label: copy.footer.signIn },
    ],
  },
  {
    heading: copy.footer.resourcesHeading,
    items: [
      { href: EXPLORE, label: copy.footer.explore },
      { href: DOCS, label: copy.footer.docs },
      { href: SOURCE_REPO, label: copy.footer.github },
    ],
  },
  {
    heading: copy.footer.legalHeading,
    items: [
      { href: LEGAL_PRIVACY, label: copy.footer.privacy },
      { href: LEGAL_TERMS, label: copy.footer.terms },
      { href: LEGAL_INDEX, label: copy.footer.legalIndex },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer
      aria-label={copy.footer.ariaLabel}
      className="grid gap-8 border-t border-(--el-border) bg-(--el-surface-soft) px-4 py-10 sm:grid-cols-2 sm:px-(--spacing-card-padding) lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
    >
      <div>
        {/* The ONE internal link in the footer — motir.co's own root. Every
            other destination below is a different ORIGIN and stays a plain
            `<a>`. */}
        <Link
          href="/"
          aria-label={copy.nav.brandAriaLabel}
          className="inline-flex"
        >
          <BrandMark size={22} label="Motir" />
        </Link>
        <p className="mt-2.5 max-w-[30rem] text-[13px] leading-relaxed text-(--el-text-secondary)">
          {copy.footer.tagline}
        </p>
        <p className="mt-2 max-w-[30rem] text-[13px] leading-relaxed text-(--el-text-secondary)">
          {copy.footer.openSource}
        </p>
      </div>

      {columns.map((column) => (
        <div key={column.heading}>
          <h2 className="mb-2.5 text-[12px] font-semibold tracking-[0.04em] text-(--el-text-secondary) uppercase">
            {column.heading}
          </h2>
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {column.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[13px] text-(--el-text-secondary) hover:text-(--el-link) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/*
       * ⚠️ `--el-text-secondary`, NOT `--el-text-muted` (MOTIR-3984). This strip
       * sits on the footer's own `--el-surface-soft` band with no `Card` between
       * it and that fill, and the muted ink on that band is **4.34:1** in the
       * light `motir` palette — under the 4.5:1 WCAG 1.4.3 asks of 12px text,
       * and `motir` is the palette a first-time visitor is served. `theme.css`
       * states the figure at the token's own declaration and adds the rule in
       * its own words: "a muted caption belongs inside a card, never on a panel"
       * (MOTIR-2455). Secondary on the same band is what the rest of this footer
       * already uses, and it is what `design/marketing/` draws.
       */}
      <div className="col-span-full border-t border-(--el-border) pt-4 text-[12px] text-(--el-text-secondary)">
        {/*
         * ⚠️ The year is computed on the SERVER, at render. This page is
         * statically rendered, so it is the BUILD's year rather than the
         * reader's — which is the honest trade for a legal strip: a client-side
         * `new Date()` would differ between the server HTML and the first
         * client render and hydrate-mismatch on every New Year's Eve, for a
         * line nobody reads. A redeploy refreshes it.
         */}
        {format(copy.footer.copyright, { year: new Date().getFullYear() })} ·{' '}
        {copy.footer.entity}
      </div>
    </footer>
  )
}
