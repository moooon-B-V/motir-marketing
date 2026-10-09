import { readFileSync } from 'node:fs'
import ts from 'typescript'

/*
 * THE HARD-CODED COPY SCANNER (MOTIR-7970).
 *
 * Finds English a translator can never reach: words written straight into JSX
 * rather than read from `messages/en.json`. It parses each file with the
 * TypeScript compiler rather than a regular expression, because the question
 * is structural — is this text a CHILD of an element, or the value of a COPY
 * attribute — and a regex cannot tell `<p>Close</p>` from `className="close"`.
 *
 * ⚠️ THE PREDICATE DECIDES THE WHOLE POPULATION. Too narrow and a page full of
 * copy scans clean; too wide and every class name is a finding. So it flags
 * exactly two shapes:
 *  • a `JsxText` child holding a run of two or more letters after trimming —
 *    a lone glyph (`↗`, `·`, `→`) is not copy;
 *  • a string literal, or a template literal with no expressions, on an
 *    attribute in {@link isCopyAttribute}'s set.
 *
 * Exported so the public-project sweep (MOTIR-7954) reuses the same rule.
 */

export interface CopyFinding {
  /** Repository-relative path, as given. */
  file: string
  line: number
  /** `text` for a JSX child, or the attribute's name. */
  where: string
  /** The literal, whitespace collapsed. */
  literal: string
}

const LETTERS = /\p{L}{2,}/u

const COPY_ATTRIBUTES = new Set([
  'aria-label',
  'aria-description',
  'title',
  'alt',
  'placeholder',
  'label',
])

/** Whether an attribute's value is something a reader reads. */
export function isCopyAttribute(name: string): boolean {
  return COPY_ATTRIBUTES.has(name) || /(Label|Title|Text|Message)$/.test(name)
}

/**
 * Whitespace collapsed, and HTML entities read as the one character they
 * render: `&gt;` in JSX text is a `>` glyph, not the letters g and t.
 */
function collapse(text: string): string {
  return text
    .replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, '\u2022')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Scan one source text. `file` is only carried into the findings. */
export function scanSource(file: string, source: string): CopyFinding[] {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const findings: CopyFinding[] = []
  const lineOf = (node: ts.Node) =>
    sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const literal = collapse(node.text)
      if (LETTERS.test(literal)) {
        findings.push({ file, line: lineOf(node), where: 'text', literal })
      }
    } else if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText(sf)
      if (isCopyAttribute(name)) {
        let value: ts.Node | undefined = node.initializer
        if (ts.isJsxExpression(value)) value = value.expression
        if (
          value &&
          (ts.isStringLiteral(value) ||
            ts.isNoSubstitutionTemplateLiteral(value))
        ) {
          const literal = collapse(value.text)
          if (LETTERS.test(literal)) {
            findings.push({ file, line: lineOf(node), where: name, literal })
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return findings
}

/** Scan one file on disk. */
export function scanFile(file: string): CopyFinding[] {
  return scanSource(file, readFileSync(file, 'utf8'))
}
