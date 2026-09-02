import { APP_ORIGIN } from '@/lib/appOrigin'
import { compareSeam, type SeamDivergence } from '@/lib/legal/subprocessorSeam'

/**
 * THE LIVE SUBPROCESSOR SEAM (MOTIR-4139) — the half that compares the real
 * page against the manifest `motir-core` is ACTUALLY SERVING.
 *
 * `subprocessorSeam.ts` is the PURE half (MOTIR-4011): it proves the parse
 * against the real pages and the comparison in both directions from fixtures.
 * What it deliberately does not prove is that there IS no divergence right now,
 * and its own header says so. Two green suites could therefore coexist with a
 * company receiving customer data whose name never reached the published page —
 * the exact failure the whole mechanism was built to end.
 *
 * ── ⚠️ THE TRANSPORT IS NOT A CHOICE THIS MODULE MAKES ─────────────────────
 * `motir-core` `docs/decisions/public-surface-hosts.md` AMENDMENT 2 §E already
 * decided it: *a SERVED, VERSIONED artifact the consumer FETCHES — never a
 * committed copy* — the same shape MOTIR-4046 shipped for the OpenAPI document
 * in `lib/docs.ts`. This module is that consumption for the second artifact.
 * A copy of the manifest in this repository is rejected by §8 and by §E's own
 * table of alternatives; `tests/legal/subprocessorSeam.test.ts` asserts none
 * exists.
 *
 * ── ⚠️ WHERE THIS RUNS, AND WHY `pnpm test` NEVER TOUCHES THE NETWORK ──────
 * {@link fetchEgressManifest} is reached only by `pnpm test:seam`
 * (`vitest.seam.config.mts` → `tests/seam/`), which the default lane EXCLUDES.
 * A unit suite that fetched a live deployment would couple this repository's
 * PULL-REQUEST CI to that deployment's uptime — the one coupling §E's split
 * exists to avoid — so the seam lane runs on the DEPLOY and on a SCHEDULE, and
 * never on a pull request (AMENDMENT 3 §B).
 *
 * This is the same separation `test:design` already uses for a lane that needs
 * a real browser; that one is excluded for a capability the default lane lacks,
 * this one for a coupling it must not acquire.
 *
 * Everything else in this file is PURE and IS exercised offline, by
 * `tests/legal/liveSeam.test.ts` — including {@link renderVerdict}, which is
 * where the decided unreachable-failure mode actually lives.
 */

/** The stable public path `motir-core` serves the manifest at. */
export const EGRESS_MANIFEST_PATH = '/api/legal/egress-manifest'

/**
 * ⚠️ BUILT FROM THE CONFIGURED ORIGIN, never a literal — same rule as
 * `lib/docs.ts`'s spec URL. A hardcoded `app.motir.co` would work in production
 * and silently check a preview build against production data.
 */
export const EGRESS_MANIFEST_URL = `${APP_ORIGIN}${EGRESS_MANIFEST_PATH}`

/** One vendor row of the served manifest. */
export interface EgressManifestEntry {
  readonly vendor: string
  readonly basis: string
  readonly evidence?: readonly string[]
}

/** The document `motir-core` serves at {@link EGRESS_MANIFEST_PATH}. */
export interface EgressManifest {
  readonly version: number
  readonly measuredIn: string
  readonly vendors: readonly EgressManifestEntry[]
}

/** The manifest could not be OBTAINED. Distinct from it disagreeing. */
export class EgressManifestUnreachableError extends Error {
  override readonly name = 'EgressManifestUnreachableError'
}

/** The manifest was obtained and is not the document this seam can read. */
export class EgressManifestShapeError extends Error {
  override readonly name = 'EgressManifestShapeError'
}

/**
 * Validate the fetched body into an {@link EgressManifest}.
 *
 * ⚠️ AN EMPTY VENDOR LIST IS A SHAPE ERROR, NOT AN EMPTY MANIFEST. A registry
 * change in `motir-core` that broke the serialization would otherwise arrive
 * here as "the manifest names nobody", and this seam would report every
 * disclosed vendor as un-evidenced — a red check blaming the wrong repository —
 * or, if the parse on the page side broke in the same window, a GREEN one. The
 * pure half refuses a vacuous parse for the same reason and in the same words.
 */
