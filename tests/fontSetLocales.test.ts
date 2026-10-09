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
  it('maps exactly the locales the site routes', () => {
    expect(new Set(Object.keys(LOCALE_FONT_SET))).toEqual(
      new Set(routing.locales),
    )
  })

  it('draws zh, ja and ko in three different sets', () => {
    const cjk = (['zh', 'ja', 'ko'] as const).map((l) => LOCALE_FONT_SET[l])
    expect(new Set(cjk).size).toBe(3)
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
