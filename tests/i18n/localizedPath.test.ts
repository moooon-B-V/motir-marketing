import { describe, expect, it } from 'vitest'
import { localizedPath } from '@/i18n/localizedPath'

describe('localizedPath', () => {
  it('leaves English unprefixed — every English address stays what it was', () => {
    expect(localizedPath('en', '/')).toBe('/')
    expect(localizedPath('en', '/explore')).toBe('/explore')
  })

  it('prefixes every other locale, the root without a trailing slash', () => {
    expect(localizedPath('fr', '/explore')).toBe('/fr/explore')
    expect(localizedPath('ja', '/')).toBe('/ja')
    expect(localizedPath('de', '/docs/mcp')).toBe('/de/docs/mcp')
  })

  it('keeps a query or a fragment', () => {
    expect(localizedPath('fr', '/explore?tab=new')).toBe('/fr/explore?tab=new')
    expect(localizedPath('fr', '/?ref=a')).toBe('/fr?ref=a')
    expect(localizedPath('fr', '/#top')).toBe('/fr#top')
  })
})
