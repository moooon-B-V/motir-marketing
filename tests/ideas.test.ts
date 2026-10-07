// @vitest-environment node
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  IDEA_CATEGORY_SLUGS,
  IDEA_KINDS,
  IDEAS_QUERY_MAX,
  IDEAS_REVALIDATE_SECONDS,
  IdeasUnavailableError,
  fetchIdea,
  fetchIdeaTags,
  fetchIdeas,
  hasIdeaFilters,
  ideasHref,
  parseIdeasParams,
  type IdeasParams,
  type PublicIdeaDto,
  type PublicIdeaListDto,
  type PublicIdeaTagDto,
} from '@/lib/ideas'
import ideasFixture from '../e2e/fixtures/ideas.json'
import tagsFixture from '../e2e/fixtures/ideas-tags.json'
import ideaFixture from '../e2e/fixtures/idea-stop-returns-before-they-happen.json'

/*
 * The ideas data layer (MOTIR-7685, Story MOTIR-7665) — the URL model both
 * ways, every read's URL and cache option, the 404 → null, the error mapping,
 * and the recorded fixtures against the contract types.
 */

const ORIGIN = 'https://app.test.motir.co' // vitest.config.mts sets it
const EMPTY: IdeasParams = { tags: [] }

describe('parseIdeasParams', () => {
  it('reads every field from a Next searchParams record', () => {
    expect(
      parseIdeasParams({
        category: 'ecommerce',
        tag: ['smb', 'retail'],
        q: '  returns  ',
        kind: 'direction',
        idea: 'stop-returns-before-they-happen',
      }),
    ).toEqual({
      category: 'ecommerce',
      tags: ['smb', 'retail'],
      q: 'returns',
      kind: 'direction',
      idea: 'stop-returns-before-they-happen',
    })
  })

  it('reads a URLSearchParams the same way', () => {
    const raw = new URLSearchParams(
      'category=pets&tag=smb&tag=consumer&q=vet&kind=motir_buys&idea=a-b',
    )
    expect(parseIdeasParams(raw)).toEqual({
      category: 'pets',
      tags: ['smb', 'consumer'],
      q: 'vet',
      kind: 'motir_buys',
      idea: 'a-b',
    })
  })

  it('empty params are the unfiltered page', () => {
    expect(parseIdeasParams({})).toEqual({
      category: undefined,
      tags: [],
      q: undefined,
      kind: undefined,
      idea: undefined,
    })
    expect(hasIdeaFilters(parseIdeasParams({}))).toBe(false)
  })

  it('drops an unknown category or kind instead of failing the page', () => {
    const p = parseIdeasParams({ category: 'astrology', kind: 'maybe' })
    expect(p.category).toBeUndefined()
    expect(p.kind).toBeUndefined()
  })

  it('keeps repeated tags in order, de-duplicated, and drops non-slugs', () => {
    expect(
      parseIdeasParams({ tag: ['smb', ' ai-agents ', 'smb', 'Not A Slug', ''] })
        .tags,
    ).toEqual(['smb', 'ai-agents'])
  })

  it('trims q, caps it at 200 characters, and treats blank as absent', () => {
    expect(parseIdeasParams({ q: '   ' }).q).toBeUndefined()
    const long = 'x'.repeat(IDEAS_QUERY_MAX + 50)
    expect(parseIdeasParams({ q: long }).q).toHaveLength(IDEAS_QUERY_MAX)
  })

  it('takes the first value of a repeated single-valued param', () => {
    expect(parseIdeasParams({ category: ['legal', 'finance'] }).category).toBe(
      'legal',
    )
  })

  it('drops an idea slug that is not a slug', () => {
    expect(parseIdeasParams({ idea: '../etc/passwd' }).idea).toBeUndefined()
  })
})

