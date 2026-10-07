import { THEME_STORAGE_KEYS, themeInitScript } from '@motir/design-system'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/*
 * The palette a motir.co visitor is served before first paint (MOTIR-6616).
 *
 * motir.co owns no default palette: `app/layout.tsx` inlines the package's
 * `themeInitScript` in <head>, and that script decides `data-palette` for
 * every page. So a pin that predates MOTIR-6471's rename served the warm
 * scheme under the name "motir" long after the product had moved to the
 * monochrome one. What is asserted here is the script this repository
 * actually INSTALLS, executed the way the browser executes it, so a pin that
 * slides back to a pre-rename version turns this file red.
 *
 * The two storage cases are the visitors who picked a palette on `/design`
 * while the site was on 0.1.x. Their stored ids carry the OLD meanings, and
 * the script has to read them through its migration once rather than reset
 * them to the default or, worse, hand a warm-palette visitor the monochrome
 * one because both were once spelled `motir`.
 */

const html = () => document.documentElement

function runInitScript() {
  // The same string `layout.tsx` hands `dangerouslySetInnerHTML`.
  new Function(themeInitScript)()
}

beforeEach(() => {
  window.localStorage.clear()
  for (const axis of ['theme', 'style', 'palette', 'type']) {
    html().removeAttribute(`data-${axis}`)
  }
})

afterEach(() => {
  window.localStorage.clear()
})

describe("the installed init script's palette registry", () => {
  it('knows the renamed palettes — amethyst, and no graphite', () => {
    // The palette LIST, not the whole script: `graphite` still appears in the
    // migration map, as the old id it rewrites.
    const list = /var paletteIds=(\[[^\]]*\])/.exec(themeInitScript)?.[1]
    expect(list).toBeDefined()
    const ids = JSON.parse(list!) as string[]
    expect(ids.slice(0, 2)).toEqual(['motir', 'amethyst'])
    expect(ids).not.toContain('graphite')
  })
})

describe('a first-time visitor', () => {
  it('is served the monochrome Motir palette', () => {
    runInitScript()
    expect(html()).toHaveAttribute('data-palette', 'motir')
  })
})

describe('a returning visitor who picked a palette under 0.1.x', () => {
  it('who picked Graphite keeps the same colours, now called Motir', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, 'graphite')
    runInitScript()
    expect(html()).toHaveAttribute('data-palette', 'motir')
    expect(window.localStorage.getItem(THEME_STORAGE_KEYS.palette)).toBe(
      'motir',
    )
  })

  it('who picked the old warm "Motir" keeps the warm colours, now called Amethyst', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, 'motir')
    runInitScript()
    expect(html()).toHaveAttribute('data-palette', 'amethyst')
    expect(window.localStorage.getItem(THEME_STORAGE_KEYS.palette)).toBe(
      'amethyst',
    )
  })

  it('is migrated ONCE — a later visit reads the stored id as written', () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, 'motir')
    runInitScript()
    // Now a post-rename choice of the monochrome palette, stored after the
    // migration marker was written, must not be migrated a second time.
    window.localStorage.setItem(THEME_STORAGE_KEYS.palette, 'motir')
    runInitScript()
    expect(html()).toHaveAttribute('data-palette', 'motir')
  })
})

describe("motir.co's default style and type", () => {
  // The site's own script runs right after the design system's (layout.tsx).
  async function runSiteDefault() {
    const { siteDefaultsScript } = await import('@/lib/siteDefaults')
    new Function(siteDefaultsScript)()
  }

  it('is the Hand-Drawn style for a visitor who has chosen nothing', async () => {
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-style')).toBe('hand-drawn-indie')
  })

  it('leaves a picked style alone', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.style, 'neo-brutalism')
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-style')).toBe('neo-brutalism')
  })

  it('pairs a picked type with the default style', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.type, 'editorial')
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-style')).toBe('hand-drawn-indie')
    expect(html().getAttribute('data-type')).toBe('editorial')
  })

  it('writes nothing to storage, so the pickers still read no choice', async () => {
    runInitScript()
    await runSiteDefault()
    expect(window.localStorage.getItem(THEME_STORAGE_KEYS.style)).toBeNull()
    expect(window.localStorage.getItem(THEME_STORAGE_KEYS.type)).toBeNull()
  })

  it('is the Grotesk pairing for a visitor who has chosen nothing', async () => {
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-type')).toBe('grotesk')
  })

  it('leaves a picked type alone', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.type, 'editorial')
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-type')).toBe('editorial')
  })

  it("leaves a picked style's own type alone", async () => {
    window.localStorage.setItem(THEME_STORAGE_KEYS.style, 'neo-brutalism')
    runInitScript()
    await runSiteDefault()
    expect(html().getAttribute('data-type')).not.toBe('grotesk')
  })
})
