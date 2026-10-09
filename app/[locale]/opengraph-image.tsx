import { ImageResponse } from 'next/og'
import {
  BRAND_GLYPH_HEX,
  WAVE_BAND_PATH,
  WAVE_BAND_VIEW_BOX,
} from '@motir/brand'
import { englishCopy as copy } from '@/lib/copy'
import { loadOgFonts, OG_FONT_FAMILY } from './_brand/ogFonts'
import { OG_TEXT_HEX, OG_TEXT_SECONDARY_HEX, OG_WASH } from './_brand/ogColours'

/*
 * motir.co's root social card (MOTIR-1154 · 8.3.7).
 *
 * ⚠️ IT LIVES BESIDE THE PAGE IT DECORATES, AT `app/`, AND MUST STAY THERE. A
 * metadata image file is resolved for the page in its OWN segment and is NOT
 * inherited — motir-core lost every `og:image` tag from `/explore` by leaving
 * one behind when its `page.tsx` moved into a route group (MOTIR-3491), while
 * the image ROUTE went on serving a 200 and the build stayed green. If this
 * site ever grows a second page, that page gets its own card or none.
 *
 * ── THE TEMPLATE IS 8.3.1's, NOT A NEW ONE ─────────────────────────────────
 * `motir-core/design/brand/design-notes.md` §6 ("OG template · 1200 × 630") is
 * the design of record, and this is its SECTION layout: brand lockup top-left,
 * headline and lede anchoring the bottom. Every number below is §6's — canvas
 * 1200 × 630 at padding 80; glyph 72, wordmark 30 / 700, gap 20; headline
 * 60 / 800 / 1.1; lede 28 at max-width 920. The COLOURS are §10's monochrome
 * Motir palette ("§6 amended — OG template", MOTIR-6473): glyph `#155bc4`
 * (`BRAND_GLYPH_HEX`, the glyph-on-a-surface role, not the ink tile's
 * `BRAND_ACCENT_HEX`), wordmark and headline `#16191d`, lede `#565c64`, on a
 * `#e4e6f3` → `#dde9f6` wash. The two cards motir-core already ships render
 * from the same table, so the three social cards of the one product are one
 * design.
 *
 * INLINE HEXES ARE THE DOCUMENTED EXCEPTION, not a lapse from the `--el-*`
 * rule. `ImageResponse` renders outside the React/CSS tree and cannot read a
 * custom property, so a raster surface is the one place a literal is correct —
 * and each literal names the token it came from, which is the provenance to
 * keep in sync. They live in `app/_brand/ogColours.ts`, shared with the project
 * card. The GLYPH is not a literal at all: its path and its fill come from
 * `@motir/brand`, the one place the mark lives.
 *
 * ⚠️ EVERY WORD IS AN EXISTING CATALOGUE STRING. The headline is the landing's
 * own `<h1>` and the lede is the footer tagline — the THREE pillars, in the
 * order the positioning fixes them (`messages/en.json` is MOTIR-1144's
 * artifact; this card invents no copy and re-keys nothing).
 */

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/*
 * §6: "`export const alt` … is the only accessible name a social embed gets."
 * The meta title is that sentence already, and it carries the three pillars.
 */
export const alt = copy.meta.title

export default async function RootOpengraphImage() {
  const fonts = await loadOgFonts()
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        // --color-tint-lavender → --color-tint-sky.
        background: OG_WASH,
        fontFamily: OG_FONT_FAMILY,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <svg viewBox={WAVE_BAND_VIEW_BOX} width={72} height={72}>
          <path d={WAVE_BAND_PATH} fill={BRAND_GLYPH_HEX} />
        </svg>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            // --el-text, light.
            color: OG_TEXT_HEX,
          }}
        >
          Motir
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            // --el-text, light.
            color: OG_TEXT_HEX,
            lineHeight: 1.1,
          }}
        >
          {copy.landing.hero.headline}
        </div>
        <div
          style={{
            fontSize: 28,
            // --el-text-secondary, light.
            color: OG_TEXT_SECONDARY_HEX,
            maxWidth: 920,
          }}
        >
          {copy.footer.tagline}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
}
