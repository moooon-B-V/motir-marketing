'use client'

import { useState } from 'react'
import Link from 'next/link'
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
 * ⚠️ NO ACCENT-COLOURED TEXT IN THIS BAR, and that is a measurement rather
 * than a preference. `--el-accent-on-surface` as TEXT on `--el-surface-soft`
 * is 4.41:1 in the dark theme — under AA — which is exactly the pairing
 * `ExploreTopBar` ships for its `aria-current` item (MOTIR-3745). motir.co is
 * the root, so no nav item here is ever the current page and there is nothing
 * to mark: the nav is `--el-text-secondary` and the CTA is a filled Button.
 * Do not reintroduce the pattern by marking an item current.
 *
 * The brand GLYPH keeps `--el-accent-on-surface` and is fine there — it is a
 * graphical object at 1.4.11's 3:1, not text.
 */

const navItems = [
  { href: EXPLORE, label: copy.nav.explore },
  { href: DOCS, label: copy.nav.docs },
]

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

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
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13.5px] text-(--el-text-secondary) hover:text-(--el-text)"
            >
              {item.label}
            </a>
          ))}
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
          {[...navItems, { href: SIGN_IN, label: copy.nav.signIn }].map(
            (item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13.5px] text-(--el-text-secondary) hover:text-(--el-text)"
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
