// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  TRANSFER_BASIS_SECTION,
  VENDOR_SECTIONS,
  compareSeam,
  vendorsInSections,
} from '@/lib/legal/subprocessorSeam'

/**
 * THE SUBPROCESSOR SEAM, page side (Story MOTIR-3909 · MOTIR-4011).
 *
 * The disclosure is here; the EVIDENCE that a vendor receives anything is in
 * `motir-core` — its `package.json` and its outbound hosts — and could not
 * follow the pages, because measured against a marketing site's dependency tree
 * it would pass forever. So `motir-core` emits an EGRESS MANIFEST from the
 * measurement (MOTIR-4008) and this half holds the pages against it
 * (`motir-core` `docs/decisions/public-surface-hosts.md` AMENDMENT 2 §E).
 *
 * ⚠️ WHAT THIS FILE PROVES, AND WHAT IT DOES NOT — read this before trusting a
 * green run. It proves the PARSE (against the real pages) and the COMPARISON
 * (both directions, from fixtures). It does NOT prove the live AGREEMENT with
 * whatever `motir-core` is serving right now, because this lane has no network
 * and a test that reached production would couple this repository's CI to that
 * deployment's uptime — which is exactly the coupling §E's split exists to
 * avoid. That half is a separate obligation and is filed; nothing here should be
 * read as covering it.
 */

const LEGAL_DIR = join(process.cwd(), 'content', 'legal')
const page = (file: string) => readFileSync(join(LEGAL_DIR, file), 'utf8')

/** Every vendor disclosed anywhere, across both pages — the REAL documents. */
function disclosedVendors(): Set<string> {
  const all = new Set<string>()
  for (const [file, sections] of Object.entries(VENDOR_SECTIONS)) {
    for (const vendor of vendorsInSections(page(file), sections))
      all.add(vendor)
  }
  return all
}

describe('the parse, against the REAL pages', () => {
  it('is not vacuous — both pages parsed and named vendors', () => {
    expect(disclosedVendors().size).toBeGreaterThanOrEqual(8)
  })

  it('every declared section still EXISTS on its page', () => {
    // A rename, or a table moved to the other page, would silently empty part of
    // the disclosed set and every assertion below would pass on less.
    for (const [file, sections] of Object.entries(VENDOR_SECTIONS)) {
      const source = page(file)
      for (const section of sections) {
        expect(
          source.includes(`## ${section}`),
          `${file} lost the section "${section}"`,
        ).toBe(true)
      }
    }
  })

  it('takes the vendor NAME, not the legal entity beside it', () => {
    // `| **Fly.io** (Fly.io, Inc.) | …` is the vendor `Fly.io`. The manifest
    // names it the same way, and that is what makes the two comparable.
    expect(disclosedVendors().has('Fly.io')).toBe(true)
    expect([...disclosedVendors()].some((v) => v.includes('Inc.'))).toBe(false)
  })

  it('ignores the explanatory tables whose first cell is not a company', () => {
    // `subprocessors.md`'s method table has rows like `| **Repository read** |`,
    // under a section this module does not declare.
    expect(disclosedVendors().has('Repository read')).toBe(false)
    expect(disclosedVendors().has('Platform read')).toBe(false)
  })

  it('gives every disclosed vendor a TRANSFER BASIS row', () => {
    // The half a privacy reviewer actually reads: naming a company and saying
    // nothing about how the data lawfully reaches it is not disclosure, it is a
    // name. This assertion is page-local and belongs here rather than in the
    // manifest, which carries no legal judgements at all.
    const withBasis = vendorsInSections(page('subprocessors.md'), [
      TRANSFER_BASIS_SECTION,
    ])
    const missing = [...disclosedVendors()]
      .filter((v) => !withBasis.has(v))
      .sort()
    expect(missing).toEqual([])
  })
})

describe('the comparison — both directions, and they are different wrongs', () => {
  const DISCLOSED = new Set(['Fly.io', 'Neon', 'Resend'])

  it('is quiet when the two sides agree', () => {
    expect(compareSeam(DISCLOSED, ['Fly.io', 'Neon', 'Resend'])).toEqual({
      disclosedWithoutEntry: [],
      entryWithoutDisclosure: [],
    })
  })

  it('RED when the manifest carries a vendor no page discloses', () => {
    // The failure the disclosure exists to prevent: this software reaches a
    // company nobody has been told about.
    expect(
      compareSeam(DISCLOSED, ['Fly.io', 'Neon', 'Resend', 'Sentry']),
    ).toEqual({
      disclosedWithoutEntry: [],
      entryWithoutDisclosure: ['Sentry'],
    })
  })

  it('RED when a page discloses a vendor the manifest does not carry', () => {
    // The opposite wrong: naming a company that receives nothing. Corrected by
    // removing the row — never by adding a signature to make it true.
    expect(compareSeam(DISCLOSED, ['Fly.io', 'Neon'])).toEqual({
      disclosedWithoutEntry: ['Resend'],
      entryWithoutDisclosure: [],
    })
  })

  it('reports BOTH at once rather than stopping at the first', () => {
    expect(compareSeam(DISCLOSED, ['Fly.io', 'Stripe'])).toEqual({
      disclosedWithoutEntry: ['Neon', 'Resend'],
      entryWithoutDisclosure: ['Stripe'],
    })
  })
})

describe('the real pages against a manifest', () => {
  it('goes RED against a manifest missing a vendor the pages disclose', () => {
    // The real disclosed set, driven through the real comparison — so the
    // fixture being wrong is what fails, not the parse.
    const result = compareSeam(disclosedVendors(), ['Fly.io'])
    expect(result.disclosedWithoutEntry.length).toBeGreaterThan(5)
  })

  it('goes RED against a manifest naming a vendor no page discloses', () => {
    const result = compareSeam(disclosedVendors(), [
      ...disclosedVendors(),
      'Snowflake',
    ])
    expect(result.entryWithoutDisclosure).toEqual(['Snowflake'])
  })
})

describe('no COPY of the manifest is committed here', () => {
  // ⚠️ §8's rule, which §E applies to this artifact: *a published artifact
  // `motir-core` emits does not rot; a copied spec does.* `lib/docs.ts` takes
  // the same shape for the OpenAPI document and `tests/docs/docs.test.ts`
  // asserts the same property — this is that assertion for the second artifact.
  it('commits no egress-manifest file', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib', 'legal', 'subprocessorSeam.ts'),
      'utf8',
    )
    expect(source).not.toContain('egress-manifest.json')
    expect(source).not.toContain('"vendors":')
  })
})
