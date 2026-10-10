import type { Locale } from '@/i18n/routing'
import { formatDocsDate } from '@/lib/docsDocuments'

/*
 * Values the guide pages hand to their documents (MOTIR-8036).
 *
 * A date reaches a document as a `{{value:…}}`, never as prose, and is formatted
 * for the page's locale. `en` formats as `en-GB` ("6 October 2026"), which is how
 * these guides have always written a date and how `lib/publicProject.ts` writes
 * one; every other locale formats as itself, so a German page reads
 * "6. Oktober 2026".
 */
export function guideDate(locale: Locale, isoDate: string): string {
  return formatDocsDate(locale === 'en' ? ('en-GB' as Locale) : locale, isoDate)
}

/** The labels `docs.guideLabels` carries, as a page reads them. */
export interface GuideLabels {
  captionInClaudeCode: string
  captionCopySkillsOnly: string
  captionInTerminal: string
  copyClaudeCodePlugin: string
  copyClaudeCodeCopy: string
  copyClaudeCodeUpdate: string
  copyCodex: string
  copyCursor: string
  copyGeminiCli: string
  copyCopilot: string
  copyOpenCode: string
}

/**
 * The caption and copy-button name of each `lib/skillsGuide.ts` install pane,
 * by pane id. A pane's payload is TypeScript and identical in every language;
 * these two strings are what a reader reads, so they come from the catalogue.
 * The skills guide and the plugin guide share them, so a pane is labelled the
 * same on both.
 */
export function skillBlockLabels(
  labels: GuideLabels,
): Record<string, { caption: string; copyLabel: string }> {
  return {
    'claude-code-plugin': {
      caption: labels.captionInClaudeCode,
      copyLabel: labels.copyClaudeCodePlugin,
    },
    'claude-code-copy': {
      caption: labels.captionCopySkillsOnly,
      copyLabel: labels.copyClaudeCodeCopy,
    },
    codex: {
      caption: labels.captionInTerminal,
      copyLabel: labels.copyCodex,
    },
    cursor: {
      caption: labels.captionInTerminal,
      copyLabel: labels.copyCursor,
    },
    'gemini-cli': {
      caption: labels.captionInTerminal,
      copyLabel: labels.copyGeminiCli,
    },
    'copilot-vs-code': {
      caption: labels.captionInTerminal,
      copyLabel: labels.copyCopilot,
    },
    opencode: {
      caption: labels.captionInTerminal,
      copyLabel: labels.copyOpenCode,
    },
    update: {
      caption: labels.captionInClaudeCode,
      copyLabel: labels.copyClaudeCodeUpdate,
    },
  }
}