describe('ideasHref', () => {
  it('the unfiltered page is a bare /ideas', () => {
    expect(ideasHref(EMPTY)).toBe('/ideas')
  })

  it('writes the parameters in one stable order', () => {
    expect(
      ideasHref({
        idea: 'stop-returns-before-they-happen',
        kind: 'direction',
        q: 'returns',
        tags: ['smb', 'retail'],
        category: 'ecommerce',
      }),
    ).toBe(
      '/ideas?category=ecommerce&tag=smb&tag=retail&q=returns&kind=direction&idea=stop-returns-before-they-happen',
    )
  })

  it('is stable through a parse: the same filters are the same URL', () => {
    const urls = [
      'q=returns&tag=smb&category=ecommerce',
      'category=ecommerce&q=returns&tag=smb',
      'tag=smb&tag=smb&category=ecommerce&q=%20returns%20&kind=nope',
    ]
    const hrefs = urls.map((u) =>
      ideasHref(parseIdeasParams(new URLSearchParams(u))),
    )
    expect(new Set(hrefs).size).toBe(1)
    expect(hrefs[0]).toBe('/ideas?category=ecommerce&tag=smb&q=returns')
    // …and round-trips: parsing the canonical URL gives the same URL back.
    const again = ideasHref(
      parseIdeasParams(new URLSearchParams(hrefs[0]!.split('?')[1])),
    )
    expect(again).toBe(hrefs[0])
  })

  it('applies a change, keeping what it does not mention', () => {
    const current: IdeasParams = {
      category: 'ecommerce',
      tags: ['smb'],
      q: 'returns',
    }
    expect(ideasHref(current, { tags: ['smb', 'retail'] })).toBe(
      '/ideas?category=ecommerce&tag=smb&tag=retail&q=returns',
    )
    expect(ideasHref(current, { category: 'pets' })).toBe(
      '/ideas?category=pets&tag=smb&q=returns',
    )
    expect(ideasHref(current, { kind: 'motir_buys' })).toBe(
      '/ideas?category=ecommerce&tag=smb&q=returns&kind=motir_buys',
    )
  })

  it('null clears a field; clearing everything is the bare page', () => {
    const current: IdeasParams = {
      category: 'ecommerce',
      tags: ['smb'],
      q: 'returns',
      kind: 'direction',
    }
    expect(ideasHref(current, { q: null })).toBe(
      '/ideas?category=ecommerce&tag=smb&kind=direction',
    )
    expect(
      ideasHref(current, { category: null, tags: [], q: null, kind: null }),
    ).toBe('/ideas')
  })

  it('opening an idea keeps the filters, and closing it returns to them', () => {
    const filtered: IdeasParams = { category: 'ecommerce', tags: ['smb'] }
    const open = ideasHref(filtered, {
      idea: 'stop-returns-before-they-happen',
    })
    expect(open).toBe(
      '/ideas?category=ecommerce&tag=smb&idea=stop-returns-before-they-happen',
    )
    const opened = parseIdeasParams(new URLSearchParams(open.split('?')[1]))
    expect(ideasHref(opened, { idea: null })).toBe(
      '/ideas?category=ecommerce&tag=smb',
    )
  })

  it('a blank q in a change is no q', () => {
    expect(ideasHref(EMPTY, { q: '   ' })).toBe('/ideas')
  })

  it('the open idea is not a filter', () => {
    expect(hasIdeaFilters({ tags: [], idea: 'a' })).toBe(false)
    expect(hasIdeaFilters({ tags: ['smb'] })).toBe(true)
  })
})

