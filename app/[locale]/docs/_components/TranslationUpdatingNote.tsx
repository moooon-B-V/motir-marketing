import { Clock } from 'lucide-react'

/*
 * The "being updated" note (MOTIR-8032), built to
 * `design/docs/design-notes.md` § `docs--localized-notes.*` and the mock
 * `design/docs/docs--localized-notes.mock.html` (`.note.updating`, panels C, D,
 * E, H): the FIRST element of the column, above the page's own h1, on a page
 * whose translation is stale or missing and which therefore shows the English.
 *
 * `--el-tint-yellow` fill with `--el-text-strong` ink (the tint-background +
 * strong-ink recipe, AA by construction), `--radius-card`, a clock glyph. The
 * text is in the PAGE's language, so it carries no `lang`; the English body
 * beneath it does (`DocsDocument`). It is not a live region: it is page state,
 * not an announcement.
 */
export function TranslationUpdatingNote({ text }: { text: string }) {
  return (
    <div
      role="note"
      className="mb-6 flex max-w-[68ch] items-start gap-2.5 rounded-(--radius-card) bg-(--el-tint-yellow) px-[calc(var(--spacing-control-x)*1.5)] py-[calc(var(--spacing-control-y)*2)] text-[13.5px] leading-[1.55] text-(--el-text-strong)"
    >
      <Clock aria-hidden="true" className="mt-0.5 size-4 flex-none" />
      <p className="min-w-0 [overflow-wrap:break-word] hyphens-auto">{text}</p>
    </div>
  )
}
