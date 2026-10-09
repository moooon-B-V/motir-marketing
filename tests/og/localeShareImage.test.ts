// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { englishCopy, getCopy } from '@/lib/copy'

/*
 * MOTIR-7972 — the landing's share image, one per locale.
 *
 * Runs in `node` for the reason `tests/ogFonts.test.ts` gives: `next/og`
 * renders through satori in a Node runtime. It calls the route's real default
 * export with the `params` promise Next 16 hands it, and spies on `fetch`: a
 * card that reached the network for a fallback font would be drawn in a face
 * this site never chose, and would make the build depend on a network.
 */

const PNG_MAGIC = '89504e470d0a1a0a'

async function render(locale: string): Promise<Buffer> {
  const { default: route } = await import('@/app/[locale]/opengraph-image')
  const response = await route({ params: Promise.resolve({ locale }) })
  return Buffer.from(await response.arrayBuffer())
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('@/lib/copy')
  vi.resetModules()
})

describe.each(['en', 'pl', 'ja'])('the %s card', (locale) => {
  it('is a 1200 × 630 PNG drawn without a single fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const png = await render(locale)
    expect(png.subarray(0, 8).toString('hex')).toBe(PNG_MAGIC)
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
    // satori's layout engine arrives as a `data:` URL the first time the
    // module loads — bytes already in the bundle, not a request.
    const network = fetchSpy.mock.calls
      .map(([input]) => String(input instanceof Request ? input.url : input))
      .filter((url) => !url.startsWith('data:'))
    expect(network).toEqual([])
  }, 30_000)

  it('is advertised with that catalogue’s meta title as its alt', async () => {
    const { siteCard } = await import('@/lib/localeMetadata')
    expect(
      siteCard(locale as 'en', (await getCopy(locale as 'en')).meta.title),
    ).toEqual({
      url: locale === 'en' ? '/opengraph-image' : `/${locale}/opengraph-image`,
      width: 1200,
      height: 630,
      type: 'image/png',
      alt: (await getCopy(locale as 'en')).meta.title,
    })
  })
})

describe('the route', () => {
  it('names all eleven locales, so each card is built ahead of time', async () => {
    const { generateStaticParams } =
      await import('@/app/[locale]/opengraph-image')
    const { LOCALES } = await import('@/i18n/routing')
    expect(generateStaticParams()).toEqual(
      LOCALES.map((locale) => ({ locale })),
    )
  })
})

describe('English is unchanged', () => {
  it('renders the same bytes as a card drawn straight from englishCopy', async () => {
    const fromCatalogue = await render('en')
    vi.resetModules()
    vi.doMock('@/lib/copy', async (importOriginal) => ({
      ...(await importOriginal<typeof import('@/lib/copy')>()),
      getCopy: async () => englishCopy,
    }))
    expect((await render('en')).equals(fromCatalogue)).toBe(true)
  }, 30_000)

  it('the Polish and Japanese cards differ from it', async () => {
    const en = await render('en')
    expect((await render('pl')).equals(en)).toBe(false)
    expect((await render('ja')).equals(en)).toBe(false)
  }, 60_000)
})