describe('the reads', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubFetch(response: Response | Error) {
    const fn = vi.fn(async () => {
      if (response instanceof Error) throw response
      return response
    })
    vi.stubGlobal('fetch', fn)
    return fn
  }

  const ok = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })

  it('fetchIdeas asks the API with the filters, never the open idea, hourly', async () => {
    const fetchMock = stubFetch(ok(ideasFixture))
    const list = await fetchIdeas({
      category: 'ecommerce',
      tags: ['smb', 'retail'],
      q: 'returns',
      kind: 'direction',
      idea: 'stop-returns-before-they-happen',
    })
    expect(list.total).toBe(ideasFixture.total)
    expect(fetchMock).toHaveBeenCalledWith(
      `${ORIGIN}/api/public/ideas?category=ecommerce&tag=smb&tag=retail&q=returns&kind=direction`,
      { next: { revalidate: IDEAS_REVALIDATE_SECONDS } },
    )
    expect(IDEAS_REVALIDATE_SECONDS).toBe(3600)
  })

  it('fetchIdeas with no filters asks for the whole store', async () => {
    const fetchMock = stubFetch(ok(ideasFixture))
    await fetchIdeas(EMPTY)
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/api/public/ideas`, {
      next: { revalidate: 3600 },
    })
  })

  it('fetchIdeaTags unwraps the tag list', async () => {
    const fetchMock = stubFetch(ok(tagsFixture))
    const tags = await fetchIdeaTags()
    expect(tags).toEqual(tagsFixture.tags)
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/api/public/ideas/tags`, {
      next: { revalidate: 3600 },
    })
  })

  it('fetchIdea reads one idea by its encoded slug', async () => {
    const fetchMock = vi.fn(async () => ok(ideaFixture))
    vi.stubGlobal('fetch', fetchMock)
    const idea = await fetchIdea('stop-returns-before-they-happen')
    expect(idea?.slug).toBe('stop-returns-before-they-happen')
    expect(fetchMock).toHaveBeenCalledWith(
      `${ORIGIN}/api/public/ideas/stop-returns-before-they-happen`,
      { next: { revalidate: 3600 } },
    )
    await fetchIdea('a/b?c')
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${ORIGIN}/api/public/ideas/a%2Fb%3Fc`,
      { next: { revalidate: 3600 } },
    )
  })

  it('fetchIdea answers null on a 404 — unknown and retired alike', async () => {
    stubFetch(new Response('{"code":"IDEA_NOT_FOUND"}', { status: 404 }))
    await expect(fetchIdea('retired-one')).resolves.toBeNull()
  })

  it('a 5xx is IdeasUnavailableError carrying the path and status', async () => {
    stubFetch(new Response('boom', { status: 503 }))
    const err = await fetchIdeas(EMPTY).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(IdeasUnavailableError)
    expect(err).toMatchObject({ path: '', status: 503 })
    expect((err as Error).message).toContain('HTTP 503')
  })

  it('a refused filter (400) is unavailable too, not an empty list', async () => {
    stubFetch(new Response('{"code":"INVALID_IDEA_FILTER"}', { status: 400 }))
    await expect(fetchIdeas({ tags: [], q: 'x' })).rejects.toMatchObject({
      name: 'IdeasUnavailableError',
      path: '?q=x',
      status: 400,
    })
  })

  it('an unreachable API is IdeasUnavailableError with no status', async () => {
    stubFetch(new TypeError('fetch failed'))
    const err = await fetchIdeaTags().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(IdeasUnavailableError)
    expect(err).toMatchObject({ path: '/tags', status: null })
    expect((err as Error).cause).toBeInstanceOf(TypeError)
  })

  it('a body that is not JSON is IdeasUnavailableError', async () => {
    stubFetch(new Response('<html>', { status: 200 }))
    await expect(fetchIdea('x')).rejects.toBeInstanceOf(IdeasUnavailableError)
  })

  it('a 5xx on the detail read is unavailable, never a silent null', async () => {
    stubFetch(new Response('boom', { status: 500 }))
    await expect(fetchIdea('x')).rejects.toMatchObject({ status: 500 })
  })
})

/*
 * The recorded fixtures (motir-core production, 2026-10-07) against the
 * contract. The JSON imports are typed WIDE (a string, not a category union),
 * so the assignment alone proves only the field names; the checks below prove
 * the closed sets.
 */
describe('the E2E fixtures match the contract', () => {
  const list: PublicIdeaListDto = ideasFixture as PublicIdeaListDto
  const tags: PublicIdeaTagDto[] = (tagsFixture as { tags: PublicIdeaTagDto[] })
    .tags
  const one: PublicIdeaDto = ideaFixture as PublicIdeaDto

  const IDEA_KEYS = [
    'addedAt',
    'capabilities',
    'category',
    'evidence',
    'gap',
    'kind',
    'lastReviewedAt',
    'pitch',
    'slug',
    'tags',
    'title',
    'whoElse',
    'whyMotir',
    'whyNow',
  ]

  function checkIdea(idea: PublicIdeaDto) {
    expect(Object.keys(idea).sort()).toEqual(IDEA_KEYS)
    expect(IDEA_KINDS).toContain(idea.kind)
    expect(IDEA_CATEGORY_SLUGS).toContain(idea.category.slug)
    for (const e of idea.evidence) {
      expect(Object.keys(e).sort()).toEqual([
        'claim',
        'sourceDate',
        'sourceName',
        'url',
      ])
      if (e.sourceDate !== null)
        expect(e.sourceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  }

  it('the list: every idea, counts and total', () => {
    expect(list.items.length).toBe(list.total)
    list.items.forEach(checkIdea)
    for (const c of list.categories) {
      expect(IDEA_CATEGORY_SLUGS).toContain(c.slug)
      expect(c.count).toBe(
        list.items.filter((i) => i.category.slug === c.slug).length,
      )
    }
  })

  it('the tags: slug, label and count', () => {
    expect(tags.length).toBeGreaterThan(0)
    for (const t of tags) {
      expect(Object.keys(t).sort()).toEqual(['count', 'label', 'slug'])
      expect(t.count).toBeGreaterThan(0)
    }
  })

  it('the detail: one idea, and the same one the list carries', () => {
    checkIdea(one)
    expect(list.items.find((i) => i.slug === one.slug)).toEqual(one)
  })
})

describe('no database client', () => {
  it('lib/ideas.ts reads the API only', () => {
    // `tests/legal/legalRoutes.test.ts` walks all of `lib/` for the standing
    // rule; this pins the new module to it by name, so the guard cannot pass
    // over it vacuously if the module ever moves.
    const src = readFileSync('lib/ideas.ts', 'utf8')
    for (const pattern of [
      /@prisma\/client/,
      /from\s+['"]pg['"]/,
      /DATABASE_URL/,
      /postgres(ql)?:\/\//i,
    ]) {
      expect(src).not.toMatch(pattern)
    }
    expect(src).toMatch(/\$\{APP_ORIGIN\}\/api\/public\/ideas/)
  })
})
