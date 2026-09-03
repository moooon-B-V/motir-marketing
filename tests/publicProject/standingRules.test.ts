import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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

describe('ONE CANONICAL PER PAGE — MOTIR-4222', () => {
  it("no /p/* file builds an absolute URL from siteUrl('/p/…')", () => {
    // ⚠️ THE CARD'S OWN GREP, MECHANISED. Every canonical, `og:url` and JSON-LD
    // `@id` on this surface must come from the project's PRIMARY address
    // (`publicUrlFor`), not from this site's origin — a `siteUrl('/p/…')` left
    // behind is a page telling a crawler that `motir.co` is canonical for a
    // project whose canonical moved, which is the duplication *make primary*
    // exists to prevent.
    //
    // COMMENTS ARE STRIPPED FIRST, the rule this file already applies to the
    // e2e-origin guard: the files that explain the change have to QUOTE the old
    // expression to explain it, and a guard that forbade naming the thing it
    // forbids would have exactly one repair available — deleting the
    // explanation.
    const code = (f: string): string =>
      read(f)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')

    const offenders = tracked('app/p').filter((f) =>
      /siteUrl\(\s*[`'"]\/p\//.test(code(f)),
    )
    expect(
      offenders,
      'build it from the project’s primary with publicUrlFor() instead',
    ).toEqual([])
  })

  it('and the sitemap and robots read the REQUEST’s host', () => {
    // Both are served at every address the renderer answers for, and a sitemap
    // may only list URLs on its own host. Asserted at the source because the
    // behavioural half needs a request scope — `tests/host/crawlSurface.test.ts`
    // supplies one and asks all three.
    for (const file of ['app/sitemap.ts', 'app/robots.ts']) {
      expect(read(file), `${file} answers as motir.co on every host`).toContain(
        'requestPublicHost',
      )
    }
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
    const coverage = config.slice(config.indexOf('coverage: {'))
    const include = coverage.slice(
      coverage.indexOf('include: ['),
      coverage.indexOf(']', coverage.indexOf('include: [')),
    )
    // ⚠️ THE TWO GLOBS ARE THE LOAD-BEARING ENTRIES — narrowing either is the
    // change that silently un-measures a surface. The rest of the list is
    // literal paths, and each is asserted to EXIST below rather than merely to
    // be named, so a file that moves cannot leave a dead entry behind.
    for (const entry of ['lib/publicProject.ts', 'app/p/**/*.tsx']) {
      expect(include, `the coverage include lost ${entry}`).toContain(entry)
    }

    const literals = [...include.matchAll(/'([^'*]+\.tsx?)'/g)].map(
      (m) => m[1]!,
    )
    expect(literals.length).toBeGreaterThan(1)
    for (const file of literals) {
      expect(
        existsSync(join(ROOT, file)),
        `${file} is in the coverage include but does not exist`,
      ).toBe(true)
    }
  })

  it('every host-router file is measured — MOTIR-4220', () => {
    // The router is the one file on this surface a visitor cannot reach any
    // other way: it runs before every page and after none, so nothing else's
    // coverage covers it. Naming it here is what keeps that true.
    const coverage = read('vitest.config.mts').slice(
      read('vitest.config.mts').indexOf('coverage: {'),
    )
    for (const file of [
      'proxy.ts',
      'lib/publicHost.ts',
      'lib/hostResolution.ts',
      'lib/tenantDomain.ts',
    ]) {
      expect(coverage, `${file} is not in the coverage include`).toContain(
        `'${file}'`,
      )
    }
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
  it('no e2e spec reconstructs an origin from the environment', () => {
    /*
     * ⚠️ THIS RULE COST A RED CI RUN, and the red run was the lucky outcome.
     *
     * `ci.yml` sets `NEXT_PUBLIC_MOTIR_APP_ORIGIN` at WORKFLOW level, to
     * production, because `build` and `deploy` need it there. A spec that read
     * it with a local fallback therefore addressed the STUB locally and
     * `https://app.motir.co` in CI — this lane made real calls to production on
     * a pull request, which is exactly the cross-repository coupling
     * `public-surface-hosts.md` AMENDMENT 2 §E splits its jobs to avoid.
     *
     * It failed loudly only because the two answer different error codes. A
     * spec whose assertion happened to hold against the live API would have
     * gone green and told nobody. So the rule is not "assert the right code" —
     * it is that a spec may not derive an address from the environment at all.
     * `e2e/stub/origin.ts` is the one place these live.
     */
    // ⚠️ COMMENTS ARE STRIPPED FIRST, and that is not a convenience. The two
    // files that explain this trap have to QUOTE the expression to explain it,
    // and a guard that forbade naming the thing it forbids would have exactly
    // one repair available: deleting the explanation. So the rule is asked of
    // the code.
    const code = (f: string): string =>
      read(f)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '')

    const offenders = tracked('e2e')
      .filter((f) => !f.endsWith('e2e/stub/origin.ts'))
      .filter((f) =>
        /process\.env\[?['"`]NEXT_PUBLIC_MOTIR_APP_ORIGIN/.test(code(f)),
      )

    expect(
      offenders,
      'import STUB_ORIGIN / SITE_ORIGIN from e2e/stub/origin.ts instead — ' +
        'ci.yml sets NEXT_PUBLIC_MOTIR_APP_ORIGIN to PRODUCTION at workflow level',
    ).toEqual([])
  })
  it("the stub's hand-run port default still equals the lane's port", () => {
    // The stub cannot import `origin.ts` — it is launched by
    // `node --experimental-strip-types`, which is native ESM and would need an
    // explicit `./origin.ts` specifier. So its literal is a hand-run default and
    // this is what stops the two drifting apart in silence: a lane pointed at
    // 4319 while the stub listened on something else would fail as a connection
    // error, which reads like a broken machine rather than a wrong constant.
    const stub = read('e2e/stub/publicApiStub.ts')
    const origin = read('e2e/stub/origin.ts')

    const declared = /export const STUB_PORT = (\d+)/.exec(origin)?.[1]
    const fallback = /MOTIR_PUBLIC_API_STUB_PORT'\] \?\? (\d+)/.exec(stub)?.[1]

    expect(declared).toBeDefined()
    expect(fallback).toBe(declared)
  })
})
