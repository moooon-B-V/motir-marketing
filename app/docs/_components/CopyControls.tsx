'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * THE COPY AFFORDANCE (MOTIR-4977) — built to `design/docs/design-notes.md`
 * § "The copy affordance — three states, and the failure is the point", drawn
 * in `design/docs/sandbox-steps.png` panel 2.
 *
 * ⚠️ WHY THIS IS ITS OWN CLIENT COMPONENT AND `CodeBlock` IS NOT.
 * The clipboard needs an event handler, and an event handler needs a client
 * boundary — but `CodeBlock` is rendered by five server-rendered `/docs` pages
 * that pass it nothing but strings. Marking `CodeBlock` `'use client'` would
 * drag the pane, its caption and every caller's subtree across the boundary to
 * buy one button. The boundary is drawn at the smallest thing that needs it:
 * this file. `CodeBlock` stays a server component and renders this in its
 * caption bar.
 *
 * ── The three states, and why FAILED does not time out ─────────────────────
 * `navigator.clipboard.writeText` is REFUSED in an insecure context, on a
 * denied permission, or when the browser did not see a gesture it trusts. The
 * design's argument for the failed state is that a silent no-op is worse than
 * no button at all: the reader believes they hold the command and pastes
 * whatever was in the clipboard before, then debugs a command they never
 * copied.
 *
 * So COPIED reverts after 1600 ms and FAILED does not revert at all. A notice
 * that has gone by the time the reader looks up is the exact failure the state
 * exists to prevent, and a timer is what would make it go. Failed clears on the
 * next successful copy, or when focus leaves the pane — nothing else clears it.
 *
 * ⚠️ THE STATE IS NEVER CARRIED BY COLOUR ALONE. The LABEL changes in all
 * three, which is what a reader who cannot separate mint from peach reads. The
 * tints are reinforcement.
 */

/** How long the confirmation holds before reverting to idle. The design's number. */
export const COPIED_MS = 1600

/** The three states, in the design's own words. Exported so the tests cannot drift from the UI. */
export const COPY_LABELS = {
  idle: 'Copy',
  copied: 'Copied',
  failed: 'Copy failed',
} as const

/**
 * The failure note, verbatim from the design notes. It tells the reader what to
 * do INSTEAD, which is the only thing that makes the failed state useful:
 * "select the text" is an instruction, "copy failed" alone is an apology.
 */
export const COPY_FAILED_NOTE =
  'Couldn’t reach the clipboard — select the text and copy it by hand.'

type CopyState = keyof typeof COPY_LABELS

/**
 * The accessible name. Two panes on one page must never announce identically —
 * `/docs/sandbox` alone renders seven, and "Copy" seven times tells a
 * screen-reader user nothing about which block they are on.
 */
export function copyButtonLabel(caption: string): string {
  return `Copy the ${caption} command`
}

/**
 * The pane's caption ROW and its failure note.
 *
 * ⚠️ IT OWNS BOTH, and that is why the boundary is here rather than around the
 * button alone. The failure note renders BETWEEN the caption bar and the
 * `<pre>` — it is a block of prose in the pane's own box, which a `<button>`
 * may not contain — so the note and the button share one piece of state and
 * therefore one component. `CodeBlock` renders this and the `<pre>`, and stays
 * a server component.
 */
export function CopyControls({
  caption,
  code,
}: {
  caption: string
  code: string
}) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear the pending revert on unmount so a navigation mid-confirmation cannot
  // set state on a gone component.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const move = (next: CopyState) => setState(next)

  async function onCopy() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    try {
      // `navigator.clipboard` is absent entirely in an insecure context, so the
      // optional chain is the guard — reading `.writeText` off `undefined`
      // would throw a TypeError the catch would report as a refusal, which is
      // the right OUTCOME by luck rather than by design.
      const write = navigator.clipboard?.writeText
      if (!write) throw new Error('clipboard unavailable')
      await write.call(navigator.clipboard, code)
      move('copied')
      // ⚠️ ONLY the copied state gets a timer. Failed has none, deliberately.
      timer.current = setTimeout(() => move('idle'), COPIED_MS)
    } catch {
      move('failed')
    }
  }

  return (
    <>
      <p className="flex items-center justify-between gap-2.5 border-b border-(--el-border) bg-(--el-surface) px-3 py-1.5 font-(family-name:--font-mono) text-[11px] tracking-wide text-(--el-text-secondary) uppercase">
        <span>{caption}</span>
        {button()}
      </p>
      {state === 'failed' ? (
        <p className="m-0 border-b border-(--el-border) bg-(--el-tint-peach) px-3 py-1.5 text-[12px] leading-snug text-(--el-text-strong) normal-case">
          {COPY_FAILED_NOTE}
        </p>
      ) : null}
    </>
  )

  function button() {
    return (
      <button
        type="button"
        onClick={onCopy}
        // Failure clears when the reader leaves the pane — they have moved on,
        // and a stale warning on a block they are no longer reading is noise.
        onBlur={() => {
          if (state === 'failed') move('idle')
        }}
        aria-label={copyButtonLabel(caption)}
        data-state={state}
        className={`inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-(--radius-control) border px-2 py-0.5 text-[11px] font-semibold tracking-wide normal-case outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--el-accent) ${
          state === 'copied'
            ? 'border-(--el-tint-mint) bg-(--el-tint-mint) text-(--el-text-strong)'
            : state === 'failed'
              ? 'border-(--el-tint-peach) bg-(--el-tint-peach) text-(--el-text-strong)'
              : 'border-(--el-border) bg-(--el-page-bg) text-(--el-text-secondary) hover:bg-(--el-muted) hover:text-(--el-text)'
        }`}
      >
        <CopyGlyph state={state} />
        {COPY_LABELS[state]}
      </button>
    )
  }
}

/** The glyph follows the label rather than replacing it — reinforcement, never the signal. */
function CopyGlyph({ state }: { state: CopyState }) {
  const common = {
    viewBox: '0 0 16 16',
    width: 12,
    height: 12,
    fill: 'none',
    stroke: 'currentColor',
    'aria-hidden': true,
    className: 'flex-none',
  } as const
  if (state === 'copied')
    return (
      <svg {...common} strokeWidth={1.9}>
        <path d="M3 8.4 6.4 11.8 13 5.2" />
      </svg>
    )
  if (state === 'failed')
    return (
      <svg {...common} strokeWidth={1.5}>
        <path d="M8 2.6 14.4 13.4H1.6z" />
        <path d="M8 6.6v3.1" />
        <path d="M8 11.8h.01" strokeWidth={2} />
      </svg>
    )
  return (
    <svg {...common} strokeWidth={1.4}>
      <rect x="5.2" y="5.2" width="8" height="8" rx="1.6" />
      <path d="M10.8 5.2V3.6A1.6 1.6 0 0 0 9.2 2H3.6A1.6 1.6 0 0 0 2 3.6v5.6a1.6 1.6 0 0 0 1.6 1.6h1.6" />
    </svg>
  )
}
