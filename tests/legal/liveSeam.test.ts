// @vitest-environment node
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  EGRESS_MANIFEST_PATH,
  EGRESS_MANIFEST_URL,
  EgressManifestShapeError,
  evaluateSeam,
  manifestVendors,
  parseEgressManifest,
  renderVerdict,
  type EgressManifest,
} from '@/lib/legal/liveSeam'

/**
 * The PURE half of the live seam (MOTIR-4139) — everything except the fetch.
 *
 * ⚠️ THIS FILE IS IN THE OFFLINE LANE ON PURPOSE and touches no network. The
 * live comparison is `tests/seam/subprocessorSeamLive.test.ts`, which the
 * default lane excludes. What is asserted here is the part that decides what a
 * red run MEANS: the shape validation that stops a vacuous green, and the
 * unreachable-is-a-failure decision, which is a policy rather than a mechanism
 * and would otherwise be a sentence in a comment nobody executes.
 */

const manifest = (vendors: string[]): EgressManifest => ({
  version: 1,
  measuredIn: 'motir-core',
  vendors: vendors.map((vendor) => ({ vendor, basis: 'repository-evidence' })),
})

describe('the consumed artifact is the PUBLISHED one', () => {
  it('builds the URL from the configured app origin, never a literal', () => {
    // `vitest.config.mts` sets the origin to a NON-production value precisely
    // so this assertion can tell "built from the variable" from "happens to
    // equal the string somebody expected".
    expect(EGRESS_MANIFEST_URL).toBe(
      `https://app.test.motir.co${EGRESS_MANIFEST_PATH}`,
    )
    expect(EGRESS_MANIFEST_PATH).toBe('/api/legal/egress-manifest')
  })

  it('commits no copy of the manifest anywhere in this repository', () => {
    // AMENDMENT 2 §E rejects a committed copy outright, and §8's rule is the
    // reason: a published artifact the consumer fetches does not rot; a copy
    // does. The sibling assertion for the OpenAPI document is in
    // `tests/docs/docs.test.ts`.
    expect(existsSync('lib/legal/egress-manifest.json')).toBe(false)
    expect(existsSync('content/legal/egress-manifest.json')).toBe(false)
  })
})

describe('parseEgressManifest', () => {
  it('accepts the served document and keeps every vendor, whatever its basis', () => {
    const parsed = parseEgressManifest({
      version: 1,
      measuredIn: 'motir-core',
      vendors: [
        { vendor: 'Fly.io', basis: 'repository-evidence', evidence: ['host'] },
        { vendor: 'Stripe', basis: 'not-evidenced-here' },
      ],
    })
    // ⚠️ `not-evidenced-here` survives. It means the repository cannot SEE the
    // egress, never that the vendor receives nothing — filtering it would drop
    // exactly the rows whose disclosure nothing else can check.
    expect(manifestVendors(parsed)).toEqual(['Fly.io', 'Stripe'])
  })

  it('REFUSES an empty vendor list rather than comparing against nothing', () => {
    // The failure this prevents: a serialization change in motir-core arrives
    // as "the manifest names nobody", and the seam then reports every disclosed
    // vendor as un-evidenced — a red check blaming the wrong repository — or a
    // green one if the page parse broke in the same window.
    expect(() =>
      parseEgressManifest({
        version: 1,
        measuredIn: 'motir-core',
        vendors: [],
      }),
    ).toThrow(EgressManifestShapeError)
  })

  it.each([
    ['not an object', 'null', null],
    ['no version', 'a missing version', { measuredIn: 'x', vendors: [{}] }],
    ['no vendors array', 'a missing list', { version: 1, measuredIn: 'x' }],
    [
      'an unnamed vendor',
      'a nameless row',
      {
        version: 1,
        measuredIn: 'x',
        vendors: [{ basis: 'repository-evidence' }],
      },
    ],
  ])('rejects %s', (_label, _why, body) => {
    expect(() => parseEgressManifest(body)).toThrow(EgressManifestShapeError)
  })
})

describe('evaluateSeam', () => {
  it('AGREES when both sides name the same vendors', () => {
    const verdict = evaluateSeam(
      new Set(['Fly.io', 'Neon']),
      manifest(['Neon', 'Fly.io']),
    )
    expect(verdict).toEqual({ state: 'agreed', vendorCount: 2 })
  })

  it('DIVERGES on a manifest entry no page discloses — undisclosed egress', () => {
    const verdict = evaluateSeam(
      new Set(['Fly.io']),
      manifest(['Fly.io', 'Snowflake']),
    )
    expect(verdict).toEqual({
      state: 'diverged',
      divergence: {
        disclosedWithoutEntry: [],
        entryWithoutDisclosure: ['Snowflake'],
      },
    })
  })

  it('DIVERGES on a disclosed vendor with no entry — a company named for nothing', () => {
    const verdict = evaluateSeam(
      new Set(['Fly.io', 'Resend']),
      manifest(['Fly.io']),
    )
    expect(verdict).toEqual({
      state: 'diverged',
      divergence: {
        disclosedWithoutEntry: ['Resend'],
        entryWithoutDisclosure: [],
      },
    })
  })
})

describe('renderVerdict — the decided failure modes', () => {
  const url = 'https://app.example.test/api/legal/egress-manifest'

  it('agreement exits 0', () => {
    expect(
      renderVerdict({ state: 'agreed', vendorCount: 21 }, url).exitCode,
    ).toBe(0)
  })

  it('divergence exits non-zero and NAMES the vendors on each side', () => {
    const { exitCode, report } = renderVerdict(
      {
        state: 'diverged',
        divergence: {
          disclosedWithoutEntry: ['Resend'],
          entryWithoutDisclosure: ['Snowflake'],
        },
      },
      url,
    )
    expect(exitCode).not.toBe(0)
    expect(report).toContain('Snowflake')
    expect(report).toContain('Resend')
    // The correction differs per direction, and getting it backwards is how a
    // false disclosure gets "fixed" by adding a dependency.
    expect(report).toContain('REMOVING the row')
  })

  it('⚠️ UNREACHABLE exits NON-ZERO — it is a failure, never a skip', () => {
    // This is the decision AMENDMENT 3 §C records, asserted rather than
    // described. The tempting arm — pass when the fetch fails, so a motir-core
    // outage never blocks this repository — publishes a legal representation
    // nobody checked and reports success.
    const { exitCode, report } = renderVerdict(
      { state: 'unreachable', reason: 'HTTP 503' },
      url,
    )
    expect(exitCode).not.toBe(0)
    expect(report).toContain('UNREACHABLE')
    // ...and it must not read as a divergence: the two send a reader to
    // different repositories.
    expect(report).not.toContain('DIVERGED')
  })
})
