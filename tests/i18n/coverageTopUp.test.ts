// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LOCALES } from '@/i18n/routing'

/*
 * MOTIR-7967, case 6 — the branches the story's other tests never reach, so
 * the 90/90/90 floor over its non-route modules measures behaviour rather than
 * an import. Each block names the module it tops up.
 */

afterEach(() => {
  vi.doUnmock('react')
  vi.doUnmock('next-intl')
  vi.doUnmock('next-intl/server')
  vi.doUnmock('next/font/google')
  vi.doUnmock('next/navigation')
  vi.doUnmock('@/i18n/claim')
  vi.restoreAllMocks()
  vi.resetModules()
})

describe('app/fonts.ts', () => {
  it('joins every loader’s variable class, the six pairings and the nine CJK faces', async () => {
    // next/font is a compiler transform; outside Next each loader is a plain
    // call, so it is stubbed to echo the variable it was given.
    vi.doMock('next/font/google', () => {
      const loader = (options: { variable: string }) => ({
        variable: options.variable,
      })
      return Object.fromEntries(
        [
          'Fraunces',
          'IBM_Plex_Mono',
          'Inter',
          'JetBrains_Mono',
          'LXGW_WenKai_TC',
          'M_PLUS_Rounded_1c',
          'Nanum_Gothic',
          'Noto_Sans_JP',
          'Noto_Sans_KR',
          'Noto_Sans_SC',
          'Noto_Serif_JP',
          'Noto_Serif_KR',
          'Noto_Serif_SC',
          'Source_Serif_4',
          'Space_Grotesk',
        ].map((name) => [name, loader]),
      )
    })
    const { fontVariables } = await import('@/app/fonts')
    const names = fontVariables.split(' ')
    expect(names).toHaveLength(15)
    expect(names).toContain('--font-sans-source')
    expect(names).toContain('--font-set-ko-serif-noto-serif-kr')
  })
})

describe('i18n/request.ts', () => {
  it('serves a known locale its catalogue, and an unknown one English', async () => {
    // The react-server build's `getRequestConfig` hands back the callback; the
    // test lane loads the client build, which refuses, so it is stood in for.
    vi.doMock('next-intl/server', () => ({
      getRequestConfig: (callback: unknown) => callback,
    }))
    const { default: requestConfig } = await import('@/i18n/request')
    const { getCopy } = await import('@/lib/copy')
    const config = requestConfig as unknown as (params: {
      requestLocale: Promise<string | undefined>
    }) => Promise<{ locale: string; messages: unknown }>

    const ja = await config({ requestLocale: Promise.resolve('ja') })
    expect(ja.locale).toBe('ja')
    expect(ja.messages).toBe(await getCopy('ja'))

    const unknown = await config({ requestLocale: Promise.resolve('xx') })
    expect(unknown.locale).toBe('en')
  })
})

describe('i18n/navigation.ts', () => {
  it('builds next-intl’s navigation over the eleven', async () => {
    const navigation = await import('@/i18n/navigation')
    expect(navigation.getPathname({ href: '/explore', locale: 'ja' })).toBe(
      '/ja/explore',
    )
    expect(navigation.getPathname({ href: '/explore', locale: 'en' })).toBe(
      '/explore',
    )
  })
})

describe('i18n/locale.ts', () => {
  it('the global 404 leaves a claimed locale alone, and writes English otherwise', async () => {
    const setRequestLocale = vi.fn()
    let claimed: string | undefined = 'fr'
    vi.doMock('next-intl/server', () => ({ setRequestLocale }))
    vi.doMock('@/i18n/claim', () => ({
      claimedLocale: () => claimed,
      setClaimedLocale: vi.fn(),
    }))
    const { defaultLocaleUnlessClaimed } = await import('@/i18n/locale')

    defaultLocaleUnlessClaimed()
    expect(setRequestLocale).not.toHaveBeenCalled()

    claimed = undefined
    defaultLocaleUnlessClaimed()
    expect(setRequestLocale).toHaveBeenCalledWith('en')
  })
})

describe('i18n/sitePathname.ts', () => {
  it('an empty address has no locale to strip', async () => {
    const { stripLocale } = await import('@/i18n/sitePathname')
    expect(stripLocale('')).toBe('')
  })

  it('a missing pathname reads as the root', async () => {
    vi.doMock('next/navigation', () => ({ usePathname: () => null }))
    const { useSitePathname } = await import('@/i18n/sitePathname')
    expect(useSitePathname()).toBe('/')
  })
})

