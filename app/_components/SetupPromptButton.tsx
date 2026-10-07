'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ClipboardCopy, TriangleAlert } from 'lucide-react'
import { buttonVariants, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { setupPrompt } from '@/lib/setupPrompt'

/*
 * Copies THE SETUP PROMPT (`lib/setupPrompt.ts`): one block a visitor pastes
 * into any agent to set Motir up there — the plugin in Claude Code, the MCP
 * server, the CLI and the skills anywhere else (2026-10 redesign).
 *
 * Three looks: `button`, a real button for a page; `row`, a callout for the
 * Products menu's Tooling column; `header`, the top bar's compact one. Both say what happened — Copied, or that the
 * clipboard was out of reach — and `aria-live` reads it out.
 */

const COPIED_MS = 2200

export function SetupPromptButton({
  look = 'button',
  className,
}: Readonly<{ look?: 'button' | 'row' | 'header'; className?: string }>) {
  const s = copy.setupPrompt
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function onCopy() {
    if (timer.current) clearTimeout(timer.current)
    try {
      const write = navigator.clipboard?.writeText
      if (!write) throw new Error('clipboard unavailable')
      await write.call(navigator.clipboard, setupPrompt())
      setState('copied')
      timer.current = setTimeout(() => setState('idle'), COPIED_MS)
    } catch {
      setState('failed')
    }
  }

  const label =
    look === 'header'
      ? state === 'copied'
        ? s.headerCopied
        : state === 'failed'
          ? s.headerFailed
          : s.headerLabel
      : state === 'copied'
        ? s.copied
        : state === 'failed'
          ? s.failed
          : look === 'row'
            ? s.menuLabel
            : s.button
  const Icon =
    state === 'copied'
      ? Check
      : state === 'failed'
        ? TriangleAlert
        : ClipboardCopy

  if (look === 'header') {
    // The top bar's own copy: the same callout tint and border as the menu's
    // row, at the bar's button height, so it reads as an action beside the
    // nav links without competing with Start free's fill.
    return (
      <button
        type="button"
        onClick={onCopy}
        aria-live="polite"
        data-setup-prompt=""
        className={cn(
          'inline-flex h-(--height-btn-md) items-center gap-2 rounded-(--radius-btn) border border-(--el-accent-on-surface) bg-(--el-tint-sky) px-(--spacing-btn-x) text-[15px] font-medium whitespace-nowrap text-(--el-text-strong) hover:shadow-(--shadow-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)',
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {label}
      </button>
    )
  }

  if (look === 'row') {
    // The menu's one action among links, so it stands out as a callout: a
    // tinted, bordered block with a filled icon tile and a line saying what
    // the prompt does. Ink is `--el-text-strong`, the AA ink on a tint.
    return (
      <button
        type="button"
        onClick={onCopy}
        aria-live="polite"
        data-setup-prompt=""
        className={cn(
          'group flex w-full items-center gap-3 rounded-(--radius-card) border border-(--el-accent-on-surface) bg-(--el-tint-sky) px-(--spacing-control-x) py-2.5 text-left text-(--el-text-strong) shadow-(--shadow-subtle) transition-transform hover:-translate-y-px hover:shadow-(--shadow-card) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface) motion-reduce:transition-none motion-reduce:hover:translate-y-0',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-(--radius-control) bg-(--el-accent) text-(--el-accent-text)"
        >
          <Icon className="size-4" />
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span className="text-[14px] leading-tight font-semibold">
            {label}
          </span>
          <span className="text-[12px] leading-snug">{s.menuHint}</span>
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className={cn(buttonVariants({ size: 'md' }), className)}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </button>
  )
}
