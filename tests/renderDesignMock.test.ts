import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  candidateWidths,
  DEVICE_SCALE_FACTOR,
  exportPathFor,
  formatRow,
  measure,
  parseArgs,
  pngDimensions,
  STANDARD_WIDTHS,
  verdictFor,
} from '../scripts/design/render-design-mock'

/*
 * The re-export tool (MOTIR-4003) — `scripts/design/render-design-mock.ts`.
 *
 * ⚠️ WHY THIS FILE IS NOT UNDER `tests/design/`. That directory belongs to the
 * BROWSER lane (`vitest.design.config.mts`, MOTIR-4001) and is EXCLUDED from the
 * root config, because the `Test` job installs no chromium. Nothing asserted
 * here needs one — every export below is pure arithmetic over a PNG header —
 * so putting it there would cost the design lane a second file to gain nothing,
 * and putting a browser-driving spec here would fail rather than run.
 *
 * ⚠️ WHAT IT CANNOT SAY, stated because the card asks for both halves and only
 * one of them lives here: nothing in this file proves that a re-render of
 * `landing.mock.html` reproduces `landing.png`. That is a claim about a RENDERER
 * BUILD, not about this repository — it is the tool's own `EXACT` / `DIMS` /
 * `DRIFT` verdict, it is read by running the tool, and asserting it here would
 * pin CI's chromium to whichever build the author happened to have. The
 * verdicts measured for this card are recorded in its pull request, with the
 * command that produced them.
 *
 * What IS asserted is the arithmetic that decides those verdicts, and the one
 * property of the asset tree the tool's narrowing depends on.
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const AREA = path.join(ROOT, 'design', 'marketing')

/** A minimal, valid PNG header — IHDR is bytes 16..24 of every PNG. */
function pngHeader(width: number, height: number, tail = 0): Buffer {
  const buffer = Buffer.alloc(24 + tail)
  Buffer.from([0x89, 0x50, 0x4e, 0x47]).copy(buffer, 0)
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  return buffer
}

describe('pngDimensions', () => {
  it('reads width and height out of the IHDR', () => {
    expect(pngDimensions(pngHeader(2640, 14860))).toEqual({
      width: 2640,
      height: 14860,
    })
  })

  it('reads the committed exports this area actually ships', () => {
    expect(
      pngDimensions(readFileSync(path.join(AREA, 'design-showcase.png'))),
    ).toEqual({ width: 2880, height: 7916 })
  })
})

describe('measure', () => {
  it('distinguishes two PNGs of identical dimensions by digest', () => {
    const a = measure(pngHeader(1200, 800, 1))
    const b = measure(pngHeader(1200, 800, 2))
    expect(a.width).toBe(b.width)
    expect(a.height).toBe(b.height)
    expect(a.digest).not.toBe(b.digest)
  })
})

describe('exportPathFor', () => {
  it('maps a mock to its same-basename export', () => {
    expect(exportPathFor('design/marketing/landing.mock.html')).toBe(
      'design/marketing/landing.png',
    )
  })

  it('leaves a path that is not a mock alone', () => {
    expect(exportPathFor('design/marketing/design-notes.md')).toBe(
      'design/marketing/design-notes.md',
    )
  })
})

describe('verdictFor', () => {
  const committed = { width: 2640, height: 14860, digest: 'aaa' }

  it('is EXACT when the baseline render is byte-identical', () => {
    expect(verdictFor(committed, { ...committed })).toBe('EXACT')
  })

  it('is DIMS when the dimensions match and the bytes do not', () => {
    expect(verdictFor(committed, { ...committed, digest: 'bbb' })).toBe('DIMS')
  })

  it('is DRIFT when the height moved — the export predates the environment', () => {
    expect(
      verdictFor(committed, { width: 2640, height: 14762, digest: 'bbb' }),
    ).toBe('DRIFT')
  })

  it('is null when the width differs — that render is not a candidate at all', () => {
    expect(
      verdictFor(committed, { width: 2880, height: 14860, digest: 'aaa' }),
    ).toBeNull()
  })
})

