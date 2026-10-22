// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { LOCALE_FONT_SET } from '@motir/design-system'
import { routing } from '@/i18n/routing'

/*
 * EVERY LANGUAGE motir.co SPEAKS HAS A FONT SET (MOTIR-7952).
 *
 * The locale list lives in `i18n/routing.ts`; the font sets live in the
 * installed `@motir/design-system`. Nothing else ties the two together, so a
 * locale added to the site with no set would render in a fallback face and no
 * test would notice. This one does.
 */

describe('the installed font sets cover the site’s locales', () => {
  it('maps every locale the site routes, and only zh-tw beyond them', () => {
    const mapped = Object.keys(LOCALE_FONT_SET)
    for (const locale of routing.locales) expect(mapped).toContain(locale)
    // MOTIR-9248 installs the zh-Hant set before zh-tw is routed; the
    // registration card (MOTIR-9249) restores strict equality.
    const routed = new Set<string>(routing.locales)
    expect(mapped.filter((l) => !routed.has(l))).toEqual(['zh-tw'])
  })

  it('draws zh, zh-tw, ja and ko in four different sets', () => {
    const cjk = (['zh', 'zh-tw', 'ja', 'ko'] as const).map(
      (l) => LOCALE_FONT_SET[l],
    )
    expect(new Set(cjk).size).toBe(4)
    expect(cjk).not.toContain('latin')
  })

  it('draws the eight Latin-script locales in the Latin set', () => {
    for (const locale of ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt']) {
      expect(LOCALE_FONT_SET[locale as keyof typeof LOCALE_FONT_SET]).toBe(
        'latin',
      )
    }
  })
})
