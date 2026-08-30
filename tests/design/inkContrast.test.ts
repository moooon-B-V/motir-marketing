import { beforeAll, describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import {
  formatViolations,
  scanMocks,
  type InkSite,
  type MockScan,
} from './inkContrastScan'

/*
 * MOTIR-4001 — the guard for `design/marketing/design-notes.md` §
 * *A design board's CHROME owes AA*.
 *
 * That decision (MOTIR-3985, adopting motir-core's MOTIR-3054) was enforced by
 * nothing in this repository: `vitest.config.mts` includes `tests/**` and no
 * spec there reads `design/**` for contrast, so the next asset authored here
 * would re-introduce the defect under a green CI.
 *
 * ⚠️ THE EVIDENCE IS THE FIXTURE, NOT THE TREE. The 54 sites are already swept,
 * so a spec that only scans `design/marketing/**` would be green on the day it
 * shipped and green if it abstained — and abstaining is exactly what a PORT of
 * motir-core's scanner does here (see `inkContrastScan.ts`'s header). So the
 * first block below asserts the lane goes RED on the pre-sweep board chrome,
 * site by site, before the second block asserts the shipped assets clear it.
 */

const ROOT = resolve(import.meta.dirname, '../..')
const FIXTURE = resolve(
  ROOT,
  'tests/design/fixtures/board-chrome-pre-sweep.mock.html',
)
const ASSETS = ['design-showcase.mock.html', 'landing.mock.html'].map((file) =>
  resolve(ROOT, 'design', 'marketing', file),
)

/*
 * Sites measured below 1.4.3 and ruled NOT a failure, each with its reason.
 *
 * An entry is matched on file + selector + text + the measured ratio, so a
 * disposition cannot widen by accident: change the ink, the size or the markup
 * and the allowance stops matching, which fails the last test in this file
 * rather than quietly covering something new.
 */
const DISPOSITIONED: {
  file: string
  selector: string
  text: string
  ratio: number
  why: string
}[] = [
  {
    file: 'design-showcase.mock.html',
    selector: 'span.i',
    text: '☾',
    ratio: 3.85,
    why:
      'A DECORATIVE glyph sitting beside its own text label ("Dark") inside the ' +
      'same control, so the accessible name is the word and the glyph is not text ' +
      "for 1.4.3. It clears 1.4.11's 3:1 for non-text content. Recorded in " +
      'design/marketing/design-notes.md § "A design board\'s CHROME owes AA".',
  },
  {
    file: 'landing.mock.html',
    selector: 'button.btn.primary',
    text: 'Starting…',
    ratio: 2.64,
    why:
      "An INACTIVE user-interface component — the door's submitting state, " +
      '`<button class="btn primary" disabled aria-busy="true">`, faded by ' +
      '`.btn[disabled] { opacity: 0.72 }` — which 1.4.3 exempts by name under ' +
      'Incidental. The DECLARED pair clears AA at 6.57:1 (#ffffff on #5645d4); ' +
      'the 2.64 is what the fade composites it down to, and it is visible here ' +
      'only because this scan models `opacity`. The element-only scan MOTIR-3985 ' +
      'ran did not, so this site was never in its 54.',
  },
]

/**
 * A floor on the denominator. Without it a scan that silently walked nothing —
 * a document that failed to load, a selector that matched none — reports zero
 * violations and reads exactly like a clean asset, which is this card's own
 * defect one level down.
 */
const MINIMUM_SITES_PER_ASSET = 200

const scanned: Record<string, MockScan> = {}

beforeAll(async () => {
  for (const scan of await scanMocks([FIXTURE, ...ASSETS]))
    scanned[scan.file] = scan
}, 120_000)

const describeSite = (site: InkSite) => `${site.selector} @ ${site.ratio}`

describe('the lane goes RED on the board chrome as it stood before MOTIR-3985', () => {
  it("reports every one of the fixture's six pre-sweep sites", () => {
    const scan = scanned['board-chrome-pre-sweep.mock.html']
    expect(scan.violations.map(describeSite).sort()).toEqual(
      [
        'b @ 2.65', //                a raw #1aae39 — the worst pair in either asset
        'div.fold::after @ 4.07', //  GENERATED CONTENT, unreachable by querySelectorAll('*')
        'p.measure @ 4.09',
        'p.rule @ 4.09', //           a `font:` SHORTHAND, which jsdom reads back as 16px/normal
        's @ 4.07', //                a raw #e03131 with the <s> line switched off
        'span.note @ 4.09', //        var(--el-text-muted) on the raw #f4f3f1 sheet
      ].sort(),
    )
  })

  it('resolves the raw `#f4f3f1` SHEET as the surface — the thing a token-name walk cannot do', () => {
    const scan = scanned['board-chrome-pre-sweep.mock.html']
    // motir-core's `ownSurface` returns `null` for anything that is not a
    // `var(--el-*)`, so a port of it abstains on every row here.
    expect(scan.violations.every((v) => v.background === '#f4f3f1')).toBe(true)
    expect(scan.violations.filter((v) => v.color === '#787671')).toHaveLength(3)
  })

  it('rules on generated content, and DISCRIMINATES rather than merely firing', () => {
    const scan = scanned['board-chrome-pre-sweep.mock.html']
    const pseudo = scan.sites.filter((s) => s.pseudo === '::after')
    // The same raw `#e03131` fold rule twice: on the sheet it fails at 4.07,
    // and over the white `.frame` — the live geometry in
    // `design-showcase.mock.html` — it clears 1.4.3 by 0.01.
    expect(pseudo.map((s) => `${s.background} ${s.ratio}`).sort()).toEqual([
      '#f4f3f1 4.07',
      '#ffffff 4.51',
    ])
    expect(scan.violations.filter((v) => v.pseudo !== null)).toHaveLength(1)
  })
})

describe('design/marketing/** clears WCAG 1.4.3', () => {
  it('scans enough of each asset for a zero to mean something', () => {
    for (const path of ASSETS) {
      const scan = scanned[path.split('/').pop() as string]
      expect(scan.sites.length).toBeGreaterThan(MINIMUM_SITES_PER_ASSET)
    }
  })

  it('rules on the LIVE `.fold::after` — the generated content an element walk cannot reach', () => {
    // The card's own instance: `design-showcase.mock.html`'s fold rule, a raw
    // `#e03131` over the white `.frame`, clearing 1.4.3 by 0.01. It is measured
    // here rather than argued about, and it is the reason the pseudo arm exists:
    // `document.querySelectorAll('*')` cannot reach it, so MOTIR-3985's element
    // scan needed a separate hand probe to see it at all.
    const folds = scanned['design-showcase.mock.html'].sites.filter(
      (site) =>
        site.selector.endsWith('.fold::after') ||
        site.selector.endsWith('.fold-390::after'),
    )
    expect(folds.length).toBeGreaterThan(0)
    for (const fold of folds) {
      expect(`${fold.color} on ${fold.background} @ ${fold.ratio}`).toBe(
        '#e03131 on #ffffff @ 4.51',
      )
      expect(fold.fontPx).toBe(10)
      expect(fold.fontWeight).toBe(700)
    }
  })

  it('has no undispositioned site below its threshold', () => {
    const scans = ASSETS.map((path) => scanned[path.split('/').pop() as string])
    const open = scans.map((scan) => ({
      ...scan,
      violations: scan.violations.filter(
        (v) =>
          !DISPOSITIONED.some(
            (d) =>
              d.file === v.file &&
              d.selector === v.selector &&
              d.text === v.text &&
              d.ratio === v.ratio,
          ),
      ),
    }))
    expect(formatViolations(open)).toBe(
      `scanned ${scans.reduce((n, s) => n + s.sites.length, 0)} text-bearing sites; 0 below WCAG 1.4.3`,
    )
  })

  it('carries no disposition that has stopped describing a real site', () => {
    const all = ASSETS.flatMap(
      (path) => scanned[path.split('/').pop() as string].violations,
    )
    for (const d of DISPOSITIONED) {
      expect(
        all.filter(
          (v) =>
            v.file === d.file &&
            v.selector === d.selector &&
            v.text === d.text &&
            v.ratio === d.ratio,
        ),
        `${d.file} ${d.selector} "${d.text}" @ ${d.ratio} is dispositioned and no longer measures that way — ` +
          `re-measure it and either delete the entry or restate its reason`,
      ).toHaveLength(1)
    }
  })
})
