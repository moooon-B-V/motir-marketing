// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  checkPrerender,
  pageRoutes,
  staticPageRoutes,
  underLocale,
  type BaseList,
  type PrerenderManifest,
} from '@/scripts/i18n/check-prerender'
import { LOCALES } from '@/i18n/routing'

/*
 * MOTIR-7967 — the prerender check, on fixture manifests shaped like
 * `next build`'s. The real build is checked by `pnpm i18n:check-prerender` in
 * the CI job that builds; this proves the check fails for the right reasons.
 */

const appPathRoutes = {
  '/[locale]/page': '/[locale]',
  '/[locale]/design/page': '/[locale]/design',
  '/[locale]/products/[slug]/page': '/[locale]/products/[slug]',
  '/[locale]/explore/page': '/[locale]/explore',
  '/[locale]/p/[identifier]/page': '/[locale]/p/[identifier]',
  '/[locale]/[...rest]/page': '/[locale]/[...rest]',
  '/[locale]/opengraph-image/route': '/[locale]/opengraph-image',
  '/_not-found/page': '/_not-found',
}

function manifest(drop: string[] = []): PrerenderManifest {
  const routes: PrerenderManifest['routes'] = {
    '/_not-found': { srcRoute: '/_not-found' },
  }
  for (const l of LOCALES) {
    routes[`/${l}`] = { srcRoute: '/[locale]' }
    routes[`/${l}/design`] = { srcRoute: '/[locale]/design' }
    for (const slug of ['mcp', 'cli'])
      routes[`/${l}/products/${slug}`] = {
        srcRoute: '/[locale]/products/[slug]',
      }
  }
  for (const path of drop) delete routes[path]
  return { routes }
}

const base = ['/', '/design', '/products/[slug]']

describe('checkPrerender', () => {
  it('passes a build with every static route in every locale', () => {
    const { problems, checked } = checkPrerender({
      appPathRoutes,
      prerender: manifest(),
      locales: LOCALES,
      base,
    })
    expect(problems).toEqual([])
    expect(checked.get('/[locale]/products/[slug]')).toBe(LOCALES.length * 2)
  })

  it('names the route and the locale a manifest is missing', () => {
    const { problems } = checkPrerender({
      appPathRoutes,
      prerender: manifest(['/ko/design']),
      locales: LOCALES,
      base,
    })
    expect(problems).toEqual(['/[locale]/design: not prerendered for ko'])
  })

  it('names the slug of a dynamic-segment route', () => {
    const { problems } = checkPrerender({
      appPathRoutes,
      prerender: manifest(['/pl/products/cli', '/pt/products/cli']),
      locales: LOCALES,
      base,
    })
    expect(problems).toEqual([
      '/[locale]/products/[slug]: /products/cli not prerendered for pl, pt',
    ])
  })

  it('fails a base route that turned dynamic, which no locale count can see', () => {
    const dynamic = manifest(LOCALES.map((l) => `/${l}/design`))
    const { problems } = checkPrerender({
      appPathRoutes,
      prerender: dynamic,
      locales: LOCALES,
      base,
    })
    expect(problems).toEqual([
      '/design: static before the story, now not prerendered (/[locale]/design)',
    ])
  })

  it('fails a base route whose page is gone', () => {
    const { problems } = checkPrerender({
      appPathRoutes,
      prerender: manifest(),
      locales: LOCALES,
      base: [...base, '/how-it-works'],
    })
    expect(problems).toEqual([
      '/how-it-works: static before the story, now no page at /[locale]/how-it-works',
    ])
  })

  it('leaves request-rendered and dynamic routes to the base list', () => {
    const { checked } = checkPrerender({
      appPathRoutes,
      prerender: manifest(),
      locales: LOCALES,
      base: [],
    })
    expect([...checked.keys()].sort()).toEqual([
      '/[locale]',
      '/[locale]/design',
      '/[locale]/products/[slug]',
    ])
  })
})

describe('the helpers', () => {
  it('lists pages only, never a route handler or a metadata file', () => {
    expect(pageRoutes(appPathRoutes)).not.toContain('/[locale]/opengraph-image')
    expect(pageRoutes(appPathRoutes)).toContain('/_not-found')
  })

  it('cuts a base list from a pre-story build, without Next’s own pages', () => {
    const pre = {
      '/page': '/',
      '/design/page': '/design',
      '/explore/page': '/explore',
      '/_not-found/page': '/_not-found',
    }
    expect(
      staticPageRoutes(pre, {
        routes: {
          '/': { srcRoute: null },
          '/design': {},
          '/_not-found': {},
        },
      }),
    ).toEqual(['/', '/design'])
    expect(underLocale('/')).toBe('/[locale]')
    expect(underLocale('/design')).toBe('/[locale]/design')
  })
})

describe('the committed base list', () => {
  const list = JSON.parse(
    readFileSync(
      join(process.cwd(), 'scripts/i18n/static-routes.base.json'),
      'utf8',
    ),
  ) as BaseList

  it('names the pre-story commit it was cut from, and the landing', () => {
    expect(list.sha).toMatch(/^[0-9a-f]{40}$/)
    expect(list.routes).toContain('/')
    expect(list.routes).toContain('/products/[slug]')
  })
})
