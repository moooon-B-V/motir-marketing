import { Children, type ComponentProps, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { localizedPath } from '@/i18n/localizedPath'
import type { Locale } from '@/i18n/routing'
import { getCopy } from '@/lib/copy'
import {
  DocsDocumentError,
  resolveDocsDocument,
  splitSlots,
  substituteValues,
} from '@/lib/docsDocuments'
import { TranslationUpdatingNote } from './TranslationUpdatingNote'

/*
 * Renders one /docs page's prose from its authored document (MOTIR-8032).
 * `lib/docsDocuments.ts` is the contract; this is its renderer.
 *
 * - `{{value:name}}` is substituted from `values` BEFORE the Markdown is parsed,
 *   so it works in a paragraph, a list item, a table cell, an inline code span
 *   and a link destination alike, and identically for English and a translation.
 * - `{{slot:name}}` (alone on a line) renders `slots[name]`: the page builds the
 *   node, so what a reader copies is the same bytes in every language. An
 *   unresolved slot or value throws.
 * - A heading's `{#id}` is its DOM id, verbatim.
 * - On a stale or missing translation the English document renders under the
 *   "being updated" note, in a wrapper marked `lang="en"` (design panels C–E).
 */

type ComponentMap = ComponentProps<typeof ReactMarkdown>['components']

const ANCHOR_AT_END = /\s*\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}\s*$/

/** Pull the explicit `{#id}` off a heading's last text child. */
function splitAnchor(children: ReactNode): { id: string; rest: ReactNode[] } {
  const nodes = Children.toArray(children)
  const last = nodes[nodes.length - 1]
  if (typeof last === 'string') {
    const match = ANCHOR_AT_END.exec(last)
    if (match) {
      const trimmed = last.replace(ANCHOR_AT_END, '')
      return {
        id: match[1]!,
        rest:
          trimmed.length > 0
            ? [...nodes.slice(0, -1), trimmed]
            : nodes.slice(0, -1),
      }
    }
  }
  throw new DocsDocumentError(
    '(rendered heading)',
    'a heading reached the renderer without its {#id}',
  )
}

const isExternal = (href: string) => /^https?:\/\//.test(href)

function components(locale: Locale): ComponentMap {
  function heading(Tag: 'h1' | 'h2' | 'h3' | 'h4', className: string) {
    function Heading({ children }: { children?: ReactNode }) {
      const { id, rest } = splitAnchor(children)
      return (
        <Tag id={id} className={className}>
          {rest}
        </Tag>
      )
    }
    return Heading
  }
  return {
    h1: heading(
      'h1',
      'font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)',
    ),
    h2: heading(
      'h2',
      'mt-9 text-[11px] font-semibold tracking-[0.06em] text-(--el-text-secondary) uppercase',
    ),
    h3: heading('h3', 'mt-6 text-[15px] font-semibold text-(--el-text)'),
    h4: heading('h4', 'mt-5 text-[15px] font-semibold text-(--el-text)'),
    p: ({ children }) => (
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mt-2.5 max-w-[68ch] list-disc pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-2.5 max-w-[68ch] list-decimal pl-5">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="py-1 text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-(--el-text)">{children}</strong>
    ),
    code: ({ children }) => (
      <code className="font-(family-name:--font-mono) text-[0.92em]">
        {children}
      </code>
    ),
    a: ({ href, children }) => {
      const external = href !== undefined && isExternal(href)
      return (
        <a
          href={href?.startsWith('/') ? localizedPath(locale, href) : href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="text-(--el-link) underline underline-offset-2 hover:text-(--el-link-pressed)"
        >
          {children}
        </a>
      )
    },
    table: ({ children }) => (
      <div className="mt-4 max-w-[68ch] overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-(--el-border) bg-(--el-surface-soft) px-2.5 py-2 text-left font-semibold text-(--el-text-strong)">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-(--el-border) px-2.5 py-2 align-top text-(--el-text-secondary)">
        {children}
      </td>
    ),
  }
}

export async function DocsDocument({
  slug,
  locale,
  slots,
  values = {},
  root,
}: {
  /** The route minus `/docs`: `index`, `sandbox`, `mcp/tools`. */
  slug: string
  locale: Locale
  /** Block slots: what a reader copies or a generated table renders. */
  slots: Record<string, ReactNode>
  /** Inline values the prose must not restate; built per request and locale. */
  values?: Record<string, string>
  /** Tests only: point at a fixture tree. */
  root?: string
}) {
  const { document, fallback } = resolveDocsDocument(slug, locale, root)
  const markdown = substituteValues(document.markdown, values, document.file)
  const body = splitSlots(markdown).map((part, index) => {
    if (part.kind === 'slot') {
      if (!(part.name in slots)) {
        throw new DocsDocumentError(
          document.file,
          `no slot named "${part.name}" was passed to the renderer`,
        )
      }
      return <div key={`slot-${index}`}>{slots[part.name]}</div>
    }
    return (
      <ReactMarkdown
        key={`md-${index}`}
        remarkPlugins={[remarkGfm]}
        components={components(locale)}
      >
        {part.text}
      </ReactMarkdown>
    )
  })
  if (fallback === null) return <>{body}</>
  const copy = await getCopy(locale)
  return (
    <>
      <TranslationUpdatingNote text={copy.docs.notes.beingUpdated} />
      <div lang="en">{body}</div>
    </>
  )
}

// Exported so the tests can assert the heading splitter's contract directly.
export { splitAnchor }
