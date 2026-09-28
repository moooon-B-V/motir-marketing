// @vitest-environment node
import type { ReactElement, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { BRAND_ACCENT_HEX, BRAND_GLYPH_HEX } from '@motir/brand'
import {
  OG_TEXT_HEX,
  OG_TEXT_SECONDARY_HEX,
  OG_WASH,
  OG_WASH_FROM_HEX,
  OG_WASH_TO_HEX,
} from '@/app/_brand/ogColours'

/*
 * MOTIR-6480 — motir.co's two link-preview cards wear the monochrome Motir
 * palette (motir-core `design/brand/design-notes.md` §10, "§6 amended — OG
 * template", MOTIR-6473).
 *
 * ⚠️ WHY `next/og` IS MOCKED. `tests/ogFonts.test.ts` already renders the root
 * card to a real PNG, and a PNG cannot be asked which colour a headline is. So
 * this file captures the element tree each route hands to `ImageResponse` and
 * reads the colours off it. That is the unit render: it runs each route's own
 * component, with its own data read, and asserts what it paints.
 */

const captured: ReactElement[] = []
vi.mock('next/og', () => ({
  ImageResponse: class {
    constructor(element: ReactElement) {
      captured.push(element)
    }
  },
}))

vi.mock('@/lib/publicProject', () => ({
  loadProject: vi.fn(async () => ({
    status: 'ok',
    data: {
      name: 'Acme roadmap',
      publicTagline: 'What Acme is building next.',
      workspaceName: 'Acme',
    },
  })),
}))

/** WCAG 2.x relative luminance of a `#rrggbb` colour. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

type Paint = { background: string[]; color: string[]; fill: string[] }

/** Every background, text colour and SVG fill in a rendered element tree. */
function paints(
  node: ReactNode,
  out: Paint = { background: [], color: [], fill: [] },
): Paint {
  if (node === null || typeof node !== 'object') return out
  if (Array.isArray(node)) {
    for (const child of node) paints(child, out)
    return out
  }
  const props = (node as ReactElement<Record<string, unknown>>).props ?? {}
  const style = (props.style ?? {}) as Record<string, string>
  if (style.background) out.background.push(style.background)
  if (style.color) out.color.push(style.color)
  if (typeof props.fill === 'string') out.fill.push(props.fill)
  paints(props.children as ReactNode, out)
  return out
}

async function renderRoute(
  load: () => Promise<{ default: (a: never) => unknown }>,
  arg?: unknown,
) {
  captured.length = 0
  const { default: route } = await load()
  await route(arg as never)
  expect(captured).toHaveLength(1)
  return paints(captured[0])
}

describe('every OG ink clears its bar on both ends of the wash', () => {
  const wash = [OG_WASH_FROM_HEX, OG_WASH_TO_HEX]

  it.each([
    ['--el-text (wordmark, headline)', OG_TEXT_HEX],
    ['--el-text-secondary (lede, eyebrow)', OG_TEXT_SECONDARY_HEX],
  ])('%s is at least 4.5:1', (_role, ink) => {
    for (const ground of wash)
      expect(contrast(ink, ground)).toBeGreaterThanOrEqual(4.5)
  })

  it('the glyph is at least 3:1 (non-text, WCAG 1.4.11)', () => {
    for (const ground of wash)
      expect(contrast(BRAND_GLYPH_HEX, ground)).toBeGreaterThanOrEqual(3)
  })

  it('matches the design table’s values, not the Amethyst ones', () => {
    // design-notes.md §10, "§6 amended — OG template".
    expect([OG_WASH_FROM_HEX, OG_WASH_TO_HEX]).toEqual(['#e4e6f3', '#dde9f6'])
    expect(OG_TEXT_HEX).toBe('#16191d')
    expect(OG_TEXT_SECONDARY_HEX).toBe('#565c64')
    expect(BRAND_GLYPH_HEX).toBe('#155bc4')
  })
})

describe.each([
  ['the root card', () => import('@/app/opengraph-image'), undefined],
  [
    'the per-project card',
    () => import('@/app/p/[identifier]/opengraph-image'),
    { params: { identifier: 'ACME' } },
  ],
] as const)('%s', (_name, load, arg) => {
  it('paints the glyph in BRAND_GLYPH_HEX, never the ink tile colour', async () => {
    // The glyph sits on the wash, not in a tile, so it takes the
    // glyph-on-a-surface role. Under Motir that is blue; the tile's
    // BRAND_ACCENT_HEX is near-black and would read as a different mark.
    const { fill } = await renderRoute(load, arg)
    expect(fill).toEqual([BRAND_GLYPH_HEX])
    expect(fill).not.toContain(BRAND_ACCENT_HEX)
  })

  it('sits every ink on the design table’s wash', async () => {
    const { background, color } = await renderRoute(load, arg)
    expect(background).toEqual([OG_WASH])
    expect(new Set(color)).toEqual(
      new Set([OG_TEXT_HEX, OG_TEXT_SECONDARY_HEX]),
    )
  })
})