export function parseEgressManifest(body: unknown): EgressManifest {
  if (typeof body !== 'object' || body === null)
    throw new EgressManifestShapeError('manifest is not an object')

  const doc = body as Record<string, unknown>
  if (typeof doc.version !== 'number')
    throw new EgressManifestShapeError('manifest carries no numeric `version`')
  if (typeof doc.measuredIn !== 'string')
    throw new EgressManifestShapeError('manifest carries no `measuredIn`')
  if (!Array.isArray(doc.vendors))
    throw new EgressManifestShapeError('manifest carries no `vendors` array')
  if (doc.vendors.length === 0)
    throw new EgressManifestShapeError(
      'manifest names NO vendors — refusing a vacuous comparison',
    )

  const vendors = doc.vendors.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null)
      throw new EgressManifestShapeError(`vendor ${i} is not an object`)
    const entry = raw as Record<string, unknown>
    if (typeof entry.vendor !== 'string' || entry.vendor.trim() === '')
      throw new EgressManifestShapeError(`vendor ${i} has no name`)
    if (typeof entry.basis !== 'string')
      throw new EgressManifestShapeError(`vendor ${i} has no basis`)
    return { vendor: entry.vendor, basis: entry.basis }
  })

  return { version: doc.version, measuredIn: doc.measuredIn, vendors }
}

/**
 * Every vendor the manifest names, whatever its basis.
 *
 * ⚠️ THE BASIS IS NOT A FILTER. `not-evidenced-here` means the repository
 * cannot SEE the egress, never that the vendor receives nothing — the manifest's
 * own header says so. Dropping those rows would remove from the comparison
 * exactly the vendors whose disclosure nothing else can check.
 */
export function manifestVendors(manifest: EgressManifest): string[] {
  return manifest.vendors.map((v) => v.vendor)
}

/** What the live comparison found. */
export type SeamVerdict =
  | { readonly state: 'agreed'; readonly vendorCount: number }
  | { readonly state: 'diverged'; readonly divergence: SeamDivergence }
  | { readonly state: 'unreachable'; readonly reason: string }

/** Compare the disclosed set against a manifest that WAS obtained. */
export function evaluateSeam(
  disclosed: ReadonlySet<string>,
  manifest: EgressManifest,
): SeamVerdict {
  const divergence = compareSeam(disclosed, manifestVendors(manifest))
  const agreed =
    divergence.disclosedWithoutEntry.length === 0 &&
    divergence.entryWithoutDisclosure.length === 0
  return agreed
    ? { state: 'agreed', vendorCount: manifest.vendors.length }
    : { state: 'diverged', divergence }
}

/**
 * ⚠️ THE DECIDED FAILURE MODE, IN ONE FUNCTION — an UNREACHABLE manifest is a
 * FAILURE, not a skip (AMENDMENT 3 §C).
 *
 * The tempting arm is to pass when the fetch fails, so that a `motir-core`
 * outage never blocks this repository. That arm publishes a legal
 * representation nobody checked and reports success — and it is indistinguishable
 * in the log from a check that ran. Not being ABLE to verify a disclosure is not
 * permission to publish it, so both lanes go red and a person reads why. The
 * three states are rendered distinctly for exactly that reason: DIVERGED names
 * the other repository, UNREACHABLE names this one's network.
 */
