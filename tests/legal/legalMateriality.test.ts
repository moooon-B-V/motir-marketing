// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { listLegalDocuments } from '@/lib/legal/documents'

/**
 * THE MATERIALITY GUARD, RE-HOMED (Bug MOTIR-4133).
 *
 * `motir-core`'s `tests/legal/legalVersionGuard.test.ts` guarded the published
 * legal set while the documents lived there. The documents left for this
 * repository with MOTIR-4009, and that repository now reads a CONFIGURED
 * MANIFEST (MOTIR-4007) — operator configuration, not an authored file with a
 * reviewable diff. So two of that guard's assertions had nowhere left to stand:
 * the EXCLUSION-SET check and the REVIEWED_BASELINE tripwire. They stand here,
 * because this is the repository that has the diff.
 *
 * ⚠️ THE PARITY HALF OF THAT GUARD IS NOT HERE, AND ITS ABSENCE IS DELIBERATE.
 * `tests/legal/legalReachability.test.ts` (MOTIR-4011) already asserts that
 * every published `version` parses as `<major>.<minor>.<patch>`, that every
 * document has a title, and that the front-matter block closes. Repeating it
 * here would be a second copy to keep current, not a second guard.
 *
 * ── WHAT THIS FILE PROTECTS ─────────────────────────────────────────────────
 * `content/legal/terms.md` §14 promises that we "will not treat silence as
 * agreement to a material change", and that non-material changes "take effect
 * when published". The mechanism carrying that promise is a semver convention:
 *
 *   * **MAJOR or MINOR bump ⇒ MATERIAL.** Every signed-in reader is held and
 *     asked to agree again.
 *   * **PATCH bump ⇒ NON-MATERIAL.** Takes effect when published. Silent.
 *
 * Nothing checks that an author bumped the component matching what they
 * actually changed, and nothing can: only a person reading the diff knows
 * whether a change was a clarification or a new obligation. What this file
 * restores is the PROMPT to make that read — the tripwire below goes red on the
 * next material bump, and clearing it is the act of recording the read.
 *
 * ── ⚠️ WHAT IT DOES NOT PROVE, said here rather than left to be discovered ──
 * **Nothing about what `motir-core` is serving right now.** The comparator
 * below is this repository's reading of the convention published in
 * `content/legal/terms.md` §14 — a document in THIS tree — and not a port of
 * `motir-core`'s `lib/legal/consent.ts`. That repository's `isMaterialChange`
 * decides who is actually held; this suite has no network and asserts nothing
 * about it. A change to the convention itself is a change to §14, and §14 is
 * here, which is what keeps the two from drifting apart silently.
 *
 * **And it cannot tell a material change shipped AS a PATCH.** That residual
 * risk was accepted by the guard this replaces, for the same reason, and it is
 * accepted here. The asymmetry is worth remembering when in doubt:
 * **over-asking costs a screen, under-asking costs a promise. Round up.**
 */

