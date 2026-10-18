import {
  BRAND_GLYPH_HEX,
  WAVE_BAND_PATH,
  WAVE_BAND_VIEW_BOX,
} from '@motir/brand'
import { loadOgFonts, OG_FONT_FAMILY } from '@/app/_brand/ogFonts'
import {
  cachedOgImage,
  drawOgImage,
  OG_CACHE_SECONDS,
} from '@/app/_brand/ogRenderGate'
import {
  OG_TEXT_HEX,
  OG_TEXT_SECONDARY_HEX,
  OG_WASH,
} from '@/app/_brand/ogColours'
import { loadProject } from '@/lib/publicProject'

/*
 * The PER-PROJECT social card (MOTIR-4118).
 *
 * ⚠️ IT LIVES BESIDE THE PAGE IT DECORATES, and that is not a preference. A
 * metadata image is resolved for the page in its OWN segment and is NOT
 * inherited: motir-core lost every `og:image` tag from `/explore` by leaving one
 * behind when its `page.tsx` moved into a route group, while the image route
 * went on serving a 200 and the build stayed green (MOTIR-3491). The root card
 * at `app/opengraph-image.tsx` therefore does NOT cover `/p/*`, and this file is
 * why `/p/*` has one at all.
 *
 * ── The template is 8.3.1's, not a new one ────────────────────────────────
 *
 * `motir-core/design/brand/design-notes.md` §6 is the design of record and this
 * is its section layout, with the same numbers the root card uses: canvas
 * 1200 × 630 at padding 80; glyph 72 in `BRAND_GLYPH_HEX`, wordmark 30 / 700;
 * headline 60 / 800 / 1.1; lede 28 at max-width 920. Three social cards of one
 * product, one table. The colours are §10's ("§6 amended — OG template",
 * MOTIR-6473) and come from `app/_brand/ogColours.ts`, which the root card
 * shares.
 *
 * What differs is only the CONTENT: the project's own name and tagline rather
 * than the site's headline, plus a small eyebrow naming the project key, so a
 * shared link previews the project rather than the product.
 *
 * INLINE HEXES ARE THE DOCUMENTED EXCEPTION: `ImageResponse` renders outside the
 * React/CSS tree and cannot read a custom property, so a raster surface is the
 * one place a literal is correct. Each names the token it came from.
 *
 * ── ⚠️ WHEN THE PROJECT CANNOT BE READ, THE CARD STILL RENDERS ────────────
 *
 * A social card is fetched by a crawler, at a moment nobody controls. Throwing
 * here would give an unfurled link a broken image; falling back to the project
 * KEY — which is in the URL and needs no read — gives it a correct, if plain,
 * card. The failure the fallback prevents is the one that is visible to
 * everybody who was ever sent the link.
 */

/*
 * ── ⚠️ THE CARD IS DRAWN ONCE PER WINDOW, NOT ONCE PER REQUEST ────────────
 *
 * Every `/p/*` page advertises this card, so every crawler and link unfurler
 * that reads a project page fetches it too — and a draw is the most expensive
 * thing this host does, in memory that sits off the V8 heap
 * (`app/_brand/ogRenderGate.ts` has the measurements). Drawn per request it
 * took motir.co down on 2026-10-18. So the drawn card is kept for
 * `OG_CACHE_SECONDS`, keyed by the project, its project read is cached on the
 * same window, and the draws that do happen go through the gate. Not segment
 * ISR: this route is request-time because its page is, and Next does not cache
 * it — the gate's header says how that was checked. A card an hour behind a
 * renamed project is a fair price; a social card is not a live view.
 *
 * The key is the identifier alone: the card draws no locale-specific text, so
 * `/en/p/MOTIR/opengraph-image` and `/de/p/MOTIR/opengraph-image` are one card.
 */

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'A public project on Motir'

export default async function ProjectOpengraphImage({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
  const { identifier } = await params
  return cachedOgImage(`p/${identifier}`, () => drawProjectCard(identifier))
}

async function drawProjectCard(
  identifier: string,
): Promise<{ response: Response; keep: boolean }> {
  const [fonts, read] = await Promise.all([
    loadOgFonts(),
    loadProject(identifier, OG_CACHE_SECONDS),
  ])

  const project = read.status === 'ok' ? read.data : null
  const name = project?.name ?? identifier
  const tagline =
    project?.publicTagline ??
    'A project built in public on Motir — watch it being built.'

  const response = await drawOgImage(
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
            fontSize: 24,
            fontWeight: 600,
            // --el-text-secondary, light.
            color: OG_TEXT_SECONDARY_HEX,
            letterSpacing: '0.04em',
          }}
        >
          {project?.workspaceName ?? identifier}
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            // --el-text, light.
            color: OG_TEXT_HEX,
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 28,
            // --el-text-secondary, light.
            color: OG_TEXT_SECONDARY_HEX,
            maxWidth: 920,
          }}
        >
          {tagline}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
  // A card drawn from the fallback is not kept: the read failed, and the next
  // request should try it again rather than serve the plain card for an hour.
  return { response, keep: read.status !== 'failed' }
}
