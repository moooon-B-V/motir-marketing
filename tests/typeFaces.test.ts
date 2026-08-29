import { readFileSync } from 'node:fs'
import { TYPE_IDS } from '@motir/design-system'
import { describe, expect, it } from 'vitest'
import { referencedFontSources } from './support/themeTokens'

/*
 * ALL SIX TYPE PAIRINGS RENDER THEIR REAL FACES (MOTIR-1043).
 *
 * Until this card, `app/layout.tsx` loaded three faces and said so
 * deliberately — "this site has no picker, so it loads the default pairing's
 * three and nothing else". `/design` IS a picker, and three of the six
 * pairings read faces the site did not load. TWO OF THEM FAILED HARD RATHER
 * THAN DEGRADING: `[data-type='grotesk']` and `[data-type='editorial']` read
 * `var(--font-grotesk-source)` / `var(--font-editorial-source)` with NO in-var
 * fallback, so an unloaded face makes the whole declaration invalid and the
 * role silently reverts — a Type axis that appears to work and does nothing.
 *
 * ⚠️ THE ASSERTION IS TOTAL OVER THE STYLESHEET, NOT OVER A LIST OF SIX. A
 * hand-written map from pairing to face is a list that goes stale the day a
 * seventh pairing ships; what this reads is every `--font-*-source` variable
 * `theme.css` actually references through `var()`, whatever declares it, and
 * requires `app/layout.tsx` to define each one. A seventh pairing that loads
 * no face fails the suite on the day the package is bumped.
 */

const LAYOUT = readFileSync('app/layout.tsx', 'utf8')

/** Every `variable: '--font-…'` a `next/font` loader is given in the layout. */
function loadedFontVariables(): Set<string> {
  return new Set(
    [...LAYOUT.matchAll(/variable:\s*'(--font-[a-z0-9-]+)'/g)].map(
      ([, name]) => name,
    ),
  )
}

describe('the type axis loads every face it offers', () => {
  it('defines every --font-*-source variable theme.css reads', () => {
    const referenced = [...referencedFontSources()].sort()
    const loaded = loadedFontVariables()
    expect(referenced.length).toBeGreaterThanOrEqual(6)
    expect(referenced.filter((name) => !loaded.has(name))).toEqual([])
  })

  it('names the loader variables --font-*-SOURCE, never the role token', () => {
    /*
     * The trap `app/layout.tsx`'s own header warns about: `theme.css` declares
     * the ROLE tokens as `--font-sans: var(--font-sans-source, …)`, so a
     * loader variable named `--font-sans` leaves every `var(--font-*-source)`
     * unresolved and quietly disables the whole axis.
     */
    for (const name of loadedFontVariables()) {
      expect(name).toMatch(/^--font-[a-z0-9-]+-source$/)
    }
  })

  it('loads the three new faces with preload: false, so the landings first paint is unchanged', () => {
    for (const face of ['Space_Grotesk', 'Fraunces', 'IBM_Plex_Mono']) {
      expect(LAYOUT).toContain(face)
    }
    // One `preload: false` per added face, and none on the default pairing's
    // three — a visitor pays for a face only by choosing its pairing.
    const code = LAYOUT.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(code.match(/preload:\s*false/g) ?? []).toHaveLength(3)
  })

  it('registers exactly the six pairings the rail offers', () => {
    expect(TYPE_IDS).toEqual([
      'motir',
      'motir-sans',
      'motir-mono',
      'grotesk',
      'editorial',
      'mono-technical',
    ])
  })
})