describe('candidateWidths', () => {
  it('leads with the direct candidate — the export width over the scale factor', () => {
    expect(candidateWidths(2640)[0]).toBe(1320)
  })

  it('never probes wider than the direct candidate', () => {
    // A viewport wider than the export cannot have produced it, so every
    // STANDARD_WIDTH above the direct candidate is dropped rather than tried.
    const widths = candidateWidths(1536)
    expect(Math.max(...widths)).toBe(1536 / DEVICE_SCALE_FACTOR)
    for (const wide of STANDARD_WIDTHS.filter((w) => w > 768)) {
      expect(widths).not.toContain(wide)
    }
  })

  it('puts an overflow correction ahead of the standard widths', () => {
    const widths = candidateWidths(2640, [1288])
    expect(widths.slice(0, 2)).toEqual([1320, 1288])
  })

  it('drops a non-integer direct candidate rather than rounding it', () => {
    // An ODD committed width cannot come from a 2x render, and rounding would
    // let it match something near it. It reports FAIL instead — see the header
    // of render-design-mock.ts on why the scale factor is pinned.
    expect(candidateWidths(2641)).not.toContain(1320.5)
  })

  it('honours a forced width verbatim, for an asset with no baseline', () => {
    expect(candidateWidths(2640, [1288], 1280)).toEqual([1280])
  })
})

describe('parseArgs', () => {
  it('reads the mocks and defaults to writing', () => {
    expect(parseArgs(['design/marketing/landing.mock.html'])).toEqual({
      verify: false,
      forcedWidth: null,
      mocks: ['design/marketing/landing.mock.html'],
    })
  })

  it('takes --verify as a flag, not as a file', () => {
    const { verify, mocks } = parseArgs(['--verify', 'a.mock.html'])
    expect(verify).toBe(true)
    expect(mocks).toEqual(['a.mock.html'])
  })

  it("does not mistake --width's VALUE for a mock", () => {
    expect(parseArgs(['--width', '1280', 'a.mock.html'])).toEqual({
      verify: false,
      forcedWidth: 1280,
      mocks: ['a.mock.html'],
    })
  })

  it('keeps the first argument when there is no --width', () => {
    // `indexOf` returns -1 for an absent flag, and -1 + 1 is index 0 — the
    // first mock. Guarding that is the whole reason this case is asserted.
    expect(parseArgs(['a.mock.html', 'b.mock.html']).mocks).toEqual([
      'a.mock.html',
      'b.mock.html',
    ])
  })

  it('rejects a --width that is not an integer', () => {
    expect(() => parseArgs(['--width', 'wide', 'a.mock.html'])).toThrow(
      /--width takes an integer/,
    )
  })
})

describe('formatRow', () => {
  it('is tab-separated, verdict first', () => {
    expect(
      formatRow('DIMS', '1320@2x', 'design/marketing/landing.mock.html').split(
        '\t',
      ),
    ).toEqual(['DIMS', '1320@2x', 'design/marketing/landing.mock.html'])
  })
})

describe('the asset tree the pinned scale factor has to reproduce', () => {
  const mocks = readdirSync(AREA).filter((file) => file.endsWith('.mock.html'))

  it('has assets to render', () => {
    expect(mocks.length).toBeGreaterThan(0)
  })

  it.each(mocks)(
    `%s has a same-basename export whose width a ${DEVICE_SCALE_FACTOR}x render can produce`,
    (mock) => {
      const png = readFileSync(path.join(AREA, exportPathFor(mock)))
      const { width } = pngDimensions(png)
      // The tool pins `deviceScaleFactor: 2` rather than searching for it, so an
      // asset committed at another scale is unreachable by it. Naming that here
      // is cheaper than discovering it as a FAIL row mid-re-export.
      expect(width % DEVICE_SCALE_FACTOR).toBe(0)
    },
  )
})
