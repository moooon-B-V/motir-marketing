// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * THE ERASURE-WINDOW GUARD, RE-HOMED (Bug MOTIR-4233).
 *
 * `motir-core`'s `tests/users/dataSubjectRequests.test.ts` used to open
 * `content/legal/privacy.md`, pull the retention window out of §6 with a regex,
 * and assert it equalled `ACCOUNT_ERASURE_WINDOW_DAYS` — the constant the
 * account-erasure sweep actually runs on. That assertion failed in BOTH
 * directions: an edit to the constant with no edit to the policy went red, and
 * so did the reverse. It is the strongest form this guard can take, and it had
 * already earned its place once, when counsel revised this very section
 * (MOTIR-3705, `privacy` 1.0.0 → 1.1.0).
 *
 * ⚠️ THAT FORM IS NO LONGER AVAILABLE TO ANYBODY, and this file is one half of
 * what replaces it. The documents left `motir-core` for this repository
 * (MOTIR-4009) because they are moooon B.V.'s contract text and do not belong
 * in a GPL-3.0 codebase other people fork. The constant stayed, because it is
 * application behaviour. That split is right and it is exactly the split the
 * old guard cannot survive: a test can read a file, and it cannot read another
 * repository.
 *
 * ── THE TWO HALVES, AND WHAT EACH ONE CATCHES ───────────────────────────────
 *
 *   * **HERE** — the published sentence in `content/legal/privacy.md` §6 is
 *     asserted against `PUBLISHED_ERASURE_WINDOW_DAYS` below. **A counsel edit
 *     to §6 goes red HERE**, in the repository that has the diff.
 *   * **`motir-core`** — `lib/users/dataSubjectRequests.ts` declares
 *     `ACCOUNT_ERASURE_WINDOW_DAYS`, and `tests/users/dataSubjectRequests.test.ts`
 *     pins it to the same published number, quoting this sentence and its URL.
 *     **An edit to the erasure behaviour goes red THERE.**
 *
 * Between them the promise still cannot move on one side alone without
 * something going red. What is HONESTLY lost is that neither half can see its
 * counterpart, so the two literals agree by convention rather than by
 * construction — which is why each names the other in its own comment, and why
 * a reader who edits one is told in the failure message where the other is.
 *
 * ── ⚠️ WHAT THIS FILE DOES NOT PROVE ────────────────────────────────────────
 * **Nothing about what `motir-core` is erasing right now.** This suite has no
 * network and does not import that repository. If §6 and
 * `ACCOUNT_ERASURE_WINDOW_DAYS` have drifted, the red arrives on whichever side
 * was edited SECOND — and if somebody edits both to different numbers, both
 * sides stay green. That residual is the price of the repository split; it is
 * named here rather than left to be discovered.
 *
 * ── ⚠️ THE CONSTANT IS A PINNED COPY, NEVER DERIVED ─────────────────────────
 * `PUBLISHED_ERASURE_WINDOW_DAYS` is written out by hand, exactly as
 * `legalMateriality.test.ts`'s `REVIEWED_BASELINE` is and for the same reason:
 * a value read out of the same document it is checked against is a comparison
 * of a value with itself. That tautology is what MOTIR-3806 found sitting in
 * the retired guard for its whole life, counted as coverage. Two independent
 * values, or this guard proves nothing.
 */

/** Where the published legal copy lives — the same root `lib/legal/documents.ts` reads. */
const PRIVACY_POLICY = join(process.cwd(), 'content', 'legal', 'privacy.md')

/**
 * The retention window the Privacy Policy PUBLISHES, as a contractual promise
 * under GDPR Art. 13 — not an implementation detail.
 *
 * ⚠️ **THIS NUMBER HAS A TWIN IN ANOTHER REPOSITORY.** `motir-core`'s
 * `lib/users/dataSubjectRequests.ts` declares `ACCOUNT_ERASURE_WINDOW_DAYS`
 * with the same value, and its own test pins it to this same published number.
 * **CHANGING THIS ALONE IS HALF A CHANGE**: it means counsel revised §6, and
 * the sweep in `motir-core` is still running on the old figure until that
 * repository is edited too. Do both, in the same breath, or do neither.
 *
 * **WHEN IT IS UPDATED:** only in the pull request that ships a revision of §6,
 * and only alongside the matching edit in `motir-core`. Bumping it to clear a
 * red test is how the promise and the behaviour come apart silently — which is
 * the entire failure this file exists to make loud.
 */
const PUBLISHED_ERASURE_WINDOW_DAYS = 30

/**
 * The §6 heading, verbatim. Sliced on rather than searched for across the whole
 * document, so a `**30 days**` appearing in some other section can never stand
 * in for the one this guard is about.
 */
const RETENTION_SECTION_HEADING = '## 6. How long we keep it'

/**
 * The published sentence's shape — the SAME regex `motir-core`'s retired
 * assertion used, kept byte for byte so the two halves are recognisably one
 * guard split in two.
 */
const ERASURE_WINDOW = /we erase or anonymise within \*\*(\d+) days\*\*/

/**
 * §6, from its heading to the next `##`. Exported shape kept PURE — it takes
 * the document text rather than reading it — so the mutation check below can
 * drive it with a deliberately edited copy without touching the file on disk.
 *
 * Returns `null` when the heading is absent, which is a DIFFERENT failure from
 * "the section is there and says something else", and is reported as one.
 */
function retentionSection(document: string): string | null {
  const start = document.indexOf(RETENTION_SECTION_HEADING)
  if (start === -1) return null
  const rest = document.slice(start + RETENTION_SECTION_HEADING.length)
  const end = rest.indexOf('\n## ')
  return end === -1 ? rest : rest.slice(0, end)
}

