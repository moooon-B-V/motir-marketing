import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { REQUEST_RENDERED_ALLOWLIST } from '@/scripts/i18n/check-prerender'

/*
 * MOTIR-8842 — a route renders per request only if it is on the allowlist.
 *
 * `pnpm i18n:check-prerender` reads the BUILD and fails any route left dynamic
 * that is not listed. This is its source-side half, and it runs on every push:
 * it reads `app/` and fails any file that opts INTO per-request rendering
 * (`export const dynamic = 'force-dynamic'`, `export const revalidate`) outside
 * the same allowlist. `staticGuards.test.ts` already covers the request READS
 * (`headers()`, `cookies()`); this covers the two segment exports that turn a
 * page dynamic or put it on a timer — the shape the MOTIR-8838 outage had.
 */

function sources(dir: string): string[] {
  return readdirSync(join(process.cwd(), dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = `${dir}/${entry.name}`
      if (entry.isDirectory()) return sources(path)
      return /\.(ts|tsx)$/.test(entry.name) ? [path] : []
    },
  )
}

/** `app/[locale]/p/[identifier]/page.tsx` → `/[locale]/p/[identifier]`. */
export function routeOfFile(file: string): string {
  const segments = file
    .replace(/^app\//, '')
    .replace(/\.(ts|tsx)$/, '')
    .split('/')
    .filter((segment) => !/^\(.*\)$/.test(segment))
  const last = segments[segments.length - 1]
  if (last === 'page' || last === 'route' || last === 'layout') segments.pop()
  return `/${segments.join('/')}`.replace(/\/$/, '') || '/'
}

/** The per-request opt-ins a file exports, by name — the AST, not the text. */
export function perRequestExports(file: string, text?: string): string[] {
  const source = ts.createSourceFile(
    file,
    text ?? readFileSync(join(process.cwd(), file), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const found: string[] = []
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    if (
      !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue
      const { text: name } = declaration.name
      const init = declaration.initializer
      if (name === 'revalidate') found.push('revalidate')
      if (
        name === 'dynamic' &&
        init &&
        ts.isStringLiteralLike(init) &&
        init.text === 'force-dynamic'
      )
        found.push("dynamic = 'force-dynamic'")
    }
  }
  return found
}

const allowed = (route: string) =>
  REQUEST_RENDERED_ALLOWLIST.some((entry) => entry.pattern.test(route))

describe('no file opts into per-request rendering outside the allowlist (MOTIR-8842)', () => {
  const files = sources('app')

  it('scans the whole tree', () => {
    expect(files.length).toBeGreaterThan(50)
    expect(files).toContain('app/[locale]/docs/api/page.tsx')
  })

  it('every `force-dynamic` and every `revalidate` export is on a listed route', () => {
    const offenders = files.flatMap((file) =>
      allowed(routeOfFile(file))
        ? []
        : perRequestExports(file).map((found) => `${file}: ${found}`),
    )
    expect(offenders).toEqual([])
  })

  it('the four generated reference pages are built, not on the list', () => {
    for (const file of [
      'app/[locale]/docs/api/page.tsx',
      'app/[locale]/docs/(guides)/cli/page.tsx',
      'app/[locale]/docs/(guides)/mcp/page.tsx',
      'app/[locale]/docs/(guides)/mcp/tools/page.tsx',
    ]) {
      expect(allowed(routeOfFile(file)), file).toBe(false)
      expect(perRequestExports(file), file).toEqual([])
    }
  })

  it('every entry names a real route (the list cannot outlive its routes)', () => {
    const routes = files.map(routeOfFile)
    const dead = REQUEST_RENDERED_ALLOWLIST.filter(
      (entry) =>
        !entry.manifestOnly &&
        !routes.some((route) => entry.pattern.test(route)),
    ).map((entry) => String(entry.pattern))
    expect(dead).toEqual([])
  })

  it('can fail: a fixture route that exports `dynamic` and is not listed', () => {
    const file = 'app/[locale]/pricing/page.tsx'
    const text =
      "export const dynamic = 'force-dynamic'\nexport const revalidate = 60\n"

    expect(allowed(routeOfFile(file))).toBe(false)
    expect(perRequestExports(file, text)).toEqual([
      "dynamic = 'force-dynamic'",
      'revalidate',
    ])
  })

  it('and passes a fixture that is listed, or that exports something else', () => {
    expect(allowed(routeOfFile('app/[locale]/explore/page.tsx'))).toBe(true)
    expect(allowed(routeOfFile('app/sitemap-projects.xml/route.ts'))).toBe(true)
    expect(
      perRequestExports('x.tsx', "export const dynamic = 'force-static'"),
    ).toEqual([])
  })
})
