import {
  PALETTE_IDS,
  STYLE_IDS,
  TYPE_IDS,
  type PaletteId,
} from '@motir/design-system'
import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  declaredAxisValues,
  styleBlockDeclarations,
  tokenContrast,
  type Axes,
} from './support/themeTokens'

/*
 * THE AA MATRIX — `/design`'s "AA holds for body text and controls, in light
 * and dark, for every style × palette pair" criterion (MOTIR-1043), measured
 * over the registries rather than sampled by eye.
 *
 * The full grid the page can wear is 11 styles × 10 palettes × 6 pairings × 2
 * themes = 1,320 cells. Two of those axes are proved NOT to participate rather
 * than assumed not to: the first test asserts that no `[data-style]` block in
 * `theme.css` declares a colour token at all, and type pairings only re-point
 * `--font-*`. What remains — 10 palettes × 2 themes, over every ink/surface
 * pair this page composes — is measured exhaustively below and reported as a
 * table, not a sample.
 */

const THEMES = ['light', 'dark'] as const

function axesFor(theme: (typeof THEMES)[number], palette: PaletteId): Axes {
  return { theme, palette, style: 'warm-editorial', type: 'motir' }
}

const AA = 4.5

/*
 * ⚠️ THE HARNESS IS ASSERTED BEFORE ANY CELL IS BELIEVED.
 *
 * A first run of this sweep during the design pass (MOTIR-3861) reported the
 * theme as 10/10 failing in dark. That was the harness, not the theme: the
 * fixed inks are `color-mix()`, which computes to `color(srgb 0.567 0.519
 * 0.910)`, and the parser read those 0–1 floats as 0–255. **A fixed theme and
 * a catastrophically broken one are one parser bug apart**, so these are the
 * control numbers — every one of them recorded independently of this file,
 * before it existed:
 *
 *   · 4.41 / 5.76  — MOTIR-3745's own figure, and MOTIR-3874's re-measurement
 *                    of the same pair on the pinned 0.1.1, taken in headless
 *                    chromium with `getComputedStyle`.
 *   · 4.17 / 4.34  — `theme.css`'s OWN comment on `--el-text-muted`, written
 *                    by MOTIR-2455 in a different repository years of commits
 *                    before this resolver.
 *   · 0/10 · 0/10  — MOTIR-3872's ten-palette sweep of the tint-lavender arm.
 */
describe('the contrast harness, before it is trusted', () => {
  it('reproduces MOTIR-3874s browser measurement of the nav pair, to the digit', () => {
    expect(
      tokenContrast(
        '--el-accent-on-surface',
        '--el-surface-soft',
        axesFor('dark', 'motir'),
      ),
    ).toBe(5.76)
    expect(
      tokenContrast(
        '--el-accent-on-surface',
        '--el-surface-soft',
        axesFor('light', 'motir'),
      ),
    ).toBe(6.29)
    expect(
      tokenContrast(
        '--el-accent-on-surface',
        '--el-surface',
        axesFor('dark', 'motir'),
      ),
    ).toBe(5.54)
  })

  it('reproduces theme.css OWN stated figures for the muted ink', () => {
    // "AA-SAFE ONLY ON THE WHITE PAGE/CARD, and by 0.04 (4.54:1). On
    // --el-surface it is 4.17, on --el-surface-soft 4.34 — all under AA."
    const light = axesFor('light', 'motir')
    expect(tokenContrast('--el-text-muted', '--el-page-bg', light)).toBe(4.54)
    expect(tokenContrast('--el-text-muted', '--el-surface', light)).toBe(4.17)
    expect(tokenContrast('--el-text-muted', '--el-surface-soft', light)).toBe(
      4.34,
    )
  })

  it('reproduces MOTIR-3872s ten-palette result for the selected-chip ink', () => {
    for (const theme of THEMES) {
      const failing = PALETTE_IDS.filter(
        (palette) =>
          tokenContrast(
            '--el-accent-on-surface',
            '--el-tint-lavender',
            axesFor(theme, palette),
          ) < AA,
      )
      expect(failing).toEqual([])
    }
  })

  it('computes the two anchors of the WCAG scale exactly', () => {
    expect(contrastRatio([0, 0, 0, 1], [1, 1, 1, 1])).toBe(21)
    expect(contrastRatio([1, 1, 1, 1], [1, 1, 1, 1])).toBe(1)
  })

  it('THROWS on an unresolved token rather than returning a plausible number', () => {
    // An undefined custom property computes to the INITIAL ink in a browser,
    // which is a pair of believable, AA-passing figures — exactly what hid a
    // missing `--el-danger-on-surface` from a green run during the design pass.
    expect(() =>
      tokenContrast(
        '--el-not-a-token',
        '--el-page-bg',
        axesFor('light', 'motir'),
      ),
    ).toThrow(/not declared/)
  })
})

