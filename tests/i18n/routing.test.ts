import { describe, expect, it, vi } from 'vitest'

/*
 * THE LOCALE ROUTING (MOTIR-7948) — the shared list, the locale layout's
 * static contract, and what the site branch of `proxy.ts` does with a path.
 *
 * The HOST half (tenant rewrites onto `/en/p/…` and their second pass) lives
 * beside the rest of the router in `tests/host/hostRouter.test.ts`; this file
 * covers what is new on the SITE host, where the router never resolves
 * anything and next-intl maps the address onto `app/[locale]`.
 */

// The site branch must not reach the contract; a call would be the defect.
const resolveHost = vi.fn()
vi.mock('@/lib/hostResolution', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/hostResolution')>()),
  resolveHost,
}))

// The document shell loads `next/font` and the global stylesheet, neither of
// which this lane can evaluate; the layout's CONTRACT is its exports.
vi.mock('@/app/_components/SiteDocument', () => ({ SiteDocument: () => null }))

const { LOCALE_BCP47, LOCALES, OG_LOCALE, routing } =
  await import('@/i18n/routing')
const { enterLocale } = await import('@/i18n/locale')
const layout = await import('@/app/[locale]/layout')
const { proxy } = await import('@/proxy')
const { NextRequest } = await import('next/server')

const request = (url: string, headers: Record<string, string> = {}) =>
  new NextRequest(url, { headers: { host: new URL(url).host, ...headers } })

const rewriteOf = (res: Response) => {
  const to = res.headers.get('x-middleware-rewrite')
  return to ? new URL(to).pathname : null
}

describe('the locale list', () => {
  it('is the twelve, English first, and English is the default', () => {
    expect(LOCALES).toEqual([
      'en',
      'zh',
      'zh-tw',
      'ja',
      'ko',
      'de',
      'fr',
      'es',
      'it',
      'nl',
      'pl',
      'pt',
    ])
    expect(routing.defaultLocale).toBe('en')
  })

  it('keeps English unprefixed and detects nothing yet', () => {
    // `as-needed` is what keeps every English URL where it is today. Detection
    // and the cookie belong to the proxy-detection and switcher cards.
    expect(routing.localePrefix).toBe('as-needed')
    expect(routing.localeDetection).toBe(false)
    expect(routing.localeCookie).toBe(false)
  })

  it('names an og:locale for every locale, language_TERRITORY', () => {
    // The pattern is derived from the code: `fr` → `fr_XX`, and a hyphenated
    // code names its own territory, `zh-tw` → `zh_TW` (MOTIR-9241).
    const ogLocalePattern = (code: string) => {
      const [language, region] = code.split('-')
      return new RegExp(
        `^${language}_${region ? region.toUpperCase() : '[A-Z]{2}'}$`,
      )
    }
    for (const locale of LOCALES) {
      expect(OG_LOCALE[locale], locale).toMatch(ogLocalePattern(locale))
    }
    const cases: [code: string, og: string, ok: boolean][] = [
      ['zh-tw', 'zh_TW', true],
      ['zh-tw', 'zh-tw_TW', false],
      ['zh-tw', 'zh_tw', false],
      ['zh-tw', 'zh_HK', false],
      ['fr', 'fr_FR', true],
    ]
    for (const [code, og, ok] of cases)
      expect(ogLocalePattern(code).test(og), `${code} → ${og}`).toBe(ok)
  })
})

describe('the BCP 47 tag of each locale (MOTIR-9249)', () => {
  it('is total over the locales, zh-TW for zh-tw and the code itself elsewhere', () => {
    expect(Object.keys(LOCALE_BCP47).sort()).toEqual([...LOCALES].sort())
    expect(LOCALE_BCP47['zh-tw']).toBe('zh-TW')
    for (const locale of LOCALES.filter((l) => l !== 'zh-tw'))
      expect(LOCALE_BCP47[locale], locale).toBe(locale)
  })
})

describe('the locale layout', () => {
  it('prerenders all twelve and no other', () => {
    expect(layout.generateStaticParams()).toEqual(
      LOCALES.map((locale) => ({ locale })),
    )
    expect(layout.dynamicParams).toBe(false)
  })

  it('gives each locale its own og:locale over the same site metadata', async () => {
    const ja = await layout.generateMetadata({
      params: Promise.resolve({ locale: 'ja' }),
    })
    expect(ja.openGraph).toMatchObject({ locale: 'ja_JP', siteName: 'Motir' })
    const en = await layout.generateMetadata({
      params: Promise.resolve({ locale: 'en' }),
    })
    expect(en.openGraph).toMatchObject({ locale: 'en_US' })
    // The share card is named, because a child `openGraph` replaces the root
    // segment's file-based image — measured missing without it. Each locale
    // names its OWN card (MOTIR-7972), English unprefixed.
    expect(en.openGraph?.images).toEqual([
      expect.objectContaining({ url: '/opengraph-image' }),
    ])
    expect(en.twitter?.images).toEqual([
      expect.objectContaining({ url: '/opengraph-image' }),
    ])
    expect(ja.openGraph?.images).toEqual([
      expect.objectContaining({ url: '/ja/opengraph-image' }),
    ])
  })

  it('answers 404 for a segment that is not a locale', async () => {
    await expect(
      layout.generateMetadata({ params: Promise.resolve({ locale: 'sv' }) }),
    ).rejects.toThrow()
  })
})