describe('app/_components/products.ts', () => {
  it('an unknown slug is a programming error, said by name', async () => {
    const { productOf } = await import('@/app/_components/products')
    const { englishCopy } = await import('@/lib/copy')
    expect(() => productOf('no-such-product' as never, englishCopy)).toThrow(
      'Unknown product: no-such-product',
    )
  })
})

describe('lib/copy.ts — the server half', () => {
  /** `lib/copy` as the server-components build loads it: React with no `useState`. */
  async function serverCopy(claimed: string | undefined) {
    const use = vi.fn(() => 'unwrapped')
    vi.doMock('react', async (importOriginal) => {
      const react: Partial<typeof import('react')> = {
        ...(await importOriginal<typeof import('react')>()),
      }
      delete react.useState
      return { ...react, use, default: { ...react, use } }
    })
    vi.doMock('@/i18n/claim', () => ({
      claimedLocale: () => claimed,
      setClaimedLocale: vi.fn(),
    }))
    return { copy: await import('@/lib/copy'), use }
  }

  it('reads English, unwrapped, when no locale tree has claimed', async () => {
    const { copy, use } = await serverCopy(undefined)
    expect(copy.usePageLocale()).toBe('en')
    expect(copy.useCopy()).toBe(copy.englishCopy)
    expect(use).not.toHaveBeenCalled()
  })

  it('reads the claimed locale’s catalogue through `use`', async () => {
    const { copy, use } = await serverCopy('ja')
    expect(copy.usePageLocale()).toBe('ja')
    expect(copy.useCopy()).toBe('unwrapped')
    expect(use).toHaveBeenCalledWith(copy.getCopy('ja'))
  })
})

describe('lib/copy.ts — the client half', () => {
  it.each([
    ['ja', 'ja'],
    ['xx', 'en'],
  ])('a provider saying %s reads as %s', async (said, read) => {
    vi.doMock('next-intl', async (importOriginal) => ({
      ...(await importOriginal<typeof import('next-intl')>()),
      useLocale: () => said,
    }))
    const { usePageLocale } = await import('@/lib/copy')
    expect(usePageLocale()).toBe(read)
  })
})

describe('scripts/i18n/check-prerender.ts — the command', () => {
  /** A `.next` and a base list under a fresh root, as `next build` leaves them. */
  function fixture(prerendered: string[]) {
    const root = mkdtempSync(path.join(tmpdir(), 'check-prerender-'))
    mkdirSync(path.join(root, '.next'))
    mkdirSync(path.join(root, 'scripts', 'i18n'), { recursive: true })
    writeFileSync(
      path.join(root, '.next', 'app-path-routes-manifest.json'),
      JSON.stringify({ '/[locale]/design/page': '/[locale]/design' }),
    )
    writeFileSync(
      path.join(root, '.next', 'prerender-manifest.json'),
      JSON.stringify({
        routes: Object.fromEntries(
          prerendered.map((p) => [p, { srcRoute: '/[locale]/design' }]),
        ),
      }),
    )
    return root
  }
  const base = (root: string) =>
    writeFileSync(
      path.join(root, 'scripts', 'i18n', 'static-routes.base.json'),
      JSON.stringify({ sha: 'abc', producedBy: 'test', routes: ['/design'] }),
    )

  it('passes a whole build, and fails one missing a locale, naming it', async () => {
    const { main } = await import('@/scripts/i18n/check-prerender')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const whole = fixture(LOCALES.map((l) => `/${l}/design`))
    base(whole)
    expect(await main([], whole)).toBe(0)
    expect(log).toHaveBeenLastCalledWith(expect.stringMatching(/: whole$/))

    const holed = fixture(
      LOCALES.filter((l) => l !== 'ko').map((l) => `/${l}/design`),
    )
    base(holed)
    expect(await main([], holed)).toBe(1)
    expect(error).toHaveBeenCalledWith(
      'MISSING /[locale]/design: not prerendered for ko',
    )
  })

  it('--write-base records the build’s static page routes, and needs a sha', async () => {
    const { main } = await import('@/scripts/i18n/check-prerender')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const root = fixture(['/design'])
    await expect(main(['--write-base'], root)).rejects.toThrow(/--write-base/)
    expect(await main(['--write-base', 'abc123'], root)).toBe(0)
    const { readFileSync } = await import('node:fs')
    const written = JSON.parse(
      readFileSync(
        path.join(root, 'scripts', 'i18n', 'static-routes.base.json'),
        'utf8',
      ),
    )
    expect(written).toMatchObject({
      sha: 'abc123',
      routes: ['/[locale]/design'],
    })
  })
})
