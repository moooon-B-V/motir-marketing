import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EGRESS_MANIFEST_URL,
  renderVerdict,
  resolveSeam,
} from '@/lib/legal/liveSeam'
import {
  VENDOR_SECTIONS,
  vendorsInSections,
} from '@/lib/legal/subprocessorSeam'

/**
 * THE ASSERTION THE OTHER TWO HALVES DELIBERATELY DO NOT MAKE (MOTIR-4139).
 *
 * `motir-core`'s `tests/legal/egress-manifest-guard.test.ts` proves the manifest
 * describes ITS OWN TREE. This repository's `tests/legal/subprocessorSeam.test.ts`
 * proves the parse against the real pages and the comparison in both directions
 * FROM FIXTURES. Compose the two and the only thing anybody actually wanted is
 * still missing: that the page a privacy reviewer reads matches what the
 * software really reaches. Each half is a correct answer to a smaller question,
 * and the sum of two correct smaller answers is not the larger one.
 *
 * This file is the larger one. It fetches the manifest `motir-core` is SERVING
 * and compares it with the pages THIS repository publishes — no fixture on
 * either side.
 *
 * ⚠️ IT IS NOT IN THE DEFAULT LANE, AND THAT IS THE DESIGN. See
 * `vitest.seam.config.mts`. Running on `pull_request` would make an app.motir.co
 * restart turn an unrelated pull request red, which is the coupling AMENDMENT 2
 * §E's split exists to avoid.
 */

const LEGAL_DIR = join(process.cwd(), 'content', 'legal')

/** Every vendor disclosed anywhere, across both REAL pages. */
function disclosedVendors(): Set<string> {
  const all = new Set<string>()
  for (const [file, sections] of Object.entries(VENDOR_SECTIONS)) {
    const markdown = readFileSync(join(LEGAL_DIR, file), 'utf8')
    for (const vendor of vendorsInSections(markdown, sections)) all.add(vendor)
  }
  return all
}

describe('the REAL pages against the manifest motir-core is SERVING', () => {
  it('agrees in both directions', async () => {
    const disclosed = disclosedVendors()

    // ⚠️ A vacuous page-side parse would make any manifest look over-full, so
    // the disclosed set is floored here exactly as the offline lane floors it.
    expect(disclosed.size).toBeGreaterThanOrEqual(8)

    // ⚠️ `resolveSeam`, NOT `fetchEgressManifest` — an unreachable manifest must
    // arrive here as a VERDICT so the decided message below is what the
    // operator reads. Calling the fetch directly throws straight past
    // `renderVerdict`: still a red run, but one that reports a fetch stack
    // trace instead of "the disclosure is unverified".
    const verdict = await resolveSeam(disclosed)
    const { exitCode, report } = renderVerdict(verdict, EGRESS_MANIFEST_URL)

    // The report is the deliverable of a red run: whoever is holding the
    // failure needs the vendor names and which side they are missing from, not
    // a diffed set literal. Print it before asserting so it survives.
    if (exitCode !== 0) console.error(`\n${report}\n`)

    expect(verdict.state).toBe('agreed')
  })
})
