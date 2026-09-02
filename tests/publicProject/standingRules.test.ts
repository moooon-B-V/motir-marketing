import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { APP_ORIGIN } from '@/lib/appOrigin'
import { SITE_ORIGIN } from '@/lib/siteOrigin'

/*
 * THE GUARANTEES COVERAGE CANNOT SEE (MOTIR-4121).
 *
 * Each of these is true of the tree rather than of a function, so each is asked
 * of the tree — the idiom `tests/legal/legalRoutes.test.ts` already uses for the
 * no-database rule, and `tests/hosting/appUrlSeam.test.ts` in motir-core for the
 * origin seam.
 */

const ROOT = process.cwd()

const tracked = (dir: string): string[] =>
  execFileSync('git', ['ls-files', dir], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f))

const read = (file: string) => readFileSync(join(ROOT, file), 'utf8')

describe('the standing NO-DATABASE rule reaches the new tree', () => {
  it('finds the /p/* files at all — the vacuous-pass floor', () => {
    // `tests/legal/legalRoutes.test.ts` walks `app` and `lib` from the
    // filesystem, so it covers this tree by construction. That is only true
    // while the tree is IN those directories, which is what this asserts —
    // otherwise the guard would keep passing over a surface it no longer sees.
    expect(tracked('app/p').length).toBeGreaterThanOrEqual(10)
    expect(tracked('lib')).toContain('lib/publicProject.ts')
  })

  it('no /p/* file imports a database client or a connection string', () => {
    const forbidden = [/@prisma\/client/, /from\s+['"]pg['"]/, /DATABASE_URL/]
    const hits: string[] = []
    for (const file of [...tracked('app/p'), 'lib/publicProject.ts']) {
      const src = read(file)
      for (const pattern of forbidden) {
        if (pattern.test(src)) hits.push(`${file}: ${pattern}`)
      }
    }
    expect(hits, hits.join('\n')).toEqual([])
  })
})

describe('ORIGINS DO NOT CROSS', () => {
  it('the two origins are actually different, or this suite proves nothing', () => {
    expect(SITE_ORIGIN).not.toBe(APP_ORIGIN)
  })

  it('every API read is built from the APP origin, through one module', () => {
    // `lib/publicProject.ts` owns the only `${APP_ORIGIN}/api/public` there is.
    // A component that built its own would be a second answer to where the API
    // lives, and the first one to drift at cutover.
    const offenders = [...tracked('app/p')].filter((file) =>
      /\/api\/public/.test(read(file)),
    )
    expect(
      offenders,
      'a /p/* file builds an API path itself instead of using lib/publicProject.ts',
    ).toEqual([])
  })

  it('no /p/* file hardcodes either origin as a literal', () => {
    // Getting these the wrong way round is SILENT in production —
    // `lib/siteOrigin.ts`'s own header warns about exactly that — and a literal
    // is how it happens.
    const hits: string[] = []
    for (const file of [...tracked('app/p'), 'lib/publicProject.ts']) {
      const src = read(file)
      // In prose, naming the host is how these files explain themselves; in
      // CODE it is a second source of truth. Strings are what this looks for.
      for (const match of src.matchAll(
        /['"`]https:\/\/(app\.)?motir\.co[^'"`]*['"`]/g,
      )) {
        hits.push(`${file}: ${match[0]}`)
      }
    }
    expect(hits, hits.join('\n')).toEqual([])
  })

  it('the hand-off return is built from SITE_ORIGIN, not from the app origin', () => {
    // The application validates the return against its configured public origin
    // and falls back otherwise, so a return built from the wrong origin is
    // silently discarded and the visitor lands on a dashboard.
    const src = read('lib/publicProject.ts')
    const actHref = src.slice(src.indexOf('export function actHref'))
    expect(actHref).toContain('SITE_ORIGIN_FOR_RETURN')
  })
})

describe('THE ERROR STATE IS REACHABLE — every /p/* screen has one', () => {
  it('every page that reads renders the error state rather than throwing', () => {
    // A screen that let the read throw would 500 the whole route on an outage,
    // which is the one thing `public-surface-hosts.md` §8 cost 1 says this
    // surface must not do. Derived from the filesystem so a screen added later
    // cannot skip it.
    const pages = tracked('app/p').filter((f) => f.endsWith('page.tsx'))
    expect(pages.length).toBeGreaterThanOrEqual(9)

    const missing = pages.filter((file) => {
      const src = read(file)
      // Either it renders the state itself, or it delegates to the shared tab
      // helper that does — both are the state being reachable.
      return !src.includes('ErrorState') && !src.includes('renderTabPage')
    })
    expect(missing, missing.join('\n')).toEqual([])
  })

  it('and the 404 stays distinct from the outage on every screen that can 404', () => {
    const pages = tracked('app/p').filter((f) => f.endsWith('page.tsx'))
    const both = pages.filter((file) => {
      const src = read(file)
      return src.includes('notFound()') || src.includes('renderTabPage')
    })
    // Every screen either decides existence itself or delegates that decision.
    expect(both.length).toBe(pages.length)
  })
})

describe('THE COVERAGE LIST IS NOT A PLACE TO FORGET A FILE', () => {
  it('every /p/* component is inside the measured include globs', () => {
    // ⚠️ MOTIR-4120 found exactly this on the motir-core side: the include entry
    // there was a LITERAL path, so five new route files inherited no floor and
    // the gate was green because it was measuring nothing. The globs here are
    // `app/p/**/*.tsx` and `lib/publicProject.ts`, so a component added later is
    // measured — this asserts the globs still SAY that, since narrowing them is
    // the change that would silently un-measure the surface.
    const config = read('vitest.config.mts')
    expect(config).toContain(
      "include: ['lib/publicProject.ts', 'app/p/**/*.tsx']",
    )
  })

  it('every exclusion in that config is a path that exists', () => {
    // An exclusion whose path has moved silently stops excluding, and — worse —
    // reads as though something is still deliberately out of scope.
    const config = read('vitest.config.mts')
    // ⚠️ SCOPED TWICE, and both scopings were earned by a red run. First to the
    // COVERAGE section — the file has an earlier `exclude:` for the test glob,
    // and anchoring on the first one finds `node_modules` instead. Then to the
    // `exclude` array within it — a tree-wide match for the same glob shape also
    // picks up the THRESHOLD key, which is a different thing with a different
    // meaning, and asserting that a threshold glob "matches a file" is both
    // wrong and confusing when it fails.
    const coverage = config.slice(config.indexOf('coverage: {'))
    const block = coverage.slice(
      coverage.indexOf('exclude: ['),
      coverage.indexOf(']', coverage.indexOf('exclude: [')),
    )
    const excluded = [...block.matchAll(/'(app\/p\/[^']+)'/g)].map((m) => m[1]!)
    expect(excluded.length).toBeGreaterThan(0)

    const files = tracked('app/p')
    for (const pattern of excluded) {
      const suffix = pattern.replace('app/p/**/', '')
      const matched = files.some((f) => f.endsWith(`/${suffix}`))
      expect(matched, `nothing matches the exclusion ${pattern}`).toBe(true)
    }
  })
})
