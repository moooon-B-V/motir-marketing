import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * The legal-document Markdown body, rendered with `react-markdown` +
 * `remark-gfm` — the SAME renderer motir-core ships for its own Markdown
 * surfaces (MOTIR-4009 chose it; see the pull-request body for the reason).
 *
 * The content is moooon B.V.'s OWN trusted legal copy (ported byte-for-byte),
 * so there is NO sanitisation plugin: the drivers are that headings, lists and
 * tables render to `design/legal/`'s treatment and that nothing heavy is added
 * to the dependency tree. `react-markdown` + `remark-gfm` add no outbound-HTTP
 * or data-processing surface, so they are not a subprocessor and need no
 * disclosure row in `content/legal/subprocessors.md`.
 *
 * Every element maps to the design asset's treatment (`design/legal/`): serif
 * `h2`, sans `h3`, body at 15px/1.7, tables with `--el-border` and a
 * `--el-surface-soft` header, emphasis in `--el-text-strong`. Colours flow
 * through `--el-*` tokens only.
 */

type ComponentMap = ComponentProps<typeof ReactMarkdown>['components']

/** An absolute http(s) href leaves this site; relative links stay in-page. */
const isExternal = (href: string) => /^https?:\/\//.test(href)

export function MarkdownBody({ value }: { value: string }) {
  return (
    <div className="text-[15px] leading-[1.7] text-(--el-text)">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {value}
      </ReactMarkdown>
    </div>
  )
}

const components: ComponentMap = {
  // The h1 never appears in the body — the page renders its own h1 from front
  // matter — so it is mapped to the h2 treatment defensively rather than left
  // to the browser default.
  h1: (props) => (
    <h2
      {...props}
      className="mt-8 mb-3 font-(family-name:--font-serif) text-[20px] leading-snug font-bold tracking-[-0.01em] text-(--el-text-strong)"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="mt-8 mb-3 font-(family-name:--font-serif) text-[20px] leading-snug font-bold tracking-[-0.01em] text-(--el-text-strong)"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="mt-5 mb-2 text-[15px] font-semibold text-(--el-text-strong)"
    />
  ),
  h4: (props) => (
    <h4
      {...props}
      className="mt-4 mb-2 text-[15px] font-semibold text-(--el-text-strong)"
    />
  ),
  p: (props) => <p {...props} className="my-3.5" />,
  ul: (props) => <ul {...props} className="my-3.5 list-disc pl-6" />,
  ol: (props) => <ol {...props} className="my-3.5 list-decimal pl-6" />,
  li: (props) => <li {...props} className="my-1.5" />,
  strong: (props) => (
    <strong {...props} className="font-semibold text-(--el-text-strong)" />
  ),
  em: (props) => <em {...props} className="italic" />,
  a: ({ href, ...props }) => (
    <a
      {...props}
      href={href}
      {...(href && isExternal(href)
        ? { target: '_blank', rel: 'noreferrer' }
        : {})}
      className="text-(--el-link) underline underline-offset-2 hover:text-(--el-link-pressed)"
    />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="my-4 border-l-2 border-(--el-border-strong) pl-4 text-(--el-text-secondary)"
    />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded-(--radius-kbd) bg-(--el-muted) px-1.5 py-0.5 font-(family-name:--font-mono) text-[13px] text-(--el-text-strong)"
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      className="my-4 overflow-x-auto rounded-(--radius-card) border border-(--el-border) bg-(--el-surface) p-4"
    />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-[13px]" />
    </div>
  ),
  thead: (props) => <thead {...props} className="bg-(--el-surface-soft)" />,
  th: (props) => (
    <th
      {...props}
      className="border border-(--el-border) px-2.5 py-2 text-left font-semibold text-(--el-text-strong)"
    />
  ),
  td: (props) => (
    <td
      {...props}
      className="border border-(--el-border) px-2.5 py-2 align-top"
    />
  ),
  hr: (props) => <hr {...props} className="my-6 border-(--el-border)" />,
}
