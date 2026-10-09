import { describe, expect, it } from 'vitest'
import { stripLocale } from '@/i18n/sitePathname'

describe('stripLocale', () => {
  it('reads the rewritten and the typed address the same', () => {
    expect(stripLocale('/en/docs/mcp')).toBe('/docs/mcp')
    expect(stripLocale('/docs/mcp')).toBe('/docs/mcp')
    expect(stripLocale('/ja/docs/mcp/tools')).toBe('/docs/mcp/tools')
  })

  it('maps a locale root to the site root', () => {
    expect(stripLocale('/en')).toBe('/')
    expect(stripLocale('/de')).toBe('/')
    expect(stripLocale('/')).toBe('/')
  })

  it('leaves a segment that is not one of the eleven alone', () => {
    expect(stripLocale('/enterprise')).toBe('/enterprise')
    expect(stripLocale('/sv/docs')).toBe('/sv/docs')
    expect(stripLocale('/explore/en')).toBe('/explore/en')
  })
})
