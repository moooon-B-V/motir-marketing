// THE SUBPROCESSOR SEAM, page side (Story MOTIR-3909 · MOTIR-4011).
//
// `content/legal/subprocessors.md` and `model-providers.md` are a published
// legal representation: naming a company that receives nothing, or omitting one
// that does, is a false statement in a document a customer's privacy reviewer
// reads. They used to be held honest by a guard in `motir-core` that read the
// page AND the evidence — that repository's `package.json` and its outbound
// hosts.
//
// The pages are here now and the evidence is not, so the guard split
// (`motir-core` `docs/decisions/public-surface-hosts.md` AMENDMENT 2 §E):
//
//   motir-core        the MEASUREMENT — its own tree against the EGRESS MANIFEST
//                     it commits and serves at `/api/legal/egress-manifest`.
//   HERE              the DISCLOSURE — every vendor row on these pages has a
//                     manifest entry, and every manifest entry has a row.
//
// This module is the comparison, kept PURE so both directions can be driven from
// fixtures and shown going red. The parse is here too, because a seam that
// disagrees about what a "vendor row" IS has not compared anything.

/**
 * The sections whose table rows name a VENDOR. A section not listed here is
 * invisible by construction, and that is deliberate: both pages carry
 * explanatory tables — the three-read method table, the transfer-position
 * summary — whose first bolded cell is not a company.
 */
export const VENDOR_SECTIONS: Readonly<Record<string, readonly string[]>> = {
  'subprocessors.md': [
    'Core subprocessors',
    'Sign-in',
    'Product analytics',
    'Optional integrations',
    'Corporate correspondence',
    'Payments',
  ],
  'model-providers.md': ['The providers'],
}

/** The section that records each disclosed vendor's Chapter V basis. */
export const TRANSFER_BASIS_SECTION = 'Transfer bases'

/**
 * Every vendor named in the given sections of one page.
 *
 * ⚠️ THE NAME IS THE FIRST BOLDED SPAN, and the legal entity that follows it in
 * parentheses is NOT part of it — `| **Fly.io** (Fly.io, Inc.) | …` is the
 * vendor `Fly.io`. The manifest names vendors the same way, which is what lets
 * the two be compared at all; a seam that matched on the whole cell would
 * disagree the first time a company was renamed in one place.
 */
export function vendorsInSections(
  markdown: string,
  sections: readonly string[],
): Set<string> {
  const found = new Set<string>()
  let current = ''
  for (const line of markdown.split('\n')) {
    const heading = /^#+\s+(.*)$/.exec(line)
    if (heading) current = heading[1]!.trim()
    if (!sections.some((prefix) => current.startsWith(prefix))) continue
    const row = /^\|\s+\*\*([^*]+)\*\*/.exec(line)
    if (row) found.add(row[1]!.trim())
  }
  return found
}

export interface SeamDivergence {
  /** Disclosed on a page, absent from the manifest — a company we may not reach. */
  readonly disclosedWithoutEntry: string[]
  /** In the manifest, on no page — egress we have not disclosed. */
  readonly entryWithoutDisclosure: string[]
}

/**
 * Compare the two sides.
 *
 * ⚠️ BOTH DIRECTIONS, AND THEY ARE DIFFERENT WRONGS. A vendor in the manifest
 * with no row means this software reaches a company we have not told anybody
 * about — the failure the disclosure exists to prevent. A row with no manifest
 * entry means we have named a company that receives nothing, which is a false
 * statement in the other direction and is corrected by removing the row, never
 * by adding a signature to make it true.
 */
export function compareSeam(
  disclosed: ReadonlySet<string>,
  manifestVendors: readonly string[],
): SeamDivergence {
  const inManifest = new Set(manifestVendors)
  return {
    disclosedWithoutEntry: [...disclosed]
      .filter((v) => !inManifest.has(v))
      .sort(),
    entryWithoutDisclosure: [...inManifest]
      .filter((v) => !disclosed.has(v))
      .sort(),
  }
}
