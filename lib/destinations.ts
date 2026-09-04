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

/**
 * Explore is now SAME-ORIGIN (MOTIR-4045): `motir.co` serves `/explore` itself,
 * so this stops being built from `APP_ORIGIN` and becomes a root-relative path
 * on THIS site. `SiteHeader` / `SiteFooter` render it with a plain `<a href>`,
 * so a relative href is exactly right. (The header's nav item and the
 * WebSite JSON-LD's SearchAction read this constant.)
 */
export const EXPLORE = '/explore'

/**
 * Docs is now SAME-ORIGIN (MOTIR-4046): `motir.co` serves `/docs` itself, so
 * this stops being built from `APP_ORIGIN`. The footer link and the nav item
 * render it with a plain `<a href>` / `next/link`.
 */
export const DOCS = '/docs'

/**
 * The legal documents are now SAME-ORIGIN (MOTIR-4009): `motir.co` serves
 * `/legal`, `/legal/[slug]` itself, so these stop being built from
 * `APP_ORIGIN` and become root-relative paths on THIS site. `SiteFooter`
 * renders all three with a plain `<a href>`, so a relative href is exactly
 * right — no `next/link`, no cross-origin hand-off, no `aria-current` question.
 *
 * ⚠️ Explore and Docs above remain cross-origin until their own cards land
 * (the chrome is not yet one host for them); only the legal set has moved.
 */
export const LEGAL_PRIVACY = '/legal/privacy'
export const LEGAL_TERMS = '/legal/terms'
export const LEGAL_INDEX = '/legal'

/**
 * The site's own root — what the brand lockup in the bar and the footer links,
 * and the 404 room's second door.
 *
 * It is a CONSTANT rather than a `"/"` literal because it is a SITE link like
 * every other one below, and on a tenant host it has to be spelled absolutely
 * (MOTIR-4372). `SiteHeader` and `SiteFooter` both already said so in prose —
 * *"the ONE internal link on the page — motir.co's own root"* — while emitting a
 * href that resolves to the TENANT's root on two host kinds out of three.
 */
export const SITE_ROOT = '/'

/**
 * The design specimen (MOTIR-1043) — the site's first internal second route,
 * and until MOTIR-4372 the one nav destination spelled as a literal inside
 * `SiteHeader` rather than named here.
 */
export const DESIGN = '/design'

/**
 * EVERY same-origin path this site's shared chrome can emit.
 *
 * ⚠️ IT IS A SET SO THAT A GUARD CAN QUANTIFY OVER IT. The defect MOTIR-4372
 * records was not that one link was wrong — all seven were, identically, on
 * every host kind but one — so a test that names three of them proves nothing
 * about the fourth. `tests/host/chromeLinks.test.tsx` renders the chrome on each
 * host kind and asserts over THIS list, so a site link added later is covered by
 * the guard the moment it is added here.
 *
 * `SOURCE_REPO` and every `APP_ORIGIN` door are absent on purpose: they are
 * already absolute, on a host that is not this one.
 */
export const SITE_PATHS = [
  SITE_ROOT,
  EXPLORE,
  DOCS,
  DESIGN,
  LEGAL_INDEX,
  LEGAL_TERMS,
  LEGAL_PRIVACY,
] as const

/**
 * The account pane the Privacy Policy's §7 sends a reader to in order to
 * EXERCISE their GDPR Art. 15/17 rights — export their data and delete their
 * account (motir-core MOTIR-1136).
 *
 * ⚠️ IT IS A DOOR OUT OF THIS HOST, and that is the whole of MOTIR-4147. The
 * policy carried `/settings/account/data` as a bare path, written while the
 * document lived on `app.motir.co`; on `motir.co` that path is a 404, so the
 * one sentence in the policy that tells a reader how to exercise a right
 * pointed at nothing. It is built from `APP_ORIGIN` for the same reason every
 * door above is: a hardcoded `https://app.motir.co` works in production and
 * silently sends a preview build's readers at production data.
 *
 * The PATH is motir-core's `DATA_PRIVACY_PANE_PATH`
 * (`lib/users/dataSubjectRequests.ts`), which that repository keeps as one
 * value so the pane and the email that points at it cannot disagree. This is
 * the third reader of it and the only one on this side of the origin.
 */
export const DATA_PRIVACY_PANE = `${APP_ORIGIN}/settings/account/data`

/** The one destination that is NOT motir-core, and so not built from the origin. */
export const SOURCE_REPO = 'https://github.com/moooon-B-V/motir-core'
