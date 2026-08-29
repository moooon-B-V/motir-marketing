// @vitest-environment node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { OG_FONT_FACES as PACKAGE_FACES } from '@motir/brand'
import { describe, expect, it } from 'vitest'
import {
  loadOgFonts,
  OG_FONT_FACES as SITE_FACES,
  OG_FONT_FAMILY,
} from '@/app/_brand/ogFonts'

/*
 * MOTIR-3848 — the root OG card's typeface, after the bytes moved into
 * `@motir/brand`.
 *
 * ⚠️ WHY THIS FILE RUNS IN THE `node` ENVIRONMENT. The rest of the suite is
 * jsdom (`vitest.config.mts`), and `next/og` renders through satori in a Node
 * runtime — the route even declares `export const runtime = 'nodejs'`. The
 * docblock above overrides the environment for this file only.
 *
 * ⚠️ WHY IT RENDERS THE REAL IMAGE. The font wiring is the part of this change
 * that can be wrong in production while looking right everywhere else: satori
 * renders OUTSIDE the CSS tree, so if the `fonts` option is missing or its bytes
 * fail to load the card does not error — it renders in whatever face the runtime
 * happens to have. That is what motir.co would have shipped silently if the move
 * had broken the read. So the assertion is that the route actually PRODUCES a
 * PNG with the faces attached, not that the source mentions them.
 */

const PNG_MAGIC = '89504e470d0a1a0a'

describe('the root card is set in @motir/brand’s Inter, not a copy of its own', () => {
  it('reads the faces the package ships, and this repository keeps none', () => {
    // The site repeats the package's face list as LITERALS on purpose: importing
    // `OG_FONT_FACES` and mapping over it would hand Turbopack a value it cannot
    // constant-fold, and its fallback for an unresolvable read is to trace the
    // entire project into the route's `.nft.json`. So the literals are pinned
    // here instead — a face added, dropped or re-cut in the package fails THIS
    // test rather than silently re-weighting a card nobody looks at.
    expect(SITE_FACES).toEqual(PACKAGE_FACES)
    expect(SITE_FACES.length).toBe(3)

    // The duplication this card removed. Re-creating the directory would restore
    // it without failing anything else, because both copies render identically —
    // which is precisely why the defect survived a green build in both
    // repositories for as long as it did.
    expect(existsSync(join(process.cwd(), 'app/_brand/fonts'))).toBe(false)
    for (const { file } of PACKAGE_FACES) {
      expect(
        existsSync(
          join(process.cwd(), 'node_modules/@motir/brand/fonts', file),
        ),
        file,
      ).toBe(true)
    }
  })

  it('loads the three weights the template uses, as parseable TTFs', async () => {
    // satori does not synthesise weight — an absent one silently snaps to the
    // nearest present face, which would quietly re-weight §6's design.
    const fonts = await loadOgFonts()
    expect(fonts.map((f) => f.weight).sort()).toEqual([400, 700, 800])
    for (const font of fonts) {
      expect(font.name).toBe(OG_FONT_FAMILY)
      // 0x00010000 — the sfnt version every TrueType file opens with. satori
      // cannot decompress WOFF2, so a woff2 slipped in here would fail at render
      // time on a surface nobody looks at.
      expect(font.data.subarray(0, 4).toString('hex')).toBe('00010000')
    }
  })

  it('still renders a real PNG at 1200 x 630', async () => {
    const { default: route, size } = await import('@/app/opengraph-image')
    expect(size).toEqual({ width: 1200, height: 630 })
    const png = Buffer.from(await (await route()).arrayBuffer())
    expect(png.subarray(0, 8).toString('hex')).toBe(PNG_MAGIC)
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
  }, 30_000)
})
