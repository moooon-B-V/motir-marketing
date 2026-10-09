// @vitest-environment node
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/*
 * THE TWO 404 BOUNDARIES STAY SYNCHRONOUS AND READ NO REQUEST (MOTIR-7955).
 *
 * Both rules are measurements recorded in `app/not-found.tsx`'s header: a
 * request read in a not-found boundary turns the whole site dynamic, and a
 * NESTED boundary made `async` renders an empty 404 document. Neither shows up
 * in a unit test or a type check — `pnpm build`'s route table and a browser
 * are otherwise the only signals, and only if somebody reads them. This guard
 * reads the source instead.
 */

const BOUNDARIES = ['app/not-found.tsx', 'app/[locale]/not-found.tsx']
const REQUEST_FREE = [...BOUNDARIES, 'app/_components/NotFoundRoom.tsx']

const parse = (file: string, text = readFileSync(file, 'utf8')) =>
  ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

/** Whether the file's default export is an `async` function. */
function defaultExportIsAsync(file: string): boolean {
  const source = parse(file)
  let found: boolean | undefined
  for (const statement of source.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      found = Boolean(
        statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword),
      )
    }
  }
  if (found === undefined) throw new Error(`${file}: no default function`)
  return found
}

const REQUEST_READS = new Set(['headers', 'cookies', 'draftMode'])

/**
 * Every call to a request read, by name. The AST rather than the text, because
 * the files' own comments explain the rule and so name `headers()` themselves.
 */
function requestReads(source: ts.SourceFile): string[] {
  const found: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : undefined
      if (name && REQUEST_READS.has(name)) found.push(`${name}(`)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

describe('the not-found boundaries', () => {
  it.each(BOUNDARIES)('%s has a synchronous default export', (file) => {
    expect(defaultExportIsAsync(file)).toBe(false)
  })

  it.each(REQUEST_FREE)(
    '%s calls no headers(), cookies() or draftMode()',
    (file) => {
      expect(requestReads(parse(file))).toEqual([])
    },
  )

  it('the guard sees an async export and a request read', () => {
    // A guard on the guard: each check must be able to fail.
    expect(defaultExportIsAsync('app/[locale]/[...rest]/page.tsx')).toBe(true)
    expect(
      requestReads(
        parse(
          'fixture.tsx',
          "export default function X() { const h = headers(); return cookies().get('a') }",
        ),
      ),
    ).toEqual(['headers(', 'cookies('])
  })
})
