import type { ReactNode } from 'react'
import type { Locale } from '@/i18n/routing'

/*
 * The seven skill names, joined the way the reader's language joins a list, each
 * in its own `<code>` (MOTIR-8036). A node, not a string: a document places it
 * with `{{value:releaseSkills}}`, outside backticks. The conjunction ("and") is
 * the locale's own (`Intl.ListFormat`), so no English word sits in the TSX and
 * no translation has to restate the list. `en` formats as `en-GB`, which writes
 * "a, b and c" as these guides always did.
 */
export function skillList(locale: Locale, names: readonly string[]): ReactNode {
  const parts = new Intl.ListFormat(locale === 'en' ? 'en-GB' : locale, {
    style: 'long',
    type: 'conjunction',
  }).formatToParts(names)
  return parts.map((part, index) =>
    part.type === 'element' ? (
      <code
        key={index}
        className="font-(family-name:--font-mono) text-[0.92em] whitespace-nowrap"
      >
        {part.value}
      </code>
    ) : (
      part.value
    ),
  )
}
