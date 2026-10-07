import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { copy } from '@/lib/copy'
import {
  ideasHref,
  parseIdeasParams,
  type PublicIdeaDto,
  type PublicIdeaListDto,
  type PublicIdeaTagDto,
} from '@/lib/ideas'
import IdeasPage, { generateMetadata } from '@/app/ideas/page'
import ideasFixture from '../../e2e/fixtures/ideas.json'
import tagsFixture from '../../e2e/fixtures/ideas-tags.json'
import ideaFixture from '../../e2e/fixtures/idea-stop-returns-before-they-happen.json'

/*
 * The story's integration gate (MOTIR-7689, Story MOTIR-7665): /ideas as one
 * piece — URL → query → server render → URL — against the public contract as
 * recorded in `e2e/fixtures/`. The page's server component is awaited and its
 * output rendered; the only thing stood in for is `fetch`, which answers from
 * the recordings and NARROWS them the way motir-core's
 * `ideasPublicService.list` does (category exact, every tag required, text
 * over title / pitch / gap / tag label, kind exact; category counts over every
 * filter except the category). That narrowing is written here independently
 * of the page, so it is the oracle the render is checked against.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/ideas',
}))

const API = 'https://app.test.motir.co/api/public/ideas'
const LIST = ideasFixture as PublicIdeaListDto
const TAGS = (tagsFixture as { tags: PublicIdeaTagDto[] }).tags
const ONE = ideaFixture as PublicIdeaDto

function narrow(search: URLSearchParams): PublicIdeaListDto {
  const category = search.get('category')
  const tags = search.getAll('tag')
  const q = search.get('q')?.toLowerCase()
  const kind = search.get('kind')
  const matches = (idea: PublicIdeaDto, withCategory: boolean) =>
    (!withCategory || !category || idea.category.slug === category) &&
    tags.every((t) => idea.tags.some((x) => x.slug === t)) &&
    (!kind || idea.kind === kind) &&
    (!q ||
      [idea.title, idea.pitch, idea.gap ?? '', ...idea.tags.map((t) => t.label)]
        .join('\n')
        .toLowerCase()
        .includes(q))
  const items = LIST.items.filter((i) => matches(i, true))
  const countable = LIST.items.filter((i) => matches(i, false))
  const categories = LIST.categories
    .map((c) => ({
      ...c,
      count: countable.filter((i) => i.category.slug === c.slug).length,
    }))
    .filter((c) => c.count > 0)
  return { items, categories, total: items.length }
}

type Mode = 'ok' | 'down' | 'tags-down'
let mode: Mode = 'ok'
const calls: string[] = []

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  mode = 'ok'
  calls.length = 0
  vi.stubGlobal('fetch', async (input: string) => {
    calls.push(input)
    if (mode === 'down') throw new TypeError('fetch failed')
    const url = new URL(input)
    const rest = url.pathname.slice(new URL(API).pathname.length)
    if (rest === '') return json(narrow(url.searchParams))
    if (rest === '/tags')
      return mode === 'tags-down' ? json({}, 503) : json({ tags: TAGS })
    const slug = decodeURIComponent(rest.slice(1))
    if (slug === ONE.slug) return json(ONE)
    const listed = LIST.items.find((i) => i.slug === slug)
    return listed ? json(listed) : json({ code: 'not_found' }, 404)
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

async function open(query: string) {
  const searchParams = Promise.resolve(
    Object.fromEntries(
      [...new URLSearchParams(query).keys()].map((k) => {
        const all = new URLSearchParams(query).getAll(k)
        return [k, all.length > 1 ? all : all[0]]
      }),
    ),
  )
  render(await IdeasPage({ searchParams }))
}

/** The titles of every idea card on the page, in order. */
function cardTitles(): string[] {
  return Array.from(document.querySelectorAll('li[id^="idea-"] h3')).map(
    (h) => h.textContent ?? '',
  )
}

const COMBINATIONS = [
  '',
  'category=ecommerce',
  'category=ai_infrastructure',
  'tag=smb',
  'tag=smb&tag=vertical-saas',
  'tag=ai-agents&tag=b2b-saas',
  'q=returns',
  'q=Small+businesses',
  'kind=motir_buys',
  'kind=direction',
  'category=ecommerce&tag=smb&q=returns',
  'category=pets&tag=healthcare',
  'tag=consumer&q=coach',
  'category=legal&kind=direction',
]

describe('every filter combination', () => {
  it.each(COMBINATIONS)(
    '?%s renders exactly the ideas the contract returns for it',
    async (query) => {
      await open(query)
      const expected = narrow(new URLSearchParams(query))
      // The page asked the contract for exactly this view…
      expect(calls).toContain(query ? `${API}?${query}` : API)
      // …and rendered those ideas and no others, Motir-would-buy first.
      const buys = expected.items.filter((i) => i.kind === 'motir_buys')
      const rest = expected.items.filter((i) => i.kind === 'direction')
      expect(cardTitles()).toEqual([...buys, ...rest].map((i) => i.title))
      if (expected.total === 0) {
        expect(
          screen.getByRole('heading', { name: copy.ideas.empty.title }),
        ).toBeTruthy()
      } else {
        expect(
          screen.queryByRole('heading', { name: copy.ideas.empty.title }),
        ).toBeNull()
      }
    },
  )

  it.each(COMBINATIONS)(
    '?%s round-trips through parseIdeasParams → ideasHref unchanged',
    (query) => {
      const raw = new URLSearchParams(query)
      expect(ideasHref(parseIdeasParams(raw))).toBe(
        query ? `/ideas?${query}` : '/ideas',
      )
    },
  )

  it('a card links to the same view with that idea open', async () => {
    await open('category=ecommerce&tag=smb')
    const link = screen.getByRole('link', { name: ONE.title })
    expect(link).toHaveAttribute(
      'href',
      `/ideas?category=ecommerce&tag=smb&idea=${ONE.slug}`,
    )
  })
})

