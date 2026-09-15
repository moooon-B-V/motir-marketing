import { describe, expect, it } from 'vitest'
import { MOCK_SUFFIX, designTree } from './designTree'

/*
 * MOTIR-4990 — the design-asset rule, ported from motir-core's
 * `tests/design-three-file-set.test.ts` (MOTIR-3069).
 * MOTIR-5493 — and the rule is now TWO files, not three.
 *
 * ── The rule ─────────────────────────────────────────────────────────────────
 * A design surface under `design/<area>/` is the area's `design-notes.md` + its
 * `<surface>.mock.html` (`design/marketing/design-notes.md` § _The asset
 * convention_, from motir-core `docs/decisions/design-result.md` AMENDMENT 4).
 * The `.png` export this guard used to require is RETIRED: it existed so a
 * design could be skimmed on its pull request, and the mock now renders on the
 * card. A `.pen` source is not accepted — it can only be reviewed through the
 * export that is gone — and this repository has never shipped one, so there is
 * no legacy list: any `.pen` fails.
 *
 * The file keeps its name so the design lane's include and every citation of it
 * still land.
 *
 * ── What the failure message owes ────────────────────────────────────────────
 * The offending FILE and the rule it breaks.
 */

const NOTES = 'design-notes.md'

/**
 * A file that makes a directory a design SURFACE rather than a folder that
 * happens to sit under `design/`. A bare `.png` still counts: the legacy exports
 * are assets, and an area of exports with no notes owes a spec like any other.
 */
const ASSET = /(?:\.mock\.html|\.pen|\.png)$/

// ── The pure core ────────────────────────────────────────────────────────────
// Both checks are functions of a LISTING, so the negative cases run on fixtures
// below. On a healthy tree every assertion here compares against `[]`, which
// proves nothing about whether the check can fail.

/** The area an asset lives in: `design/docs/docs.mock.html` → `design/docs`. */
const areaOf = (path: string): string => path.slice(0, path.lastIndexOf('/'))

/** Every `.pen` in the listing — a source form the two-file rule does not accept. */
export function penSources(paths: string[]): string[] {
  return paths
    .filter((path) => path.endsWith('.pen'))
    .map(
      (pen) =>
        `${pen} is a .pen source — a design surface is TWO files, design-notes.md + <surface>.mock.html; draw it as a mock`,
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

describe('a design surface ships its TWO files', () => {
  it('walks a design tree that actually has assets in it', () => {
    // Without this every assertion below passes vacuously if the walk breaks or
    // the folder moves. Measured at ff7452c: six mocks.
    expect(
      TREE.filter((path) => path.endsWith(MOCK_SUFFIX)).length,
    ).toBeGreaterThanOrEqual(5)
  })

  it('keeps a `design-notes.md` in every area that ships an asset', () => {
    expect(missingNotes(TREE)).toEqual([])
  })

  it('accepts no `.pen` source', () => {
    expect(penSources(TREE)).toEqual([])
  })
})

// ── The negative cases, on fixtures ──────────────────────────────────────────

describe('the two-file check on a fixture tree', () => {
  const HEALTHY = ['design/docs/design-notes.md', 'design/docs/docs.mock.html']

  it('passes a complete area — a mock and its notes, with NO `.png`', () => {
    expect(penSources(HEALTHY)).toEqual([])
    expect(missingNotes(HEALTHY)).toEqual([])
  })

  it('passes a delta mock beside the surface it amends, with no export for either', () => {
    const delta = [...HEALTHY, 'design/docs/docs--rail-search.mock.html']
    expect(penSources(delta)).toEqual([])
    expect(missingNotes(delta)).toEqual([])
  })

  it('fails a `.pen` source, naming the two-file rule', () => {
    expect(penSources([...HEALTHY, 'design/docs/docs.pen'])).toEqual([
      'design/docs/docs.pen is a .pen source — a design surface is TWO files, design-notes.md + <surface>.mock.html; draw it as a mock',
    ])
  })

  it('reports an area whose mock ships with no spec', () => {
    expect(missingNotes(['design/legal/legal.mock.html'])).toEqual([
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
