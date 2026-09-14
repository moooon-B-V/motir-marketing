import { beforeAll, describe, expect, it } from 'vitest'
import { resolve } from 'node:path'
import { ROOT, designMocks } from './designTree'
import {
  formatStateViolations,
  formatViolations,
  scanMocks,
  type InkSite,
  type MockScan,
  type StateSite,
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

const FIXTURE = resolve(
  ROOT,
  'tests/design/fixtures/board-chrome-pre-sweep.mock.html',
)

/*
 * MOTIR-5448 — the STATE arm's evidence, for the same reason as the fixture
 * above: every pair it plants CLEARS at rest and fails only while an element is
 * hovered or focused, so the resting arm passes it — which is what the lane did
 * for every `:hover` rule in `design/**` before the state arm existed.
 */
const STATE_FIXTURE = resolve(
  ROOT,
  'tests/design/fixtures/state-ink-pre-arm.mock.html',
)

/*
 * EVERY `*.mock.html` under `design/`, WALKED rather than listed (MOTIR-4990).
 *
 * This was a literal list of paths, and three cards in a row (MOTIR-4113,
 * MOTIR-4393, MOTIR-4975) each added their own asset to it with a comment
 * saying that forgetting would leave the lane green over an asset nobody
 * opened. Each remembered; nothing would have failed if one had not. A walk
 * removes the remembering instead of documenting it — which is why it was
 * chosen over a drift guard that fails on an unlisted mock: that guard would
 * still make the author edit this list, and would only move the moment of
 * forgetting from "silently" to "at CI time".
 *
 * The fixture lives under `tests/`, so the walk never picks it up as an asset.
 */
const ASSETS = designMocks().map((path) => resolve(ROOT, path))

/** Scans are keyed by basename, so the walk must not hand two mocks one key. */
const basenameOf = (path: string) => path.split('/').pop() as string

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

/*
 * STATE sites measured below 1.4.3 and ruled NOT a failure (MOTIR-5448). Same
 * discipline as `DISPOSITIONED`, with the STATE in the key: the same element at
 * rest and hovered are two different pairs, and an allowance for one must not
 * cover the other.
 */
const STATE_DISPOSITIONED: {
  file: string
  selector: string
  state: string
  text: string
  ratio: number
  why: string
}[] = [
  {
    file: 'landing.mock.html',
    selector: 'button.btn.primary',
    state: ':hover',
    text: 'Starting…',
    ratio: 3.07,
    why:
      'The same INACTIVE component `DISPOSITIONED` already exempts at rest — the ' +
      "door's `disabled aria-busy` submitting state under `.btn[disabled] { " +
      'opacity: 0.72 }` — now with `.btn.primary:hover` painting ' +
      '`--el-accent-pressed` under it. A disabled button still matches `:hover` ' +
      'in CSS, so the pair is real paint, and 1.4.3 exempts it by name under ' +
      'Incidental. The DECLARED hovered pair (#ffffff on #4534b3) clears AA; ' +
      'the 3.07 is the fade.',
  },
]

/*
 * State rules that match NO element in their own mock, so they paint no pair
 * and there is nothing to measure. Named rather than tolerated: a rule that
 * starts matching an element leaves this list and must then produce sites, and
 * one that stops matching arrives here as a failure until it is recorded.
 */
const STATE_RULES_DRAWING_NOTHING: {
  file: string
  selector: string
  state: string
  why: string
}[] = [
  {
    file: 'public-projects.mock.html',
    selector: '.index a:hover',
    state: ':hover',
    why:
      "`design/legal/legal.mock.html`'s chrome stylesheet, which this asset " +
      'composes byte-for-byte; the board draws no `.index` rail, so the rule ' +
      'has no element to hover.',
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
  for (const scan of await scanMocks([FIXTURE, STATE_FIXTURE, ...ASSETS]))
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

const describeState = (site: StateSite) =>
  `${site.selector} ${site.state} @ ${site.ratio}`

describe('the STATE arm goes RED on a pair only a hover or a focus paints', () => {
  it('the resting arm passes the fixture — the blindness this arm exists for', () => {
    const scan = scanned['state-ink-pre-arm.mock.html']
    expect(scan.sites.length).toBeGreaterThan(0)
    expect(formatViolations([scan])).toBe(
      `scanned ${scan.sites.length} text-bearing sites; 0 below WCAG 1.4.3`,
    )
  })

  it('reports each planted pair, with its STATE named', () => {
    const scan = scanned['state-ink-pre-arm.mock.html']
    expect(scan.states.violations.map(describeState).sort()).toEqual(
      [
        'a :hover @ 4.37', //                MOTIR-453: --el-link on a hovered --el-surface-soft
        'span.meta :hover @ 4.34', //        the state is on the ANCESTOR `.row`
        'span.field :focus-visible @ 4.34', // a focus state, not a pointer state
      ].sort(),
    )
    expect(formatStateViolations([scan])).toContain(
      'span.field :focus-visible  14px/400  #787671 on #fafaf9',
    )
  })

  it('DISCRIMINATES: a repaint that clears is measured and passes, and a rule that paints no pair is not a state rule', () => {
    const scan = scanned['state-ink-pre-arm.mock.html']
    expect(
      scan.states.sites.find((s) => s.text === 'A hover that clears'),
    ).toMatchObject({ state: ':hover', color: '#1a1a1a' })
    expect(scan.states.rules.map((r) => r.selector).sort()).toEqual(
      [
        '.field:focus-visible',
        '.index a:hover',
        '.ok:hover',
        '.row:hover',
      ].sort(),
    )
  })
})

describe('design/marketing/** clears WCAG 1.4.3', () => {
  it('measures every mock the design tree holds, under a key no other mock shares', () => {
    // The walk is the population now, so the two ways it could still measure
    // less than the tree are an EMPTY walk and a basename COLLISION: `scanned`
    // is keyed by basename, and two areas each shipping `index.mock.html` would
    // leave one scan silently overwriting the other.
    expect(ASSETS.length).toBeGreaterThanOrEqual(6)
    const names = ASSETS.map(basenameOf)
    expect(names.filter((name, i) => names.indexOf(name) !== i)).toEqual([])
    expect(Object.keys(scanned)).toEqual(expect.arrayContaining(names))
  })

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

describe('design/** clears WCAG 1.4.3 in every :hover / :focus-visible state it draws', () => {
  const stateScans = () => ASSETS.map((path) => scanned[basenameOf(path)])

  it('reads every stylesheet and rewrites every state selector — nothing is skipped silently', () => {
    for (const scan of stateScans()) {
      expect(scan.states.unreadableSheets, scan.file).toEqual([])
      expect(scan.states.unrewritten, scan.file).toEqual([])
    }
  })

  it('measures every state rule that repaints — read from the sheets, not listed', () => {
    const rules = stateScans().flatMap((scan) =>
      scan.states.rules.map((rule) => ({ file: scan.file, ...rule })),
    )
    // A floor, for the reason `MINIMUM_SITES_PER_ASSET` states: a walk that
    // silently found no rule reads exactly like a tree with none. 20 is what
    // `design/**` drew when the arm landed; ADDING a rule needs no edit here.
    expect(rules.length).toBeGreaterThanOrEqual(20)

    const drawingNothing = rules.filter((rule) => rule.hosts === 0)
    expect(
      drawingNothing.map((r) => `${r.file} ${r.selector} ${r.state}`).sort(),
    ).toEqual(
      STATE_RULES_DRAWING_NOTHING.map(
        (r) => `${r.file} ${r.selector} ${r.state}`,
      ).sort(),
    )
    for (const rule of rules.filter((r) => r.hosts > 0)) {
      expect(
        rule.sites,
        `${rule.file} ${rule.selector} matched ${rule.hosts} element(s) and measured no text`,
      ).toBeGreaterThan(0)
    }
  })

  it('has no undispositioned state site below its threshold', () => {
    const open = stateScans().map((scan) => ({
      ...scan,
      states: {
        ...scan.states,
        violations: scan.states.violations.filter(
          (v) =>
            !STATE_DISPOSITIONED.some(
              (d) =>
                d.file === v.file &&
                d.selector === v.selector &&
                d.state === v.state &&
                d.text === v.text &&
                d.ratio === v.ratio,
            ),
        ),
      },
    }))
    expect(formatStateViolations(open)).toBe(
      `scanned ${open.reduce((n, s) => n + s.states.sites.length, 0)} state text sites; 0 below WCAG 1.4.3`,
    )
  })

  it('carries no state disposition that has stopped describing a real site', () => {
    const all = stateScans().flatMap((scan) => scan.states.violations)
    for (const d of STATE_DISPOSITIONED) {
      expect(
        all.filter(
          (v) =>
            v.file === d.file &&
            v.selector === d.selector &&
            v.state === d.state &&
            v.text === d.text &&
            v.ratio === d.ratio,
        ),
        `${d.file} ${d.selector} ${d.state} "${d.text}" @ ${d.ratio} is dispositioned and no longer measures that way — ` +
          `re-measure it and either delete the entry or restate its reason`,
      ).toHaveLength(1)
    }
  })
})
