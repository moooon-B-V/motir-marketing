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
 * Two looks: `button`, a real button for a page; `row`, a quiet row for the
 * Products menu's Tooling column. Both say what happened — Copied, or that the
 * clipboard was out of reach — and `aria-live` reads it out.
 */

const COPIED_MS = 2200

export function SetupPromptButton({
  look = 'button',
  className,
}: Readonly<{ look?: 'button' | 'row'; className?: string }>) {
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
    state === 'copied'
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

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className={cn(
        look === 'button'
          ? buttonVariants({ size: 'md' })
          : 'flex w-full items-center gap-2 rounded-(--radius-control) px-(--spacing-control-x) py-(--spacing-control-y) text-left text-[13.5px] font-medium text-(--el-accent-on-surface) hover:bg-(--el-surface-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </button>
  )
}
