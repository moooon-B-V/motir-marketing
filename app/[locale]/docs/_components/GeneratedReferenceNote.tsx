import { Info } from 'lucide-react'
import { DEFAULT_LOCALE, type Locale } from '@/i18n/routing'
import type { Copy } from '@/lib/copy'

/*
 * The generated-reference note (MOTIR-8049), built to
 * `design/docs/design-notes.md` § `docs--localized-notes.*` and the mock
 * `design/docs/docs--localized-notes.mock.html` (`.note.reference`, panels A, B,
 * H): it sits ONCE between the page's introduction and its first generated block
 * and says why the descriptions below stay English — they are the OpenAPI
 * document (`source="openapi"`) or what the installed `motir` command prints
 * (`source="cli"`).
 *
 * `--el-surface` fill, `--el-border` hairline, `--el-text-secondary` ink (AA on
 * the surface), `--radius-card`, an info glyph. The text is in the PAGE's
 * language, so the note carries no `lang`; the English it explains does.
 *
 * Renders nothing in English (panel G). The caller also withholds it while the
 * page's own document is the English fallback (panel E): the whole page is
 * English there, and the being-updated note is the one that describes it.
 */
export function GeneratedReferenceNote({
  source,
  locale,
  copy,
}: {
  source: 'openapi' | 'cli'
  locale: Locale
  /** The page's own catalogue (`getCopy(locale)`), so the note stays synchronous. */
  copy: Copy
}) {
  if (locale === DEFAULT_LOCALE) return null
  const text =
    source === 'openapi'
      ? copy.docs.notes.generatedReference.openapi
      : copy.docs.notes.generatedReference.cli
  return (
    <div
      role="note"
      className="mt-5 flex max-w-[68ch] items-start gap-2.5 rounded-(--radius-card) border border-(--el-border) bg-(--el-surface) px-[calc(var(--spacing-control-x)*1.5)] py-[calc(var(--spacing-control-y)*2)] text-[13.5px] leading-[1.55] text-(--el-text-secondary)"
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 flex-none" />
      <p className="min-w-0 [overflow-wrap:break-word] hyphens-auto">{text}</p>
    </div>
  )
}
