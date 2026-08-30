/**
 * Re-exports a design asset's `.png` from its `.mock.html` (MOTIR-4003).
 *
 *   node scripts/design/render-design-mock.ts design/marketing/landing.mock.html
 *   pnpm design:render --verify design/marketing/*.mock.html
 *   pnpm design:render --width 1280 design/<area>/<new-surface>.mock.html
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `design/marketing/design-notes.md` states, once per asset, that the `.png` is
 * a "full-page Playwright chromium export, light theme, `deviceScaleFactor: 2`"
 * — a process this repository documented and could not perform. Until MOTIR-4001
 * added the `playwright` devDependency there was no browser here at all, so every
 * design card in this area re-exported by reaching down an absolute path into a
 * SIBLING repository's `node_modules/.pnpm` for motir-core's chromium, and
 * re-derived the render settings from that prose each time.
 *
 * Three things followed. The viewport was recovered by hand (read the committed
 * PNG's width, halve it). The render options were re-typed from a sentence. And
 * — the one that costs — nothing established whether the committed export was
 * even REPRODUCIBLE before the diff, so a height change caused by a renderer
 * upgrade was indistinguishable from one caused by the edit.
 *
 * ── The baseline, which is the whole point ──────────────────────────────────
 *
 * Before writing anything, this renders the mock AS IT STANDS AT `HEAD` and
 * compares that to the committed `.png`. That separates a pixel change YOU made
 * from a pixel change the ENVIRONMENT made, which a binary diff cannot:
 *
 *   EXACT  the baseline render is byte-identical to the committed PNG, so the
 *          new PNG differs from it in exactly what your diff changed.
 *   DIMS   same dimensions, different bytes — the committed export came from a
 *          different renderer build, but nothing reflowed.
 *   DRIFT  different height. The committed PNG predates an environment change
 *          and has not been re-exported since; the height delta belongs to that
 *          gap, not to your diff.
 *
 * ── What this is a PORT of, and what it deliberately is not ─────────────────
 *
 * motir-core ships the same tool as `scripts/render-design-mock.mjs`
 * (MOTIR-3054), over a tree of ~50 assets. This is that script narrowed to what
 * an area of two assets needs, in this repository's own idiom — TypeScript under
 * `scripts/<area>/`, pure helpers exported and a `main()` gated on being the
 * entry point, exactly as `scripts/brand/generate-brand-icons.ts` is, so
 * `tests/renderDesignMock.test.ts` can exercise the arithmetic without launching
 * a browser.
 *
 * What it does NOT carry over, stated rather than discovered:
 *
 *   - **`deviceScaleFactor` is PINNED at 2, not searched.** motir-core searches
 *     `[2, 1]` because one asset there predates the convention and has an ODD
 *     committed dimension, which a 2x render cannot produce. Both assets here
 *     are even and the area note states `deviceScaleFactor: 2` twice, so a search
 *     would only add a second way to reproduce a wrong answer. A future asset
 *     with an odd width therefore reports FAIL rather than silently matching at
 *     1x — which is the correct outcome for an asset that is off-convention.
 *   - **Import from `playwright`, not `@playwright/test`.** This repository
 *     installs the former (MOTIR-4001), which is also what
 *     `tests/design/inkContrastScan.ts` imports. Nothing here uses the test
 *     runner's fixtures, so the runner package is not a dependency.
 *
 * ⚠️ Run it AFTER `prettier --write` on the mock: prettier reformats the markup,
 * so a PNG rendered from the pre-format source is not an export of what lands.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * The area convention, stated in `design/marketing/design-notes.md` for both
 * assets. Pinned rather than searched — see the header.
 */
export const DEVICE_SCALE_FACTOR = 2

/**
 * The viewport HEIGHT a full-page screenshot is taken at. A full-page capture
 * is as tall as the document, so this only matters for a mock that responds to
 * viewport height — none here do, which is why it is one number and not a
 * search.
 */
export const VIEWPORT_HEIGHT = 900

/**
 * Widths to fall back to when the committed export is WIDER than the viewport
 * that produced it and the overflow correction below does not land. Both of this
 * repository's assets are matched by the direct candidate, so this list is a
 * safety net for a future asset rather than a description of the tree.
 */
export const STANDARD_WIDTHS = [1440, 1320, 1280, 1200, 1024, 960, 768, 390]

export type Verdict = 'EXACT' | 'DIMS' | 'DRIFT'