describe('the axes that do not carry colour, proved rather than assumed', () => {
  it('has a [data-style] block for every registered style, and none of them declares a colour', () => {
    // If a style ever DID declare `--el-*`, this matrix would have to run over
    // the style axis too — so the exemption is a test, not a sentence.
    expect(
      styleBlockDeclarations().filter((p) => /^--(el|color)-/.test(p)),
    ).toEqual([])
    const declared = declaredAxisValues('style')
    expect(
      STYLE_IDS.filter((id) => id !== 'warm-editorial').every((id) =>
        declared.has(id),
      ),
    ).toBe(true)
  })

  it('registers 11 styles, 10 palettes and 6 pairings — read from the package, not from a card', () => {
    // The card's body said "9 styles"; the installed package says 11, and the
    // count is a LAYOUT input (it is what wraps the Style axis to a second row
    // at 1440 and forces the narrow scrolling row).
    expect(STYLE_IDS).toHaveLength(11)
    expect(PALETTE_IDS).toHaveLength(10)
    expect(TYPE_IDS).toHaveLength(6)
  })
})

/*
 * The pairs `/design` composes. Each names the element it belongs to, because
 * a pair with no element behind it is a number nobody can re-check.
 *
 * SCOPE: these are the pairs where THIS page picks the ink or the surface. The
 * inks a primitive resolves inside its own box (`Input`'s helper, `Pill`'s
 * status fills) belong to `@motir/design-system` and are gated by motir-core's
 * own `inkContrastLint`, which runs over the same registries.
 */
const PAIRS: { ink: string; surface: string; element: string }[] = [
  {
    ink: '--el-text',
    surface: '--el-page-bg',
    element: 'page headline + body',
  },
  {
    ink: '--el-text-secondary',
    surface: '--el-page-bg',
    element: 'the subline and the closing line',
  },
  {
    ink: '--el-text-secondary',
    surface: '--el-page-bg',
    element: 'an unselected axis chip (its own fill is --el-page-bg)',
  },
  {
    ink: '--el-text',
    surface: '--el-card',
    element: 'an axis name in the rail',
  },
  {
    ink: '--el-text-muted',
    surface: '--el-card',
    element: 'an axis help line and its AxisNote',
  },
  {
    ink: '--el-text-eyebrow',
    surface: '--el-page-bg',
    element: 'a SectionLabel',
  },
  {
    ink: '--el-accent-on-surface',
    surface: '--el-tint-lavender',
    element: 'the SELECTED axis chip',
  },
  {
    ink: '--el-accent-on-surface',
    surface: '--el-surface-soft',
    element: 'the nav current-page item, desktop bar',
  },
  {
    ink: '--el-accent-on-surface',
    surface: '--el-surface',
    element: 'the nav current-page item, md:hidden panel',
  },
  {
    ink: '--el-text-secondary',
    surface: '--el-surface-soft',
    element: 'the other nav items in the bar',
  },
]

describe('AA over every palette × theme, for every pair /design paints', () => {
  it.each(PAIRS)('$ink on $surface — $element', ({ ink, surface }) => {
    const failures: string[] = []
    for (const theme of THEMES) {
      for (const palette of PALETTE_IDS) {
        const ratio = tokenContrast(ink, surface, axesFor(theme, palette))
        if (ratio < AA) failures.push(`${theme}/${palette} = ${ratio}`)
      }
    }
    expect(failures).toEqual([])
  })

  it('reports the whole matrix, not a sample — 20 cells per pair, none missing', () => {
    const rows = PAIRS.flatMap(({ ink, surface }) =>
      THEMES.flatMap((theme) =>
        PALETTE_IDS.map((palette) =>
          tokenContrast(ink, surface, axesFor(theme, palette)),
        ),
      ),
    )
    expect(rows).toHaveLength(PAIRS.length * THEMES.length * PALETTE_IDS.length)
    expect(rows.every((r) => r >= AA)).toBe(true)
    // Print it so a reviewer reads a table rather than a green tick.
    console.log(
      ['', 'AA matrix — minimum ratio per pair over 10 palettes × 2 themes']
        .concat(
          PAIRS.map(({ ink, surface, element }) => {
            let min = Infinity
            let at = ''
            for (const theme of THEMES) {
              for (const palette of PALETTE_IDS) {
                const r = tokenContrast(ink, surface, axesFor(theme, palette))
                if (r < min) {
                  min = r
                  at = `${theme}/${palette}`
                }
              }
            }
            return `  ${min.toFixed(2)}  ${at.padEnd(16)} ${ink} on ${surface} — ${element}`
          }),
        )
        .join('\n'),
    )
  })
})
