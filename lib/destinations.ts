import { APP_ORIGIN } from './appOrigin'

/**
 * Every cross-origin destination this page can send a visitor to, built from
 * the ONE configured origin (`lib/appOrigin.ts`).
 *
 * The three doors are the routing contract
 * `design/marketing/design-notes.md` § *The three doors* records; the rest are
 * the nav, footer and error-state exits the same asset draws.
 */

/** `POST { idea }` → `201 { draftId }` (motir-core MOTIR-1458). */
export const IDEA_DRAFT_ENDPOINT = `${APP_ORIGIN}/api/idea-draft`

/**
 * DOOR 1 — start something new. The idea travels as a DRAFT ID, never as a
 * query parameter: motir-core's receiver plants a `motir_pending_idea` cookie
 * when `/sign-in` claims the draft, which is what carries it through auth into
 * the `/onboarding` entrance's carried panel (MOTIR-1458 → MOTIR-1462).
 */
export function signInWithDraft(draftId: string): string {
  return `${APP_ORIGIN}/sign-in?draft=${encodeURIComponent(draftId)}`
}

/**
 * DOOR 2 — an existing project. `?intent=import` is SPECIFIED and NOT READ YET
 * on the motir-core side; MOTIR-3746 owns the reader. The link degrades rather
 * than dying: without the parameter a visitor still lands on the `/onboarding`
 * entrance, which already draws the import row. Per the design asset's own
 * disposition, do NOT "fix" this by rewriting it to `?next=` — the parameter
 * is the contract and the card that reads it is scheduled work.
 */
export const IMPORT_DOOR = `${APP_ORIGIN}/sign-in?intent=import`

/**
 * DOOR 3 — project management only. Same shape, same disposition: the reader
 * is MOTIR-3639, and MOTIR-1118 is the record that PICKS the carrier.
 *
 * ⚠️ WHY THIS SHIPS AN ASSUMPTION RATHER THAN WAITING. MOTIR-1118 is `todo`,
 * so there is no record to read, and MOTIR-1152 carries no `blocked_by` onto
 * it deliberately (see that card): the edge was drawn and removed on evidence,
 * because 1118 sits outside story 8.3's subtree and `validate_work_item` on
 * MOTIR-656 returned `valid: false` with it. `/sign-up?intent=tracker` is what
 * the design asset's routing table pins and what MOTIR-3639's own body names
 * as the door it receives. If 1118 later picks a different carrier — its
 * mechanism A is `?next=/home?intent=tracker` — this constant is the ONE line
 * that changes, and `tests/destinations.test.ts` is what says so.
 *
 * (`tracker` here is a CODE IDENTIFIER — a query-parameter value — which is
 * the one place the word is allowed to survive. It is never rendered.)
 */
export const FREE_DOOR = `${APP_ORIGIN}/sign-up?intent=tracker`

/** Door 1's fallback exit, drawn in the submit-failed state. */
export const SIGN_UP = `${APP_ORIGIN}/sign-up`

export const SIGN_IN = `${APP_ORIGIN}/sign-in`
export const EXPLORE = `${APP_ORIGIN}/explore`
export const DOCS = `${APP_ORIGIN}/docs`
export const LEGAL_PRIVACY = `${APP_ORIGIN}/legal/privacy`
export const LEGAL_TERMS = `${APP_ORIGIN}/legal/terms`
export const LEGAL_INDEX = `${APP_ORIGIN}/legal`

/** The one destination that is NOT motir-core, and so not built from the origin. */
export const SOURCE_REPO = 'https://github.com/moooon-B-V/motir-core'
