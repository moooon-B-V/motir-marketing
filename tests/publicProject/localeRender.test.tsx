import { readFileSync } from 'node:fs'
import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { englishCopy, resolveCopy } from '@/lib/copy'
import { render } from '@/tests/helpers/withCopy'

/*
 * A PUBLIC PROJECT PAGE IN ANOTHER LOCALE (MOTIR-7954).
 *
 * `noHardcodedCopy.test.tsx` proves every word comes from the catalogue. This
 * file proves the two things that proof cannot: that the numbers and dates are
 * drawn in the PAGE's locale rather than in English, and that a catalogue
 * missing a key shows English for it — never the key.
 *
 * `de` has no catalogue file, so its page is English words around German
 * numbers and dates — exactly what a visitor sees until a translation lands.
 * `fr` is a TEST catalogue that translates the changelog's empty state and
 * leaves out the Overview tab's label.
 */

const FRENCH = {
  publicProject: {
    changelog: { empty: { title: 'Rien n’a encore été livré' } },
  },
}

vi.mock('@/lib/copy', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/copy')>()
  return {
    ...actual,
    getCopy: async (locale: string) =>
      locale === 'fr' ? actual.resolveCopy(FRENCH) : actual.englishCopy,
  }
})
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

const APP = 'https://app.test.motir.co'
const fixture = (name: string) =>
  JSON.parse(readFileSync(`e2e/fixtures/${name}`, 'utf8'))

function stubContract(changelog: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request) => {
      const path = String(input instanceof Request ? input.url : input).replace(
        `${APP}/api/public`,
        '',
      )
      if (path === '/p/ACME') {
        return Response.json({
          ...fixture('project.json'),
          identifier: 'ACME',
          stats: { ...fixture('project.json').stats, upvotes: 1234 },
          addresses: { primary: 'https://motir.co/p/ACME', alternates: [] },
        })
      }
      if (path.startsWith('/p/ACME/changelog')) return Response.json(changelog)
      return new Response('unexpected read', { status: 404 })
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

const ChangelogPage = (
  await import('@/app/[locale]/p/[identifier]/changelog/page')
).default

const changelogIn = (locale: string) =>
  ChangelogPage({
    params: Promise.resolve({ locale, identifier: 'ACME' }),
    searchParams: Promise.resolve({}),
  })

describe('/de/p/ACME/changelog', () => {
  it('draws its dates and counts in German', async () => {
    stubContract(fixture('changelog.json'))
    render(await changelogIn('de'), { locale: 'de' })

    // The first entry shipped on 2 September 2026.
    expect(screen.getAllByText('2. Sept. 2026').length).toBeGreaterThan(0)
    expect(screen.queryByText('2 Sept 2026')).toBeNull()
    // The upvote stat, with German grouping.
    expect(screen.getByText('1.234')).toBeInTheDocument()
    expect(screen.queryByText('1,234')).toBeNull()
  })
})

describe('/fr/p/ACME/changelog', () => {
  it('reads the French catalogue, with English where it has no key', async () => {
    stubContract({ entries: [], nextCursor: null })
    const { container } = render(await changelogIn('fr'), {
      locale: 'fr',
      messages: resolveCopy(FRENCH),
    })

    expect(screen.getByText('Rien n’a encore été livré')).toBeInTheDocument()
    // The tab the catalogue left out is English, not `tabs.overview`.
    const tabs = screen.getByRole('navigation', {
      name: englishCopy.publicProject.header.navAria,
    })
    expect(
      within(tabs).getByRole('link', {
        name: englishCopy.publicProject.tabs.overview,
      }),
    ).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/tabs\.overview|publicProject\./)
  })
})
