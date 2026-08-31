'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu } from 'lucide-react'
import { BrandMark } from '@motir/brand'
import { buttonVariants, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { DOCS, EXPLORE, FREE_DOOR, SIGN_IN } from '@/lib/destinations'

/*
 * The top bar — the `ExploreTopBar` pattern (`--el-surface-soft` fill, an
 * `--el-border` bottom hairline, the `py-3` rhythm), carrying DOOR 3's first
 * half: the `Start free` nav entry.
 *
 * ⚠️ THE CURRENT-PAGE ITEM IS `--el-accent-on-surface` AT `font-weight: 600` —
 * the pairing `ExploreTopBar` ships, byte for byte. This comment used to say
 * the opposite twice over, and BOTH halves are retired (MOTIR-1043 /
 * MOTIR-3874):
 *
 *   - *"no nav item here is ever the current page"* — true while motir.co was
 *     one page. `/design` is the site's first internal second route.
 *   - *"NO ACCENT-COLOURED TEXT: 4.41:1 in dark, under AA"* — a MEASUREMENT of
 *     `@motir/design-system@0.1.0`, and it named its own expiry condition.
 *     MOTIR-3872 published 0.1.1 with MOTIR-3745's and MOTIR-3774's lifted ink
 *     and this repository pins it: the same pair now measures **5.76:1** in
 *     dark and 6.29:1 in light, on `--el-surface-soft`, and the `md:hidden`
 *     panel's `--el-surface` reads 5.54:1 / 6.03:1. `tests/aaMatrix.test.ts`
 *     re-measures all four over every palette rather than trusting this note.
 *
 * The invented stand-in the old number forced — `--el-text` plus a 2px
 * `--el-accent` rule — is GONE rather than kept alongside: it existed only
 * because the accent ink failed AA, so a pattern that outlived its reason
 * would just be a pattern app.motir.co does not have. `font-weight: 600` is
 * retained and is the whole of WCAG 1.4.1 here — a non-colour channel carries
 * the state — and `aria-current="page"` carries it to assistive technology.
 *
 * The brand GLYPH keeps `--el-accent-on-surface` and is fine there — it is a
 * graphical object at 1.4.11's 3:1, not text.
 */

/*
 * `internal: true` is what makes an item a `next/link` with a current-page
 * treatment. Every other destination in this bar is a different ORIGIN, where
 * neither prefetching, client routing nor `aria-current` means anything.
 *
 * Explore is now same-origin (MOTIR-4045): `/explore` lives on this host, so it
 * is a `next/link` and marks itself current on the square AND its topic landing
 * pages. Docs remains cross-origin until its own card lands.
 */
const navItems = [
  { href: EXPLORE, label: copy.nav.explore, internal: true },
  { href: DOCS, label: copy.nav.docs, internal: false },
  { href: '/design', label: copy.nav.design, internal: true },
] as const

/** Whether an internal item is the page being read. Explore also covers its
 * topic landing pages, so it matches the `/explore/` prefix too. */
const isCurrent = (href: string, pathname: string) =>
  href === '/explore'
    ? pathname === '/explore' || pathname.startsWith('/explore/')
    : pathname === href

const NAV_ITEM = 'text-[13.5px]'
const NAV_REST = 'text-(--el-text-secondary) hover:text-(--el-text)'
const NAV_CURRENT = 'font-semibold text-(--el-accent-on-surface)'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="border-b border-(--el-border) bg-(--el-surface-soft)">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-(--spacing-card-padding) sm:py-3">
        {/* The ONE internal link on the page — motir.co's own root. Every
            other destination is a different ORIGIN and stays a plain `<a>`:
            `next/link` prefetches and client-routes, neither of which means
            anything across origins. */}
        <Link
          href="/"
          aria-label={copy.nav.brandAriaLabel}
          className="flex flex-none items-center"
        >
          {/* 26px in the bar, 22px in the footer — the §7c proportions. The
              accessible name comes from the visible wordmark and the glyph is
              aria-hidden inside BrandMark: a lockup is decoration plus visible
              text, never both an image and a label. */}
          <BrandMark size={26} label="Motir" />
        </Link>

        <nav
          aria-label={copy.nav.ariaLabel}
          className="hidden items-center gap-5 md:flex"
        >
          {navItems.map((item) =>
            item.internal ? (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isCurrent(item.href, pathname) ? 'page' : undefined
                }
                className={cn(
                  NAV_ITEM,
                  isCurrent(item.href, pathname) ? NAV_CURRENT : NAV_REST,
                )}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className={cn(NAV_ITEM, NAV_REST)}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <a
            href={SIGN_IN}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'hidden md:inline-flex',
            )}
          >
            {copy.nav.signIn}
          </a>
          {/* DOOR 3, half one of two. It is the LAST thing to leave the bar on
              a narrow viewport, not the first — it is the only door up here,
              and a visitor who wants the project-management tool has no other
              route in from the public web. */}
          <a href={FREE_DOOR} className={buttonVariants({ size: 'sm' })}>
            {copy.nav.startFree}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
          <button
            type="button"
            aria-label={copy.nav.menu}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-8 px-0 md:hidden',
            )}
          >
            <Menu aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {/*
       * ⚠️ ONE RUNG-1 FILL, DECLARED. The design asset draws this button and
       * says "the nav collapses behind the menu button", but depicts no OPEN
       * panel. What it does NOT leave open is the panel's CONTENT: these are
       * exactly the three items the same asset's desktop bar draws and that
       * the narrow bar drops. So the box is the only unspecified thing, and it
       * is composed from the bar's own tokens and the nav's own type scale —
       * no new vocabulary. Flagged on the pull request so it is cheap to
       * redirect; if a real mobile-nav design lands, this is the one block it
       * replaces.
       */}
      {menuOpen ? (
        <nav
          id="site-menu"
          aria-label={copy.nav.ariaLabel}
          className="flex flex-col gap-3 border-t border-(--el-border) px-4 py-3 md:hidden"
        >
          {/* The current-page treatment is drawn HERE TOO. It is a separate
              branch in the same component, which is exactly how a treatment
              ends up existing only on desktop — the design asset draws the
              open panel (panel 4) rather than describing it, for that
              reason. */}
          {[
            ...navItems,
            { href: SIGN_IN, label: copy.nav.signIn, internal: false },
          ].map((item) =>
            item.internal ? (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isCurrent(item.href, pathname) ? 'page' : undefined
                }
                className={cn(
                  NAV_ITEM,
                  isCurrent(item.href, pathname) ? NAV_CURRENT : NAV_REST,
                )}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className={cn(NAV_ITEM, NAV_REST)}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      ) : null}
    </header>
  )
}