/** A rendered or committed PNG, reduced to what a verdict is taken on. */
export type Measurement = {
  width: number
  height: number
  digest: string
}

/** Reads a PNG's IHDR — bytes 16..24 of every PNG, ahead of any chunk parsing. */
export function pngDimensions(buffer: Buffer): {
  width: number
  height: number
} {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

/** Reduces a PNG buffer to the three numbers a verdict compares. */
export function measure(buffer: Buffer): Measurement {
  const { width, height } = pngDimensions(buffer)
  return {
    width,
    height,
    digest: createHash('sha256').update(buffer).digest('hex'),
  }
}

/** `design/<area>/<surface>.mock.html` → `design/<area>/<surface>.png`. */
export function exportPathFor(mock: string): string {
  return mock.replace(/\.mock\.html$/, '.png')
}

/**
 * The verdict for a baseline render against the committed export.
 *
 * `null` means the render is not a candidate at all — its width does not match,
 * so it was taken at the wrong viewport and says nothing about the environment.
 */
export function verdictFor(
  committed: Measurement,
  baseline: Measurement,
): Verdict | null {
  if (baseline.width !== committed.width) return null
  if (baseline.digest === committed.digest) return 'EXACT'
  return baseline.height === committed.height ? 'DIMS' : 'DRIFT'
}

/**
 * The viewport widths to probe for an export `committedWidth` px wide.
 *
 * The direct candidate is `committedWidth / DEVICE_SCALE_FACTOR`, and for an
 * asset that fits its viewport that is the answer. It is NOT the answer for an
 * asset whose document OVERFLOWS: a full-page screenshot is
 * `max(viewport, scrollWidth)` wide, so an overflowing mock's viewport is
 * NARROWER than its export. `corrections` carries the widths a probe measured
 * (see `overflowCorrectedWidths`), and every candidate is bounded above by the
 * direct one — a wider viewport cannot produce a narrower export.
 */
export function candidateWidths(
  committedWidth: number,
  corrections: number[] = [],
  forcedWidth: number | null = null,
): number[] {
  const direct = committedWidth / DEVICE_SCALE_FACTOR
  if (forcedWidth !== null) return [forcedWidth]
  return [...new Set([direct, ...corrections, ...STANDARD_WIDTHS])].filter(
    (width) => Number.isInteger(width) && width > 0 && width <= direct,
  )
}

/** One tab-separated report row, the tool's whole output for a file. */
export function formatRow(
  verdict: Verdict | 'NEW' | 'FAIL',
  detail: string,
  mock: string,
): string {
  return `${verdict}\t${detail}\t${mock}`
}

export function parseArgs(argv: string[]): {
  verify: boolean
  forcedWidth: number | null
  mocks: string[]
} {
  const verify = argv.includes('--verify')
  const widthAt = argv.indexOf('--width')
  const forcedWidth = widthAt === -1 ? null : Number(argv[widthAt + 1])
  if (forcedWidth !== null && !Number.isInteger(forcedWidth)) {
    throw new Error(`--width takes an integer, got ${argv[widthAt + 1]}`)
  }
  const mocks = argv.filter(
    (arg, index) =>
      !arg.startsWith('--') && (widthAt === -1 || index !== widthAt + 1),
  )
  return { verify, forcedWidth, mocks }
}

/**
 * Reads a path AS IT STANDS AT `HEAD`, never from the working tree.
 *
 * Both reads this makes depend on it. The committed PNG has to come from `HEAD`
 * because on a re-run the working-tree PNG is one this script already wrote, and
 * comparing against that reports every asset EXACT. The mock has to come from
 * `HEAD` because the baseline is the point: a baseline rendered from YOUR edited
 * mock measures nothing.
 */
function readAtHead(repoRelativePath: string): Buffer {
  return execFileSync('git', ['show', `HEAD:${repoRelativePath}`], {
    maxBuffer: 256 * 1024 * 1024,
  })
}

async function main(): Promise<void> {
  const { verify, forcedWidth, mocks } = parseArgs(process.argv.slice(2))
  if (mocks.length === 0) {
    console.error(
      'usage: node scripts/design/render-design-mock.ts [--verify] [--width N] <mock.html…>',
    )
    process.exit(2)
  }

  const { chromium } = await import('playwright')
  const scratch = mkdtempSync(path.join(tmpdir(), 'design-mock-'))
  const browser = await chromium.launch()

  /**
   * Full-page, light theme, at the area's `deviceScaleFactor: 2`.
   *
   * ⚠️ `animations: 'disabled'` is what makes this export REPRODUCIBLE.
   * Playwright's default is `allow`, so a CSS animation or transition is
   * captured at whatever frame the screenshot happens to land on: two renders of
   * an UNCHANGED file then differ in bytes at identical dimensions, which this
   * script would report for ever as DIMS. `landing.mock.html` already carries
   * two, so this is load-bearing here and not merely defensive. `disabled`
   * fast-forwards them to their end state and pins them, making the frame a
   * function of the markup alone — a no-op for an asset that does not animate.
   */
  const shoot = async (fileUrl: string, width: number): Promise<Buffer> => {
    const page = await browser.newPage({
      viewport: { width, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
      colorScheme: 'light',
    })
    await page.goto(fileUrl, { waitUntil: 'networkidle' })
    const buffer = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
    })
    await page.close()
    return buffer
  }

  /**
   * Probes an overflowing asset for the viewport that produced its export.
   *
   * `scrollWidth` tracks the viewport for a mock whose overflow is a fixed-width
   * child, so ONE probe measures the overshoot and one subtraction names the
   * viewport; a second pass covers the case where the overflow itself moved.
   */
  const overflowCorrectedWidths = async (
    baselineUrl: string,
    committedWidth: number,
  ): Promise<number[]> => {
    const direct = committedWidth / DEVICE_SCALE_FACTOR
    const corrections: number[] = []
    let width = direct
    for (let pass = 0; pass < 2; pass += 1) {
      const rendered = pngDimensions(await shoot(baselineUrl, width))
      const overshoot = rendered.width / DEVICE_SCALE_FACTOR - direct
      if (overshoot <= 0) break
      width -= overshoot
      if (!Number.isInteger(width) || width <= 0) break
      corrections.push(width)
    }
    return corrections
  }

  let failed = 0
  try {
    for (const mock of mocks) {
      const png = exportPathFor(mock)
      const target = pathToFileURL(path.resolve(mock)).href

      // A NEW asset has no baseline, so the settings have to be STATED rather
      // than recovered — the one case where `--width` is not an override.
      if (!existsSync(png)) {
        if (forcedWidth === null) {
          console.log(
            formatRow('NEW', 'no committed .png; pass --width to export', mock),
          )
          failed += 1
          continue
        }
        const buffer = await shoot(target, forcedWidth)
        if (!verify) writeFileSync(png, buffer)
        const { width, height } = pngDimensions(buffer)
        console.log(
          formatRow('NEW', `${forcedWidth}@2x\tnew=${width}x${height}`, mock),
        )
        continue
      }

      const committed = measure(readAtHead(png))

      const baselinePath = path.join(scratch, mock.replace(/\//g, '__'))
      writeFileSync(baselinePath, readAtHead(mock))
      const baselineUrl = pathToFileURL(baselinePath).href

      const corrections =
        forcedWidth === null
          ? await overflowCorrectedWidths(baselineUrl, committed.width)
          : []

      let settled: { width: number; verdict: Verdict } | null = null
      for (const width of candidateWidths(
        committed.width,
        corrections,
        forcedWidth,
      )) {
        const verdict = verdictFor(
          committed,
          measure(await shoot(baselineUrl, width)),
        )
        if (verdict === null) continue
        // A DRIFT is a real candidate — the width matched — but a later one may
        // still reproduce the export exactly, so keep looking past it.
        settled ??= { width, verdict }
        if (verdict !== 'DRIFT') {
          settled = { width, verdict }
          break
        }
      }

      if (settled === null) {
        console.log(
          formatRow(
            'FAIL',
            `no viewport at ${DEVICE_SCALE_FACTOR}x reproduces ${committed.width}px wide`,
            mock,
          ),
        )
        failed += 1
        continue
      }

      const buffer = await shoot(target, settled.width)
      if (!verify) writeFileSync(png, buffer)
      const fresh = pngDimensions(buffer)
      console.log(
        formatRow(
          settled.verdict,
          `${settled.width}@${DEVICE_SCALE_FACTOR}x\t` +
            `committed=${committed.width}x${committed.height}\t` +
            `new=${fresh.width}x${fresh.height}`,
          mock,
        ),
      )
    }
  } finally {
    await browser.close()
  }

  process.exit(failed > 0 ? 1 : 0)
}

// Guarded so the test can import the pure helpers without launching a browser.
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
) {
  await main()
}
