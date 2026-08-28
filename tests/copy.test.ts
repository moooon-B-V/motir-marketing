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
    expect(copy.landing.hero.lede).toContain(whole)
    expect(copy.footer.tagline).toContain(whole)
    expect(copy.meta.description).toContain(whole)
  })

  it('names the three pillars exactly', () => {
    expect(copy.landing.pillars.planning.title).toBe('AI planning')
    expect(copy.landing.pillars.projectManagement.title).toBe(
      'Project management',
    )
    expect(copy.landing.pillars.agents.title).toBe('Agent orchestration')
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
      ...leafStrings(copy.landing.doors.free),
      ...leafStrings(copy.landing.doors.new),
    ]
    expect(
      ideaPath.filter(([, text]) => jargon.test(text)).map(([key]) => key),
    ).toEqual([])
  })

  it('has no OR divider string left over — the doors are CO-EQUAL', () => {
    // Yue, 2026-08-28: doors 1 and 2 are co-equal and the divider is GONE. A
    // stranded `or` key is how a later edit puts it back.
    expect('or' in copy.landing.doors).toBe(false)
  })

  it('stays byte-identical in key SHAPE to what the page renders', () => {
    // A guard on the README's own rule: keys are stable, values are not. Any
    // key this page reads must exist; a rename is a code change and this is
    // where it surfaces.
    expect(Object.keys(copy.landing.doors).sort()).toEqual([
      'free',
      'hint',
      'import',
      'new',
    ])
    expect(Object.keys(copy.landing.doors.free).sort()).toEqual([
      'cta',
      'lead',
      'tail',
    ])
  })

  it('is the file on disk, not a stale build artifact', () => {
    const onDisk = JSON.parse(readFileSync('messages/en.json', 'utf8'))
    expect(onDisk).toEqual(copy)
  })
})

describe('format', () => {
  it('fills every named placeholder', () => {
    expect(format(copy.landing.hero.counter, { count: 12, max: 2000 })).toBe(
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
