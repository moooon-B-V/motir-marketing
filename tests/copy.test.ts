import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { copy, format } from '@/lib/copy'

/*
 * ⚠️ THE TERMINOLOGY CHECK, MECHANISED. Yue's 2026-08-28 note on MOTIR-1152
 * gives it as a command to run rather than a habit to keep:
 *
 *     grep -niE 'tracker|\bissues?\b' <your changed files>
 *
 * A habit is exactly what fails on the seventh copy edit six months from now,
 * and the words are BANNED rather than discouraged: the two customer-facing
 * product names are "Motir" and "Motir AI", and the unit of work is a "work
 * item". "tracker" survives ONLY as a code identifier — the `?intent=tracker`
 * query value, `scaled-tracker`, the Stripe price keys — and is never
 * rendered. The catalogue is the one file where a rendered violation can
 * enter, so the check lives on the catalogue rather than on a diff.
 */
const BANNED = /\btrackers?\b|\bissues?\b/i

function leafStrings(value: unknown, path: string[] = []): [string, string][] {
  if (typeof value === 'string') return [[path.join('.'), value]]
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => leafStrings(item, [...path, String(i)]))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      leafStrings(child, [...path, key]),
    )
  }
  return []
}

describe('the copy catalogue', () => {
  it('renders neither "tracker" nor "issue" anywhere', () => {
    const offenders = leafStrings(copy)
      .filter(([, text]) => BANNED.test(text))
      .map(([key, text]) => `${key}: ${text}`)
    expect(offenders).toEqual([])
  })

  it('keeps the tagline whole — all THREE pillars', () => {
    // Dropping agent orchestration describes a different, smaller product.
    const whole = 'AI planning, project-management and agent orchestration'
    expect(copy.footer.tagline).toContain(whole)
    expect(copy.meta.description).toContain(whole)
  })

  it('names every product exactly, in menu order', () => {
    expect(
      Object.values(copy.nav.productItems).map((item) => item.name),
    ).toEqual([
      'Motir AI Planner',
      'Motir Project Management',
      'Motir Project Manager',
      'Motir AI Debugging',
      'Motir MCP',
      'Motir CLI',
      'Motir Claude Code connector',
      'Motir Claude Code plugin',
      'Motir Agent Fleet',
      'Motir Agent Hosting',
      'Motir Sandbox',
    ])
  })

  it('never says "coding agent" — agents do all kinds of work', () => {
    const offenders = leafStrings(copy).filter(([, text]) =>
      /coding agents?/i.test(text),
    )
    expect(offenders).toEqual([])
  })

  it('keeps developer jargon OUT of the idea path and door 3', () => {
    // The import door's audience self-selects as having a codebase; a
    // non-technical founder must not meet "repository" on the way in.
    const jargon = /\brepo(sitory|s)?\b|\bgit\b|\bcodebase\b|\bAPI\b/i
    const ideaPath = [
      ...leafStrings(copy.landing.hero),
      ...leafStrings(copy.landing.close.free),
      ...leafStrings(copy.landing.moreThanCode),
      ...leafStrings(copy.landing.calls),
      ...leafStrings(copy.landing.resume),
    ]
    expect(
      ideaPath.filter(([, text]) => jargon.test(text)).map(([key]) => key),
    ).toEqual([])
  })

  it('stays in key SHAPE with what the landing renders', () => {
    expect(Object.keys(copy.landing).sort()).toEqual([
      'art',
      'builtByMotir',
      'calls',
      'close',
      'hero',
      'moreThanCode',
      'projectManager',
      'resume',
    ])
    expect(Object.keys(copy.landing.close.free).sort()).toEqual([
      'cta',
      'lead',
      'tail',
    ])
  })

  it('never names a third-party agent product in the landing copy', () => {
    const named = /claude|cursor|codex|copilot|devin|opencode/i
    expect(
      leafStrings(copy.landing)
        .filter(([, text]) => named.test(text))
        .map(([key]) => key),
    ).toEqual([])
  })

  it('carries the /design showcase, in the shape the pickers read', () => {
    // MOTIR-3862. The axis keys are `name` + `help` because that is what
    // `AxisField` takes; `AxisNote` renders the ACTIVE selection from the
    // registry and is never authored here. A rename is a code change in
    // MOTIR-1043, so it surfaces here first.
    expect(Object.keys(copy.designShowcase).sort()).toEqual([
      'closing',
      'heading',
      'palette',
      'reset',
      'style',
      'subline',
      'theme',
      'type',
    ])
    for (const axis of ['style', 'palette', 'type'] as const) {
      expect(Object.keys(copy.designShowcase[axis]).sort()).toEqual([
        'help',
        'name',
      ])
    }
    expect(Object.keys(copy.designShowcase.theme).sort()).toEqual([
      'dark',
      'help',
      'light',
      'name',
      'system',
    ])
    // The nav entry the showcase adds, beside Explore and Docs.
    expect(copy.nav.design).toBe('Design')
  })

  it('never claims an agent applies your design choice to what it builds', () => {
    /*
     * ⚠️ NOT a style rule — a factual one, and it is asserted because it is the
     * kind of sentence a later editor restores in good faith.
     *
     * MOTIR-3862 asked the closing line to say "the agent applies the choice to
     * what it builds". It does not ship. The onboarding design step persists the
     * three axes onto the pre-plan baseline (`PreplanSession.designChoice`) and
     * the generation handoff summarises them, but the value is rendered into NO
     * planner prompt and no dispatch prompt — verified on `origin/main` in both
     * motir-core and motir-ai. Restoring the claim puts a false statement on a
     * public page. Delete this test when a prompt reads the value, not before.
     */
    const builds =
      /\bagents?\b[^.]*\b(build|builds|building|apply|applies)\b|\b(applied|applies)\b[^.]*\bwhat (it|they) builds?\b/i
    const offenders = leafStrings(copy.designShowcase)
      .filter(([, text]) => builds.test(text))
      .map(([key, text]) => `${key}: ${text}`)
    expect(offenders).toEqual([])
  })

  it('is the file on disk, not a stale build artifact', () => {
    const onDisk = JSON.parse(readFileSync('messages/en.json', 'utf8'))
    expect(onDisk).toEqual(copy)
  })
})

describe('format', () => {
  it('fills every named placeholder', () => {
    expect(format('{count} / {max}', { count: 12, max: 2000 })).toBe(
      '12 / 2000',
    )
    expect(format(copy.footer.copyright, { year: 2026 })).toBe(
      '© 2026 moooon B.V.',
    )
  })

  it('leaves an unknown placeholder alone rather than printing "undefined"', () => {
    expect(format('a {b} c', {})).toBe('a {b} c')
  })
})
