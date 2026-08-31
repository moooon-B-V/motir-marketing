import { describe, expect, it } from 'vitest'
import {
  FREE_DOOR,
  IDEA_DRAFT_ENDPOINT,
  IMPORT_DOOR,
  LEGAL_INDEX,
  LEGAL_PRIVACY,
  LEGAL_TERMS,
  SIGN_IN,
  SIGN_UP,
  SOURCE_REPO,
  signInWithDraft,
} from '@/lib/destinations'

/*
 * MOTIR-1152, acceptance criteria 2, 3, 4 — the routing contract
 * `design/marketing/design-notes.md` § *The three doors* records.
 *
 * The test environment sets the origin to `https://app.test.motir.co`, NOT the
 * production value, which is the point: a door asserted against
 * `https://app.motir.co` would pass just as well if it were hardcoded. Every
 * expectation below reads the non-production origin, so a literal anywhere in
 * `lib/destinations.ts` fails here.
 */
const ORIGIN = 'https://app.test.motir.co'

describe('the three doors are built from the ONE configured origin', () => {
  it('door 1 — the idea travels as a DRAFT ID, never as a query parameter', () => {
    expect(IDEA_DRAFT_ENDPOINT).toBe(`${ORIGIN}/api/idea-draft`)
    expect(signInWithDraft('abc123')).toBe(`${ORIGIN}/sign-in?draft=abc123`)
  })

  it('door 1 — the draft id is URL-encoded, so an opaque id can never break the URL', () => {
    expect(signInWithDraft('a b&c=d')).toBe(
      `${ORIGIN}/sign-in?draft=a%20b%26c%3Dd`,
    )
  })

  it('door 2 — the import CTA carries `?intent=import` on /sign-in', () => {
    expect(IMPORT_DOOR).toBe(`${ORIGIN}/sign-in?intent=import`)
  })

  it('door 3 — "Start free" carries `?intent=tracker` on /sign-UP', () => {
    // ⚠️ sign-UP, not sign-in, and `intent=tracker`, not `next=`. This is the
    // route and parameter MOTIR-1143's routing table pins and MOTIR-3639's
    // body names as the door it receives. MOTIR-1118 is the record that
    // ultimately PICKS the carrier and is `todo`; if it later picks
    // mechanism A (`?next=/home?intent=tracker`), THIS assertion is what says
    // the change was deliberate rather than a drift.
    expect(FREE_DOOR).toBe(`${ORIGIN}/sign-up?intent=tracker`)
  })

  it('the error state and the empty-idea path both stay on the configured origin', () => {
    expect(SIGN_UP).toBe(`${ORIGIN}/sign-up`)
    expect(SIGN_IN).toBe(`${ORIGIN}/sign-in`)
  })

  it('the ONE destination that is not motir-core is not built from the origin', () => {
    expect(SOURCE_REPO).toBe('https://github.com/moooon-B-V/motir-core')
    expect(SOURCE_REPO.startsWith(ORIGIN)).toBe(false)
  })

  it('the legal documents are same-origin, not built from the app origin', () => {
    // MOTIR-4009 — the legal set moved onto motir.co, so these stopped being
    // `${APP_ORIGIN}/legal/*` and became root-relative paths on THIS site. A
    // relative href is what `SiteFooter` renders them through.
    expect(LEGAL_PRIVACY).toBe('/legal/privacy')
    expect(LEGAL_TERMS).toBe('/legal/terms')
    expect(LEGAL_INDEX).toBe('/legal')
    expect(LEGAL_PRIVACY.startsWith(ORIGIN)).toBe(false)
    expect(LEGAL_INDEX.startsWith(ORIGIN)).toBe(false)
  })
})