export function renderVerdict(
  verdict: SeamVerdict,
  url: string,
): { exitCode: number; report: string } {
  switch (verdict.state) {
    case 'agreed':
      return {
        exitCode: 0,
        report:
          `SEAM OK — the published pages and ${url} agree on all ` +
          `${verdict.vendorCount} vendors, in both directions.`,
      }
    case 'diverged': {
      const { disclosedWithoutEntry, entryWithoutDisclosure } =
        verdict.divergence
      const lines = [
        'SEAM DIVERGED — the pages and the served manifest disagree.',
        '',
      ]
      if (entryWithoutDisclosure.length > 0)
        lines.push(
          'IN THE MANIFEST, ON NO PAGE — this software reaches a company we ' +
            'have not disclosed. Add the row (and its transfer basis):',
          ...entryWithoutDisclosure.map((v) => `  + ${v}`),
          '',
        )
      if (disclosedWithoutEntry.length > 0)
        lines.push(
          'DISCLOSED, WITH NO MANIFEST ENTRY — we have named a company that ' +
            'receives nothing. Correct it by REMOVING the row, never by adding ' +
            'a signature in motir-core to make it true:',
          ...disclosedWithoutEntry.map((v) => `  - ${v}`),
          '',
        )
      lines.push(
        `The manifest is served by motir-core at ${url}; the pages are ` +
          '`content/legal/{subprocessors,model-providers}.md` here.',
      )
      return { exitCode: 1, report: lines.join('\n') }
    }
    case 'unreachable':
      return {
        exitCode: 1,
        report:
          `SEAM UNREACHABLE — could not obtain or read ${url}: ` +
          `${verdict.reason}\n\n` +
          'This is a FAILURE by decision (public-surface-hosts.md AMENDMENT 3 ' +
          '§C), not a divergence and not a skip: the seam could not be checked, ' +
          'so the disclosure is unverified. It says nothing about whether the ' +
          'pages are correct — only that nobody has established that they are.',
      }
  }
}

/**
 * The whole live check, as one call: read the manifest, compare, and turn a
 * failure to OBTAIN it into a verdict rather than an exception.
 *
 * ⚠️ THIS FUNCTION IS WHY THE DECIDED FAILURE MODE IS REAL RATHER THAN
 * DESCRIBED. Without it {@link fetchEgressManifest} throws straight past
 * {@link renderVerdict}, and the operator holding a red run gets a stack trace
 * about a fetch instead of the sentence saying the disclosure is unverified and
 * which repository to look in. The exit code is non-zero either way, which is
 * exactly what makes the omission easy to miss: the gate still worked, and the
 * only thing lost was the reason. (Found by running the unreachable case rather
 * than reasoning about it.)
 *
 * A SHAPE error is folded in here too. It is not the same event as an outage —
 * the document arrived and could not be read — but it has the same consequence
 * for a reader: the seam was not checked. The reason string carries which.
 */
export async function resolveSeam(
  disclosed: ReadonlySet<string>,
  options: { url?: string; attempts?: number; delayMs?: number } = {},
): Promise<SeamVerdict> {
  try {
    return evaluateSeam(disclosed, await fetchEgressManifest(options))
  } catch (error) {
    if (
      error instanceof EgressManifestUnreachableError ||
      error instanceof EgressManifestShapeError
    )
      return { state: 'unreachable', reason: `${error.name}: ${error.message}` }
    throw error
  }
}

/**
 * Fetch the published manifest.
 *
 * Retries are for a transient deploy window, not for an outage: `motir-core`
 * restarts on its own releases, and a release that happens to overlap this
 * check should not fail it. A manifest that is still unreachable after them is
 * reported as such.
 */
export async function fetchEgressManifest(
  options: { url?: string; attempts?: number; delayMs?: number } = {},
): Promise<EgressManifest> {
  const url = options.url ?? EGRESS_MANIFEST_URL
  const attempts = options.attempts ?? 4
  const delayMs = options.delayMs ?? 5000

  let lastReason = 'no attempt was made'
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        lastReason = `HTTP ${res.status}`
      } else {
        return parseEgressManifest(await res.json())
      }
    } catch (error) {
      // ⚠️ A SHAPE ERROR IS NOT RETRIED. It is a deterministic disagreement
      // about what the document IS, and three more identical answers add
      // nothing but four minutes.
      if (error instanceof EgressManifestShapeError) throw error
      lastReason = error instanceof Error ? error.message : String(error)
    }
    if (attempt < attempts) await new Promise((r) => setTimeout(r, delayMs))
  }
  throw new EgressManifestUnreachableError(
    `${url} after ${attempts} attempts: ${lastReason}`,
  )
}
