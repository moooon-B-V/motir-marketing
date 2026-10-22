import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

/*
 * `<html lang>` CARRIES THE BCP 47 TAG, NOT THE URL CODE (MOTIR-9249). `zh-tw`
 * is the first locale whose two spellings differ, so the page a Taiwan reader
 * opens must announce `zh-TW` to the browser, the screen reader and the font
 * matcher, while `/zh` keeps `zh`.
 */

// `next/font` and the global stylesheet are compiler transforms this lane
// cannot evaluate; the document's `lang` is all that is asserted here.
vi.mock('@/app/fonts', () => ({ fontVariables: '' }))
vi.mock('@/app/globals.css', () => ({}))

const { SiteDocument } = await import('@/app/_components/SiteDocument')

const htmlLang = (lang: 'zh' | 'zh-tw') =>
  /<html[^>]* lang="([^"]+)"/.exec(
    renderToStaticMarkup(
      <SiteDocument lang={lang} description="D">
        <main />
      </SiteDocument>,
    ),
  )?.[1]

describe('the document’s language', () => {
  it('is zh-TW for /zh-tw and zh for /zh', () => {
    expect(htmlLang('zh-tw')).toBe('zh-TW')
    expect(htmlLang('zh')).toBe('zh')
  })
})
