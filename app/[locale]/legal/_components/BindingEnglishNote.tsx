import { Info } from 'lucide-react'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/routing'
import { formatIcu, type Copy } from '@/lib/copy'

/*
 * The binding-English note (MOTIR-8088), built to `design/legal/design-notes.md`
 * § `legal--binding-english-note.*` and the mock
 * `design/legal/legal--binding-english-note.mock.html` (MOTIR-8085).
 *
 * In the ten non-English locales a legal page wraps English text in translated
 * chrome, deliberately: the documents are never translated. This says so, in
 * the page's language — the documents are published in English only and the
 * English text is the binding version — and, on a document, links to that
 * document in English (`href`, spelled by `englishLegalPath`).
 *
 * It composes the /docs generated-reference note's `.note.reference` shape
 * (`GeneratedReferenceNote`): `--el-surface` fill, `--el-border` hairline,
 * `--el-text-secondary` ink, `--radius-card`, an info glyph, `role="note"`. The
 * one addition is the link: `--el-link`, ALWAYS underlined (its ink is ~1.07:1
 * against the note's own text, so colour alone cannot mark it), deeper on hover,
 * and the header's focus outline. A plain `<a>`, not `next/link`: following it
 * changes the locale, and `<html lang>` and the script's faces belong to the
 * locale's own document, so it is a full-document move.
 *
 * The note is in the page's language, so it carries no `lang`; the English it
 * explains does. Renders nothing in English (design panel C).
 */
const LINK_CLASS =
  'font-medium text-(--el-link) underline underline-offset-[3px] hover:text-(--el-link-pressed) hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)'

export function BindingEnglishNote(
  props: {
    locale: Locale
    /** The page's own catalogue (`getCopy(locale)`), so the note stays synchronous. */
    copy: Copy
    className?: string
  } & (
    { variant: 'document'; href: string } | { variant: 'index'; href?: never }
  ),
) {
  const { locale, copy, className = '' } = props
  if (locale === DEFAULT_LOCALE) return null
  const text =
    props.variant === 'document'
      ? formatIcu(locale, copy.legal.bindingNote.document, {
          link: (chunks) => (
            <a href={props.href} className={LINK_CLASS}>
              {chunks}
            </a>
          ),
        })
      : copy.legal.bindingNote.index
  return (
    <div
      role="note"
      className={`flex max-w-[68ch] items-start gap-2.5 rounded-(--radius-card) border border-(--el-border) bg-(--el-surface) px-[calc(var(--spacing-control-x)*1.5)] py-[calc(var(--spacing-control-y)*2)] text-[13.5px] leading-[1.55] text-(--el-text-secondary) ${className}`}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 flex-none" />
      <p className="min-w-0 [overflow-wrap:break-word] hyphens-auto">{text}</p>
    </div>
  )
}