/**
 * The number §6 states, or `null` when it does not state one in the published
 * words. Pure, for the same reason `retentionSection` is.
 */
function publishedWindowDays(section: string): number | null {
  const match = ERASURE_WINDOW.exec(section)
  return match ? Number(match[1]) : null
}

describe('the published erasure window is the one the product promises', () => {
  const document = readFileSync(PRIVACY_POLICY, 'utf8')
  const section = retentionSection(document)

  it('is not vacuous — §6 is present and has a body to read', () => {
    // Every assertion below reads `section`. A slice that silently came back
    // empty — a renamed heading, a reordered document — would pass a regex
    // check by matching nothing at all, so the emptiness is caught here first
    // and reported as itself rather than as a wrong number.
    expect(
      section,
      `${RETENTION_SECTION_HEADING} is no longer a heading in privacy.md. The ` +
        `erasure promise moved or was renamed — find it, then update ` +
        `RETENTION_SECTION_HEADING here AND check that ` +
        `motir-core's ACCOUNT_ERASURE_WINDOW_DAYS still matches the new copy.`,
    ).not.toBeNull()
    expect(section?.trim().length ?? 0).toBeGreaterThan(0)
  })

  it('states the window in the words the guard reads', () => {
    // A separate assertion from the equality below, because "§6 no longer says
    // this" and "§6 says a different number" are opposite findings that need
    // opposite responses: the first is a rewrite to follow, the second is a
    // promise that moved.
    expect(
      publishedWindowDays(section ?? ''),
      `privacy.md §6 no longer states the erasure window in the expected ` +
        `words ("we erase or anonymise within **N days**"). Update ` +
        `ERASURE_WINDOW here to the new wording AND check that motir-core's ` +
        `ACCOUNT_ERASURE_WINDOW_DAYS (lib/users/dataSubjectRequests.ts) still ` +
        `matches what §6 now promises.`,
    ).not.toBeNull()
  })

  it('publishes exactly PUBLISHED_ERASURE_WINDOW_DAYS', () => {
    // THE GUARD. §6 ("How long we keep it") is a PROMISE, not documentation:
    // it tells every user we "erase or anonymise within **30 days**".
    expect(
      publishedWindowDays(section ?? ''),
      `privacy.md §6 now publishes a different retention window than this ` +
        `guard's ${PUBLISHED_ERASURE_WINDOW_DAYS}. If counsel revised §6, this ` +
        `is HALF a change: update PUBLISHED_ERASURE_WINDOW_DAYS here AND ` +
        `ACCOUNT_ERASURE_WINDOW_DAYS in motir-core ` +
        `(lib/users/dataSubjectRequests.ts, pinned by ` +
        `tests/users/dataSubjectRequests.test.ts), because the sweep is still ` +
        `running on the old figure until you do. See bug MOTIR-4233.`,
    ).toBe(PUBLISHED_ERASURE_WINDOW_DAYS)
  })

  it('says the same number in the PROSE of §6 as it does in the table', () => {
    // §6 states the window TWICE — once as a figure in the retention table, and
    // once in words in the last-owner paragraph ("if you end up in it during
    // the thirty days"). Two copies of one number in one section drift exactly
    // as easily as two copies in two repositories, and the word form is the one
    // a find-and-replace of "30" misses.
    const inWords: Record<number, string> = {
      14: 'fourteen',
      30: 'thirty',
      60: 'sixty',
      90: 'ninety',
    }
    const word = inWords[PUBLISHED_ERASURE_WINDOW_DAYS]
    expect(
      word,
      `no word form is recorded for ${PUBLISHED_ERASURE_WINDOW_DAYS} — add one ` +
        `to inWords so this assertion keeps measuring something`,
    ).toBeDefined()
    expect(
      section?.includes(`${word} days`),
      `privacy.md §6 states the window as a figure but its prose no longer ` +
        `says "${word} days". One of the two copies moved without the other — ` +
        `read §6 and make them agree.`,
    ).toBe(true)
  })

  it('CAN fail — a deliberately edited §6 is read as a different number', () => {
    // THE MUTATION CHECK, and it is the half that makes the assertions above
    // mean anything rather than an extra. Every check above only ever exercises
    // the PASSING direction, and a guard exercised in one direction is
    // indistinguishable from a guard that cannot fail — which is precisely how
    // a tautology sat in the retired motir-core file being counted as coverage
    // (MOTIR-3806). So the same extractor, on a copy of the real §6 with the
    // number changed, must come back with the NEW number.
    //
    // ⚠️ THE MUTANT IS DERIVED FROM WHAT §6 ACTUALLY SAYS, never written as a
    // literal. A hard-coded mutant is a no-op edit on the day the document
    // happens to publish that same figure, and the check then fails for a
    // reason that has nothing to do with what it is testing — which is how it
    // behaved when this guard was first exercised against a deliberately
    // edited policy.
    const published = publishedWindowDays(section ?? '')
    expect(published, '§6 states a window to mutate').not.toBeNull()
    const mutant = (published ?? 0) + 1
    const edited = (section ?? '').replace(
      ERASURE_WINDOW,
      `we erase or anonymise within **${mutant} days**`,
    )
    expect(edited, 'the edit applied — otherwise this proves nothing').not.toBe(
      section,
    )
    expect(publishedWindowDays(edited)).toBe(mutant)
    expect(publishedWindowDays(edited)).not.toBe(published)

    // And a §6 that stops stating a window at all reads as null, not as zero —
    // the branch the second assertion above depends on.
    expect(
      publishedWindowDays('## 6. How long we keep it\n\nnothing.'),
    ).toBeNull()
    expect(
      retentionSection('# Privacy Policy\n\nno section six here'),
    ).toBeNull()
  })
})