describe('the route', () => {
  it('opens with its heading, the controls and the Motir-would-buy band', async () => {
    await open('')
    expect(
      screen.getByRole('heading', { level: 1, name: copy.ideas.headline }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: copy.ideas.find.heading }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: copy.ideas.listHeadline }),
    ).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('the idea open in place', () => {
  it('?idea= renders the list with that idea’s panel over it', async () => {
    await open(`category=ecommerce&idea=${ONE.slug}`)
    const sheet = screen.getByRole('dialog', { name: ONE.title })
    expect(sheet).toHaveTextContent(ONE.evidence[0].claim)
    expect(cardTitles()).toContain(ONE.title)
    // Read from the list: no second request for the idea.
    expect(calls.filter((c) => c.endsWith(`/${ONE.slug}`))).toEqual([])
  })

  it('an idea outside the current filters is read by its slug', async () => {
    await open(`category=legal&idea=${ONE.slug}`)
    expect(screen.getByRole('dialog', { name: ONE.title })).toBeTruthy()
    expect(calls).toContain(`${API}/${ONE.slug}`)
    expect(
      within(screen.getByRole('dialog')).getByRole('link', {
        name: copy.ideas.detail.close,
      }),
    ).toHaveAttribute('href', '/ideas?category=legal')
  })

  it('an unknown or retired slug renders the list with no panel and no error', async () => {
    await open('idea=no-such-idea')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(cardTitles()).toHaveLength(LIST.total)
  })

  it('the metadata names the open idea and keeps the idea in the canonical', async () => {
    const meta = await generateMetadata({
      searchParams: Promise.resolve({ tag: 'smb', idea: ONE.slug }),
    })
    expect(meta.title).toBe(`${ONE.title} · ${copy.ideas.metaTitle}`)
    expect(meta.description).toBe(ONE.pitch)
    expect(String(meta.alternates?.canonical)).toMatch(
      new RegExp(`/ideas\\?tag=smb&idea=${ONE.slug}$`),
    )
    expect(meta.robots).toEqual({ index: false, follow: true })
  })

  it('with no idea, or an unknown one, the metadata is the page’s own', async () => {
    for (const idea of [undefined, 'no-such-idea']) {
      const meta = await generateMetadata({
        searchParams: Promise.resolve({
          tag: 'smb',
          ...(idea ? { idea } : {}),
        }),
      })
      expect(meta.title).toBe(copy.ideas.metaTitle)
      expect(String(meta.alternates?.canonical)).toMatch(/\/ideas\?tag=smb$/)
    }
  })
})

describe('the states', () => {
  it('an unreachable API renders the error state with a retry of the same view', async () => {
    mode = 'down'
    await open('category=pets&idea=x')
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(copy.ideas.error.title)
    expect(
      within(status).getByRole('link', { name: copy.ideas.error.action }),
    ).toHaveAttribute('href', '/ideas?category=pets&idea=x')
    expect(cardTitles()).toEqual([])
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('a failed tags read still renders the list, without the tag filter', async () => {
    mode = 'tags-down'
    await open('')
    expect(cardTitles()).toHaveLength(LIST.total)
    expect(
      screen.queryByRole('group', { name: copy.ideas.find.tags }),
    ).toBeNull()
  })

  it('no match renders the no-match state', async () => {
    await open('q=zzzz-nothing')
    expect(
      screen.getByRole('heading', { name: copy.ideas.empty.title }),
    ).toBeTruthy()
    expect(screen.getByText(copy.ideas.find.countNone)).toBeTruthy()
  })
})

describe('the guards', () => {
  const ROOT = process.cwd()

  function sources(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) return sources(path)
      return /\.(ts|tsx|mjs|js)$/.test(name) ? [path] : []
    })
  }

  it('no database client or connection string anywhere in the site', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    expect(
      deps.filter((d) =>
        /prisma|^pg$|postgres|mysql|sqlite|drizzle|@neondatabase|@vercel\/postgres/.test(
          d,
        ),
      ),
    ).toEqual([])
    const offenders = ['app', 'lib', 'proxy.ts']
      .map((p) => join(ROOT, p))
      .flatMap((p) => (statSync(p).isDirectory() ? sources(p) : [p]))
      .filter((file) =>
        /DATABASE_URL|PrismaClient|@prisma\/client|postgres(ql)?:\/\//.test(
          readFileSync(file, 'utf8'),
        ),
      )
      .map((file) => relative(ROOT, file))
    expect(offenders).toEqual([])
  })

  it('the recorded fixtures carry every field the page renders', () => {
    const keys: Array<keyof PublicIdeaDto> = [
      'slug',
      'kind',
      'title',
      'pitch',
      'category',
      'tags',
      'capabilities',
      'evidence',
      'gap',
      'whyNow',
      'whyMotir',
      'whoElse',
    ]
    for (const idea of [...LIST.items, ONE]) {
      for (const key of keys) expect(idea).toHaveProperty(key)
      for (const e of idea.evidence) {
        expect(Object.keys(e).sort()).toEqual(
          ['claim', 'sourceDate', 'sourceName', 'url'].sort(),
        )
      }
    }
  })
})