/** A parsed semver triple, or `null` for anything that is not one. */
function parseSemanticVersion(
  raw: string | null | undefined,
): { major: number; minor: number; patch: number } | null {
  if (typeof raw !== 'string') return null
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(raw.trim())
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

/**
 * Is the move from `from` to `to` MATERIAL under §14?
 *
 * An unparseable version on either side answers `true` — the safe direction,
 * and the same direction `motir-core` fails in: a version nobody can read is a
 * version whose materiality nobody can rule out. `legalReachability.test.ts`
 * is what keeps that arm unreachable in practice.
 */
function isMaterialChange(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  if (from == null) return true
  const before = parseSemanticVersion(from)
  const after = parseSemanticVersion(to)
  if (!before || !after) return true
  if (after.major !== before.major) return after.major > before.major
  if (after.minor !== before.minor) return after.minor > before.minor
  // Same major AND minor: whatever moved was a patch, and §14 says a patch
  // takes effect when published.
  return false
}

/**
 * The three documents re-consent is asked for, with the clause that puts each
 * one in the set. Mirrors `motir-core`'s `RECONSENT_DOCUMENT_SLUGS`; the
 * REASONS are quoted from documents in THIS repository, so they are checkable
 * from here.
 */
const RECONSENT_DOCUMENTS: ReadonlyArray<readonly [string, string]> = [
  [
    'terms',
    'terms.md §15 makes the Terms, the AUP and the Privacy Policy "the whole agreement"',
  ],
  [
    'privacy',
    'privacy.md §12 promises that where a change affects the terms you accepted, you will be asked to review them',
  ],
  [
    'acceptable-use',
    'acceptable-use.md forms part of the Terms of Service, by its own header',
  ],
]

/**
 * The four documents the re-consent set deliberately EXCLUDES, each with the
 * published ground that excludes it.
 *
 * ⚠️ THIS IS THE ASSERTION WITH THE SUBTLEST FAILURE. Each exclusion in
 * `motir-core`'s `lib/legal/consent.ts` is justified by a ground published in
 * one of these documents. If a document stops existing, the exclusion does not
 * break — it quietly keeps excluding, with its reason now pointing at nothing.
 * A reason that outlives its citation is the thing this test makes loud.
 */
const EXCLUDED_DOCUMENTS: ReadonlyArray<readonly [string, string]> = [
  [
    'cookies',
    'no consent is sought at all — cookies.md: "there is no consent banner", under the ePrivacy Art. 5(3) exemption; a future non-essential cookie brings one',
  ],
  [
    'dpa',
    'a template signed bilaterally and amended through its own §6 / §11 — not part of what an individual accepts at sign-up',
  ],
  [
    'subprocessors',
    'terms.md §14 names "a new sub-processor already covered by the Privacy Policy" as NON-material; dpa.md §6 gives DPA customers a thirty-day objection window instead',
  ],
  [
    'model-providers',
    'a factual roster — model-providers.md: "no notice period attaches to an edit here"',
  ],
]

/**
 * The version of each re-consent document that a person has last read a diff
 * for and confirmed the semver component of.
 *
 * ⚠️ It is a COPY of `content/legal/`, taken deliberately — never derived from
 * it. The two diverging is the whole signal; a baseline read out of the same
 * front matter it is checked against would be a comparison of a value with
 * itself, which is exactly the tautology MOTIR-3806 found sitting here for the
 * whole life of the guard this replaces.
 *
 * **WHEN IT IS UPDATED:** only in the pull request that ships a revision, and
 * only after somebody has read that diff and decided whether what moved was
 * material (MAJOR / MINOR) or not (PATCH). Editing this map IS that decision
 * being recorded. Bumping it to clear a red test without making that read puts
 * the tripwire back where MOTIR-3806 found it.
 *
 *   * **`terms` · `acceptable-use` at `1.0.0`** — the launch set as approved.
 *     Neither has been revised since.
 *   * **`privacy` at `1.1.0`** — MOTIR-3705 widened §6 to cover work-item
 *     attribution anonymisation and recorded the component on the record:
 *     "version 1.0.0 -> 1.1.0 — MINOR, i.e. MATERIAL, so re-consent prompts."
 *
 * RE-READ at this card's own base (`motir-marketing` `origin/main` @ 031befd)
 * rather than copied from the retired guard — the read is quoted in the pull
 * request that shipped this file.
 */
const REVIEWED_BASELINE: Record<string, string> = {
  terms: '1.0.0',
  privacy: '1.1.0',
  'acceptable-use': '1.0.0',
}

describe('the published legal set supports the materiality convention', () => {
  const documents = listLegalDocuments()
  const published = new Set(documents.map((doc) => doc.slug))

  it('is not vacuous — there are documents to check', () => {
    // Every assertion below iterates or looks up, so an empty or truncated read
    // passes all of them having measured nothing. Seven is what ships today;
    // `>=` makes an eighth document growth rather than a red suite.
    expect(documents.length).toBeGreaterThanOrEqual(7)
  })

  it.each(RECONSENT_DOCUMENTS)(
    'publishes %s, which re-consent is asked for — %s',
    (slug) => {
      // A slug in the re-consent set with no file behind it holds nobody, by
      // design: a hold nobody can clear is worse than no hold. So the failure
      // is SILENT — the mechanism simply stops asking about that document.
      // Loud is better.
      expect(
        published.has(slug),
        `${slug} is in the re-consent set but is no longer published`,
      ).toBe(true)
    },
  )

  it.each(EXCLUDED_DOCUMENTS)(
    'still publishes %s, which the re-consent set deliberately EXCLUDES — %s',
    (slug) => {
      expect(
        published.has(slug),
        `${slug} is cited as an exclusion but no longer published`,
      ).toBe(true)
    },
  )

  it('has published no material revision the baseline has not been read against', () => {
    // THE TRIPWIRE. The published version is compared against the PINNED
    // baseline above — two independent values, which is the whole difference
    // from the assertion this replaced. It goes red the moment a MAJOR or MINOR
    // bump lands without REVIEWED_BASELINE moving with it, and the failure IS
    // the prompt to check that the component chosen matches what actually moved.
    //
    // A PATCH bump passes, deliberately: §14 says a patch takes effect when
    // published, so it is not something a person has to be stopped for.
    for (const [slug] of RECONSENT_DOCUMENTS) {
      const document = documents.find((candidate) => candidate.slug === slug)
      expect(document, `${slug} is published`).toBeDefined()
      expect(
        isMaterialChange(REVIEWED_BASELINE[slug], document?.version),
        `${slug}: published ${document?.version} is a material move past the ` +
          `reviewed baseline ${REVIEWED_BASELINE[slug]}. Read the diff, decide ` +
          `whether the component matches what moved, then record that read by ` +
          `updating REVIEWED_BASELINE.`,
      ).toBe(false)
    }
  })

  it('CAN fail — a minor bump above each baseline is reported material, a patch is not', () => {
    // THE MUTATION CHECK, and it is the half MOTIR-3806 was missing rather than
    // an extra. The assertion above only ever exercises the PASSING direction,
    // and a guard exercised in one direction is indistinguishable from a guard
    // that cannot fail — which is precisely how a tautology sat in the retired
    // file being counted as coverage. So the same call, on the same baselines,
    // must come back `true` for a minor bump and `false` for a patch: proving
    // it fires, and proving it still discriminates rather than having become
    // "always ask".
    for (const [slug] of RECONSENT_DOCUMENTS) {
      const baseline = REVIEWED_BASELINE[slug]
      const parsed = parseSemanticVersion(baseline)
      if (!parsed) throw new Error(`${slug} baseline ${baseline} is not semver`)

      const materialBump = `${parsed.major}.${parsed.minor + 1}.0`
      expect(
        isMaterialChange(baseline, materialBump),
        `${slug}: ${baseline} → ${materialBump} must prompt`,
      ).toBe(true)

      const patchBump = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`
      expect(
        isMaterialChange(baseline, patchBump),
        `${slug}: ${baseline} → ${patchBump} must stay silent`,
      ).toBe(false)

      const majorBump = `${parsed.major + 1}.0.0`
      expect(
        isMaterialChange(baseline, majorBump),
        `${slug}: ${baseline} → ${majorBump} must prompt`,
      ).toBe(true)
    }
  })

  it('reads an UNPARSEABLE version as material — the safe direction', () => {
    // The arm `legalReachability.test.ts` keeps unreachable in practice. It is
    // asserted here anyway because the tripwire's verdict depends on it: if an
    // unparseable version answered "not material", a typo would clear the
    // tripwire rather than trip it.
    expect(isMaterialChange('1.0.0', 'one point oh')).toBe(true)
    expect(isMaterialChange('1.0.0', '')).toBe(true)
    expect(isMaterialChange(null, '1.0.0')).toBe(true)
  })

  it('does not treat a version that went BACKWARDS as material', () => {
    // A version that went backwards is a mistake in the repository, and holding
    // every signed-in reader out of the product is not how it gets fixed.
    expect(isMaterialChange('2.0.0', '1.0.0')).toBe(false)
    expect(isMaterialChange('1.1.0', '1.0.0')).toBe(false)
  })
})
