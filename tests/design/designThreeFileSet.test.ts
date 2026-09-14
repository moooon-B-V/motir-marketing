import { describe, expect, it } from 'vitest'
import { MOCK_SUFFIX, designTree } from './designTree'

/*
 * MOTIR-4990 — the THREE-FILE rule, ported from motir-core's
 * `tests/design-three-file-set.test.ts` (MOTIR-3069).
 *
 * ── The rule ─────────────────────────────────────────────────────────────────
 * A design surface under `design/<area>/` is complete only when its source, its
 * same-basename `.png` export and the area's `design-notes.md` all exist. The
 * four areas here honour that today — by inspection, which is to say by nobody
 * having forgotten yet. motir-core found seven mocks that had shipped with no
 * export, the oldest for ten weeks, before it measured this; the check is a
 * dozen lines and the rule should not have to be remembered in two repositories.
 *
 * ── What the failure message owes ────────────────────────────────────────────
 * The missing FILE and the command that writes it. This repository's renderer
 * is `pnpm design:render` (`scripts/design/render-design-mock.ts`), and a new
 * asset with no committed export has no viewport to recover, so `--width` is
 * the flag the message has to carry.
 */

const NOTES = 'design-notes.md'

/**
 * A file that makes a directory a design SURFACE rather than a folder that
 * happens to sit under `design/`. The `.pen` is the legacy source form the rule
 * still accepts, and a bare `.png` counts because an area shipped as exports
 * alone is the "HTML + PNG, no notes" half of the rule, not an exemption.
 */
const ASSET = /(?:\.mock\.html|\.pen|\.png)$/

// ── The pure core ────────────────────────────────────────────────────────────
// Both checks are functions of a LISTING, so the negative cases run on fixtures
// below. On a healthy tree every assertion here compares against `[]`, which
// proves nothing about whether the check can fail.

/** The area an asset lives in: `design/docs/docs.mock.html` → `design/docs`. */
const areaOf = (path: string): string => path.slice(0, path.lastIndexOf('/'))

/** Every `*.mock.html` with no same-basename `.png`, and the command that writes it. */
export function missingExports(paths: string[]): string[] {
  const present = new Set(paths)
  return paths
    .filter((path) => path.endsWith(MOCK_SUFFIX))
    .map((mock) => ({ mock, png: `${mock.slice(0, -MOCK_SUFFIX.length)}.png` }))
    .filter(({ png }) => !present.has(png))
    .map(
      ({ mock, png }) =>
        `${png} is missing — export it with: pnpm design:render --width <N> ${mock}`,
    )
    .sort()
}

/** Every area holding an asset but no `design-notes.md`. */
export function missingNotes(paths: string[]): string[] {
  const present = new Set(paths)
  const areas = new Set(paths.filter((path) => ASSET.test(path)).map(areaOf))
  return [...areas]
    .filter((area) => !present.has(`${area}/${NOTES}`))
    .map(
      (area) =>
        `${area}/${NOTES} is missing — the area ships assets with no spec`,
    )
    .sort()
}

// ── The real tree ────────────────────────────────────────────────────────────
//
// There is no `KNOWN_MISSING_NOTES` table, unlike motir-core's port source:
// that table exists for debt a guard inherits, and every area here already
// carries its notes. An incomplete area is a fix, not a row.

const TREE = designTree()

describe('a design surface ships all THREE files', () => {
  it('walks a design tree that actually has assets in it', () => {
    // Without this every assertion below passes vacuously if the walk breaks or
    // the folder moves. Measured at ff7452c: six mocks, six exports.
    expect(
      TREE.filter((path) => path.endsWith(MOCK_SUFFIX)).length,
    ).toBeGreaterThanOrEqual(5)
    expect(
      TREE.filter((path) => path.endsWith('.png')).length,
    ).toBeGreaterThanOrEqual(5)
  })

  it('exports a `.png` beside every `*.mock.html`', () => {
    expect(missingExports(TREE)).toEqual([])
  })

  it('keeps a `design-notes.md` in every area that ships an asset', () => {
    expect(missingNotes(TREE)).toEqual([])
  })
})

// ── The negative cases, on fixtures ──────────────────────────────────────────

describe('the three-file check on a fixture tree', () => {
  const HEALTHY = [
    'design/docs/design-notes.md',
    'design/docs/docs.mock.html',
    'design/docs/docs.png',
  ]

  it('passes a complete area', () => {
    expect(missingExports(HEALTHY)).toEqual([])
    expect(missingNotes(HEALTHY)).toEqual([])
  })

  it('names the missing export AND the command that writes it', () => {
    expect(
      missingExports(HEALTHY.filter((path) => !path.endsWith('.png'))),
    ).toEqual([
      'design/docs/docs.png is missing — export it with: pnpm design:render --width <N> design/docs/docs.mock.html',
    ])
  })

  it('is not satisfied by a PLAUSIBLE NEIGHBOUR — another surface’s export in the same area', () => {
    // `design/docs/` holds two surfaces. An eye-audit that matches on the AREA
    // sees a `.png` beside the new mock and moves on; the check matches on the
    // basename, so a sibling surface's export is not this surface's.
    const neighbour = [
      'design/docs/design-notes.md',
      'design/docs/docs.mock.html',
      'design/docs/docs.png',
      'design/docs/sandbox-steps.mock.html',
    ]
    expect(
      missingExports(neighbour).map((finding) => finding.split(' ')[0]),
    ).toEqual(['design/docs/sandbox-steps.png'])
  })

  it('reports EVERY missing export, sorted — not just the first', () => {
    const several = [
      'design/a/design-notes.md',
      'design/a/two.mock.html',
      'design/a/one.mock.html',
      'design/a/three.mock.html',
      'design/a/three.png',
    ]
    expect(
      missingExports(several).map((finding) => finding.split(' ')[0]),
    ).toEqual(['design/a/one.png', 'design/a/two.png'])
  })

  it('reports an area whose assets ship with no spec', () => {
    expect(
      missingNotes(['design/legal/legal.mock.html', 'design/legal/legal.png']),
    ).toEqual([
      'design/legal/design-notes.md is missing — the area ships assets with no spec',
    ])
  })

  it('counts a `.pen`-sourced or PNG-only area as an area that owes notes', () => {
    expect(
      missingNotes(['design/auth/screens.pen', 'design/auth/01-signin.png']),
    ).toEqual([
      'design/auth/design-notes.md is missing — the area ships assets with no spec',
    ])
  })

  it('does not make a folder with no asset in it owe anything', () => {
    expect(
      missingNotes(['design/scratch/README.md', 'design/brand/mark.svg']),
    ).toEqual([])
  })
})
