import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SITE_ORIGIN,
  MotirSiteOriginError,
  parseSiteOrigin,
  SITE_ORIGIN_ENV_VAR,
  siteUrl,
} from '@/lib/siteOrigin'

/*
 * MOTIR-1154. `lib/siteOrigin.ts` is what every absolute URL in the entity
 * signal is built from, so the two behaviours worth pinning are opposite ones:
 * an UNSET variable takes the production default (that is the normal case and
 * must not throw), while a SET-BUT-WRONG one throws by name rather than
 * silently pointing the deployment's canonicals somewhere nobody chose.
 *
 * ⚠️ ASSERTS THE PARSER, WHICH IS WHAT THE MODULE'S TOP-LEVEL BINDING CALLS —
 * the same shape as `tests/appOrigin.test.ts`, and for the same reason: the
 * call is at MODULE SCOPE, so an import under a bad value throws before any
 * component renders.
 */
describe('parseSiteOrigin', () => {
  it('falls back to the production origin when nothing is set', () => {
    expect(parseSiteOrigin(undefined)).toBe(DEFAULT_SITE_ORIGIN)
    for (const blank of ['', '   ', '\n']) {
      expect(parseSiteOrigin(blank)).toBe(DEFAULT_SITE_ORIGIN)
    }
  })

  it('defaults to motir.co — the apex the entity signal is about', () => {
    expect(DEFAULT_SITE_ORIGIN).toBe('https://motir.co')
  })

  it('names the variable in every message, so the failure is actionable', () => {
    for (const value of ['not a url', 'ftp://motir.co', 'https://motir.co/x']) {
      expect(() => parseSiteOrigin(value)).toThrowError(
        new RegExp(SITE_ORIGIN_ENV_VAR),
      )
      expect(() => parseSiteOrigin(value)).toThrowError(MotirSiteOriginError)
    }
  })

  it('rejects a value that is not a URL', () => {
    expect(() => parseSiteOrigin('motir.co')).toThrowError(/not a valid URL/)
  })

  it('rejects a non-http(s) scheme', () => {
    expect(() => parseSiteOrigin('ftp://motir.co')).toThrowError(
      /must be http or https/,
    )
  })

  it('rejects an origin carrying a path, query or fragment', () => {
    // Each of these would compose into a malformed canonical or sitemap URL.
    for (const value of [
      'https://motir.co/x',
      'https://motir.co/?a=1',
      'https://motir.co/#top',
    ]) {
      expect(() => parseSiteOrigin(value)).toThrowError(/bare origin/)
    }
  })

  it('accepts a bare origin and strips a trailing slash', () => {
    expect(parseSiteOrigin('https://preview.motir.co')).toBe(
      'https://preview.motir.co',
    )
    expect(parseSiteOrigin('https://preview.motir.co/')).toBe(
      'https://preview.motir.co',
    )
    expect(parseSiteOrigin('  https://preview.motir.co/  ')).toBe(
      'https://preview.motir.co',
    )
  })

  it('accepts http for local development', () => {
    expect(parseSiteOrigin('http://localhost:3000')).toBe(
      'http://localhost:3000',
    )
  })
})

describe('siteUrl', () => {
  it('builds an ABSOLUTE url — a relative one is the whole failure mode', () => {
    expect(siteUrl('/')).toBe('https://motir.co/')
    expect(siteUrl('/sitemap.xml')).toBe('https://motir.co/sitemap.xml')
    expect(siteUrl('/motir-mark.svg')).toBe('https://motir.co/motir-mark.svg')
  })

  it('defaults to the site root', () => {
    expect(siteUrl()).toBe('https://motir.co/')
  })
})
