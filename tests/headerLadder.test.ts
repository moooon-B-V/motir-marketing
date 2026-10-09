import { describe, expect, it } from 'vitest'
import { LADDER_CLASSES } from '@/app/_components/headerLadder'
import { HEADER_LADDER, LOCALES } from '@/i18n/routing'

/*
 * The give-way ladder's two homes agree (MOTIR-7953): the widths live as data
 * in `i18n/routing.ts`, and as literal Tailwind classes in `headerLadder.ts`
 * because Tailwind cannot see a class built at runtime. Change one without the
 * other and this goes red. Whether the widths still FIT the copy is the browser
 * lane's question (`e2e/specs/languageSwitcher.spec.ts`).
 */

const width = (cls: string) => Number(/min-\[(\d+)px\]/.exec(cls)?.[1])

describe.each(LOCALES)('the %s rung classes', (locale) => {
  const { a, b } = HEADER_LADDER[locale]
  const classes = LADDER_CLASSES[locale]

  it('show Copy setup prompt from rung A', () => {
    expect(width(classes.setup)).toBe(a)
    expect(classes.setup).toMatch(/^hidden min-\[\d+px\]:inline-flex$/)
  })

  it('show the nav and Sign in, and hide the Menu, from rung B', () => {
    expect(width(classes.nav)).toBe(b)
    expect(width(classes.wide)).toBe(b)
    expect(width(classes.menu)).toBe(b)
    expect(classes.nav).toMatch(/^hidden min-\[\d+px\]:flex$/)
    expect(classes.menu).toMatch(/^min-\[\d+px\]:hidden$/)
  })

  it('folds rung A before rung B', () => {
    expect(a).toBeGreaterThan(b)
  })
})
