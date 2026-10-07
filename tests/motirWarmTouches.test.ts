import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  THEME_CSS_PATH,
  customProperties,
  resolveColor,
  type Axes,
} from './support/themeTokens'

/*
 * The warm touches motir.co serves in its DEFAULT palette (MOTIR-7588).
 *
 * MOTIR-7582 gave the `motir` palette a few warm-orange touches — the
 * decorative accent, the Epic and Design glyph hues, the progress fill and the
 * peach / yellow washes — and kept its identity roles where they were: the ink
 * CTA fill, the cool-blue primary, link and focus ring. They shipped in
 * `@motir/design-system@0.8.2`.
 *
 * ⚠️ WHY THIS READS THE INSTALLED PACKAGE. motir.co pins an EXACT version from
 * npm, so nothing in motir-core reaches it until the pin moves — the site sat on
 * the old default once already (MOTIR-6616). Every value below is resolved from
 * `node_modules/@motir/design-system/theme.css`, the stylesheet `globals.css`
 * imports, never from motir-core's source copy. A re-pin that slides back below
 * 0.8.2 turns the warm half red; a release that moved an identity role turns
 * the other half red.
 *
 * The values are the approved table of design MOTIR-7583 §8, as applied by
 * MOTIR-7584 (motir-core `6f2f433`).
 */

function axes(theme: Axes['theme']): Axes {
  return { theme, palette: 'motir', style: 'warm-editorial', type: 'motir' }
}

/** A token's resolved colour under the `motir` palette, as `#rrggbb`. */
function resolved(token: string, theme: Axes['theme']): string {
  const props = customProperties(axes(theme))
  const declared = props.get(token)
  if (declared === undefined) throw new Error(`token not declared: ${token}`)
  const [r, g, b, a] = resolveColor(declared, props)
  expect(a).toBe(1)
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round(v * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

const WARM = {
  light: {
    '--color-accent': '#d66000',
    '--el-highlight': '#d66000',
    '--el-type-epic': '#d66000',
    '--el-type-design': '#746019',
    '--el-progress-fill': '#d66000',
    '--el-tint-peach': '#fde0c8',
    '--el-tint-yellow': '#fdf0c6',
  },
  dark: {
    '--color-accent': '#fa5500',
    '--el-highlight': '#fa5500',
    '--el-type-epic': '#fa5500',
    '--el-type-design': '#ffd02f',
    '--el-progress-fill': '#fa5500',
    '--el-tint-peach': '#36230f',
    '--el-tint-yellow': '#302a12',
  },
} as const

/* The roles MOTIR-7582 promised not to move — the values 0.6.0 served. */
const IDENTITY = {
  light: {
    '--el-accent': '#1a1d21', // ink CTA fill
    '--el-accent-text': '#ffffff',
    '--color-primary': '#155bc4', // cool-blue primary
    '--el-accent-on-surface': '#155bc4',
    '--el-link': '#155bc4',
    '--el-link-pressed': '#114a9e',
    '--focus-ring-color': '#155bc4',
    '--el-editor-focus': '#155bc4', // the editor keeps the blue focus hue
    '--el-info': '#155bc4',
    '--el-warning': '#c2410c',
    '--el-danger': '#c92a2a',
  },
  dark: {
    '--el-accent': '#edeef0',
    '--el-accent-text': '#0c0d0f',
    '--color-primary': '#7db1ff',
    '--el-link': '#7db1ff',
    '--el-link-pressed': '#a3c8ff',
    '--focus-ring-color': '#7db1ff',
    '--el-editor-focus': '#7db1ff',
    '--el-info': '#7db1ff',
    '--el-warning': '#f08a4b',
    '--el-danger': '#d83847',
  },
} as const

describe('the installed design system', () => {
  // The installed version is the one package.json pins, read from there so a
  // re-pin moves this with it; the warm-touch values below are what hold it at
  // 0.8.2 or later.
  it('is the pinned version, read from node_modules', () => {
    const pkg = JSON.parse(
      // `exports` does not expose ./package.json, so read it beside theme.css.
      readFileSync(join(dirname(THEME_CSS_PATH), 'package.json'), 'utf8'),
    ) as { version: string }
    const site = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> }
    expect(pkg.version).toBe(site.dependencies['@motir/design-system'])
    expect(THEME_CSS_PATH).toMatch(
      /node_modules[\\/]@motir[\\/]design-system[\\/]theme\.css$/,
    )
  })
})

describe.each(['light', 'dark'] as const)(
  'the default `motir` palette, %s',
  (theme) => {
    it.each(Object.entries(WARM[theme]))(
      'carries the approved warm value for %s',
      (token, value) => {
        expect(resolved(token, theme)).toBe(value)
      },
    )

    it.each(Object.entries(IDENTITY[theme]))(
      'keeps the identity role %s where it was',
      (token, value) => {
        expect(resolved(token, theme)).toBe(value)
      },
    )
  },
)