describe('enterLocale', () => {
  it('returns the page’s locale, and English for anything else', async () => {
    expect(await enterLocale(Promise.resolve({ locale: 'de' }))).toBe('de')
    expect(await enterLocale(Promise.resolve({ locale: 'xx' }))).toBe('en')
  })
})

describe('the site host, through the proxy', () => {
  it('rewrites an unprefixed page onto the English tree, URL unchanged', async () => {
    for (const [path, to] of [
      ['/', '/en'],
      ['/explore', '/en/explore'],
      ['/products/ai-planner', '/en/products/ai-planner'],
    ]) {
      const res = await proxy(request(`https://motir.co${path}`))
      expect(rewriteOf(res), path).toBe(to)
      expect(res.headers.get('location'), path).toBeNull()
    }
    expect(resolveHost).not.toHaveBeenCalled()
  })

  it('serves another locale at its own prefix', async () => {
    for (const path of ['/ja', '/de/products/ai-planner', '/zh/explore']) {
      const res = await proxy(request(`https://motir.co${path}`))
      expect(res.headers.get('location'), path).toBeNull()
      expect(rewriteOf(res) ?? path, path).toBe(path)
    }
  })

  it('serves the English tree as it is — its own rewrite comes back through the proxy', async () => {
    // The second pass of `/explore` is `/en/explore`. A redirect here sent the
    // standalone server's `/` back to `/` forever (measured), so both a
    // re-entered rewrite and a typed `/en/…` are served without one.
    for (const path of ['/en', '/en/explore', '/en/docs/mcp']) {
      const res = await proxy(request(`https://motir.co${path}`))
      expect(res.headers.get('location'), path).toBeNull()
      expect(rewriteOf(res), path).toBeNull()
      expect(res.headers.get('x-middleware-next'), path).toBe('1')
    }
  })

  it('answers a locale segment spelled in another case with a 308 to the URL code (MOTIR-9249)', async () => {
    for (const [path, to] of [
      ['/zh-TW/docs/mcp?x=1', '/zh-tw/docs/mcp?x=1'],
      ['/zh-TW', '/zh-tw'],
      ['/ZH-TW/explore', '/zh-tw/explore'],
      ['/zh-TW/opengraph-image', '/zh-tw/opengraph-image'],
      ['/JA/design', '/ja/design'],
    ]) {
      const res = await proxy(request(`https://motir.co${path}`))
      expect(res.status, path).toBe(308)
      const location = new URL(res.headers.get('location')!)
      expect(`${location.pathname}${location.search}`, path).toBe(to)
      expect(res.headers.get('vary'), path).toBeNull()
    }
  })

  it('serves /zh-tw as it is, and leaves a near-miss segment alone', async () => {
    const served = await proxy(request('https://motir.co/zh-tw/explore'))
    expect(served.headers.get('location')).toBeNull()
    expect(rewriteOf(served) ?? '/zh-tw/explore').toBe('/zh-tw/explore')
    const nearMiss = await proxy(request('https://motir.co/zh-TWx'))
    expect(nearMiss.status).not.toBe(308)
    expect(rewriteOf(nearMiss)).toBe('/en/zh-TWx')
  })

  it('still routes a path that merely starts with the letters en', async () => {
    const res = await proxy(request('https://motir.co/enterprise'))
    expect(rewriteOf(res)).toBe('/en/enterprise')
  })

  it('leaves files and root metadata routes OUTSIDE the locale tree', async () => {
    // Under `/en/…` each of these would 404 — the logo and the crawl files.
    for (const path of [
      '/motir-mark.svg',
      '/robots.txt',
      '/sitemap.xml',
      '/favicon.ico',
      '/icon.svg',
      '/icon',
      '/icon-1br99b',
    ]) {
      const res = await proxy(request(`https://motir.co${path}`))
      expect(rewriteOf(res), path).toBeNull()
      expect(res.headers.get('x-middleware-next'), path).toBe('1')
    }
  })

  it('serves the share card from inside the locale tree, never redirecting it (MOTIR-7972)', async () => {
    // The card lives at `app/[locale]/opengraph-image.tsx`: English's
    // unprefixed address is REWRITTEN onto `/en/…`, and a prefixed one is
    // served as it is — never through next-intl, never detected.
    for (const path of ['/opengraph-image', '/opengraph-image-1br99b']) {
      const res = await proxy(
        request(`https://motir.co${path}`, { 'accept-language': 'ja' }),
      )
      expect(res.headers.get('location'), path).toBeNull()
      expect(rewriteOf(res), path).toBe(`/en${path}`)
    }
    for (const path of ['/ja/opengraph-image', '/en/opengraph-image']) {
      const res = await proxy(
        request(`https://motir.co${path}`, { 'accept-language': 'de' }),
      )
      expect(res.headers.get('location'), path).toBeNull()
      expect(rewriteOf(res), path).toBeNull()
      expect(res.headers.get('x-middleware-next'), path).toBe('1')
    }
  })
})
