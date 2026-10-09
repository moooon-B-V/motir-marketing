'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowRight, CircleAlert, LoaderCircle } from 'lucide-react'
import { Button, cn } from '@motir/design-system'
import { useCopy } from '@/lib/copy'
import { SIGN_UP } from '@/lib/destinations'
import { MAX_IDEA_LENGTH, handOffIdea } from '@/lib/ideaHandoff'

/*
 * The hero's brief: one textarea, one button (2026-10 redesign).
 *
 * It replaces the old two-door fork. Starting something new is the hero; a
 * project you already have goes through Motir Project Manager's section just
 * below. The hand-off itself is unchanged — `handOffIdea` saves the idea as a
 * draft on motir-core and the visitor continues to sign-in carrying it — and so
 * are its three states: idle, submitting (the LABEL changes, not only the
 * glyph, because a reduced-motion spinner does not turn), and failed (nothing
 * typed is lost, with two exits: try again, or continue without the draft).
 *
 * The box carries `id="hero-brief"`: the wave lines behind the hero gather
 * towards it.
 *
 * Given `examples` (the landing passes the titles of live ideas from the
 * ideas store), the empty box types them in one after another, as if someone
 * were writing them. The typing is a picture, not the placeholder: it is drawn
 * over the field `aria-hidden`, while the real placeholder stays in the
 * attribute for screen readers and is only made transparent. It stops the
 * moment the box is focused or holds text, and under `prefers-reduced-motion`
 * it never starts — the static placeholder shows instead. Once the box is
 * focused the placeholder is not shown either: the typed ideas already made the
 * suggestion, and a focused box is for the visitor's own words.
 */

type Status = 'idle' | 'submitting' | 'failed'

/**
 * `placeholder` replaces the landing's example idea on a page that wants its
 * own; `examples`, when non-empty, are typed into the empty box in turn.
 */
export function HeroBrief({
  placeholder: placeholderProp,
  examples = [],
}: Readonly<{ placeholder?: string; examples?: readonly string[] }> = {}) {
  const copy = useCopy()
  const placeholder = placeholderProp ?? copy.landing.hero.placeholder
  const fieldId = useId()
  const [idea, setIdea] = useState('')
  const [focused, setFocused] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submitting = status === 'submitting'
  const typed = useTypedExample(examples, idea === '' && !focused)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setStatus('submitting')
    const result = await handOffIdea(idea)
    if (result.ok) {
      window.location.assign(result.href)
      return
    }
    setStatus('failed')
    textareaRef.current?.focus()
  }

  return (
    <form
      id="hero-brief"
      onSubmit={onSubmit}
      data-surface="card"
      className="grid w-full max-w-[700px] gap-2.5 rounded-(--radius-card) border border-(--el-border) bg-(--el-card) p-(--spacing-card-padding) text-left shadow-(--shadow-elevated)"
    >
      <label
        htmlFor={fieldId}
        className="font-(family-name:--font-mono) text-[11px] font-medium tracking-[0.1em] text-(--el-text-secondary) uppercase"
      >
        {copy.landing.hero.ideaLabel}
      </label>
      <div className="relative grid">
        <textarea
          ref={textareaRef}
          id={fieldId}
          rows={3}
          maxLength={MAX_IDEA_LENGTH}
          disabled={submitting}
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            'min-h-[92px] w-full resize-y border-0 bg-transparent p-0 text-[18px] leading-normal text-(--el-text) outline-none placeholder:text-(--el-text-muted) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--el-accent-on-surface) disabled:opacity-70 sm:text-[19px]',
            (typed !== null || (focused && examples.length > 0)) &&
              'placeholder:text-transparent',
          )}
        />
        {typed !== null ? (
          <span
            aria-hidden="true"
            data-testid="hero-brief-typed"
            className="pointer-events-none absolute inset-0 overflow-hidden text-[18px] leading-normal break-words whitespace-pre-wrap text-(--el-text-muted) sm:text-[19px]"
          >
            {typed}
            <span className="mk-caret ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-(--el-accent-on-surface)" />
          </span>
        ) : null}
      </div>

      {status === 'failed' ? <SubmitFailed /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <span className="mr-auto text-[13px] text-(--el-text-secondary)">
          {copy.landing.hero.hint}
        </span>
        <Button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          className="whitespace-nowrap"
          leftIcon={
            submitting ? (
              <LoaderCircle className="motir-spin size-4" />
            ) : undefined
          }
          rightIcon={submitting ? undefined : <ArrowRight className="size-4" />}
        >
          {submitting ? copy.landing.hero.ctaSubmitting : copy.landing.hero.cta}
        </Button>
      </div>

      <span aria-live="polite" className="sr-only">
        {submitting ? copy.landing.hero.statusSubmitting : ''}
      </span>
    </form>
  )
}

const TYPE_MS = 55
const ERASE_MS = 22
const HOLD_MS = 2200
const GAP_MS = 450

/**
 * The text typed so far, or `null` while nothing is being typed — no examples,
 * reduced motion, or `running` false (the box is focused or holds text), and
 * on the server, so the first paint is the plain placeholder. Each example is
 * typed a character at a time, held, erased, and the next one begins. The
 * order is random: the list is shuffled, every idea shows once, then it is
 * shuffled again — never repeating the idea just shown.
 */
function useTypedExample(
  examples: readonly string[],
  running: boolean,
): string | null {
  const [text, setText] = useState<string | null>(null)
  const key = examples.join('\n')

  useEffect(() => {
    const list = key ? key.split('\n') : []
    const still = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (!running || list.length === 0 || still) return
    let order = shuffled(list)
    let index = 0
    let length = 0
    let erasing = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const target = order[index]
      if (!erasing) {
        length += 1
        setText(target.slice(0, length))
        if (length >= target.length) {
          erasing = true
          timer = setTimeout(tick, HOLD_MS)
          return
        }
        // A little unevenness, so it reads as a person and not a ticker.
        timer = setTimeout(tick, TYPE_MS + Math.random() * 60)
        return
      }
      length -= 1
      setText(target.slice(0, length))
      if (length <= 0) {
        erasing = false
        index += 1
        if (index >= order.length) {
          const last = order[order.length - 1]
          order = shuffled(list)
          // A new round never opens on the idea that closed the last one.
          if (order.length > 1 && order[0] === last) {
            ;[order[0], order[1]] = [order[1], order[0]]
          }
          index = 0
        }
        timer = setTimeout(tick, GAP_MS)
        return
      }
      timer = setTimeout(tick, ERASE_MS)
    }

    timer = setTimeout(tick, GAP_MS)
    return () => {
      clearTimeout(timer)
      setText(null)
    }
  }, [key, running])

  return running ? text : null
}

/** A Fisher–Yates shuffle into a new array. */
function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function SubmitFailed() {
  const copy = useCopy()
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-(--radius-input) border border-(--el-danger) bg-(--el-danger-surface) px-3 py-2.5 text-[13px] leading-normal text-(--el-danger-on-surface)"
    >
      <CircleAlert aria-hidden="true" className="mt-px size-4 flex-none" />
      <span>
        <strong>{copy.landing.hero.errorTitle}</strong>{' '}
        {copy.landing.hero.errorBody}
        <span className="mt-2 flex gap-3.5">
          <button
            type="submit"
            className="font-bold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
          >
            {copy.landing.hero.errorRetry}
          </button>
          <a
            href={SIGN_UP}
            className="font-bold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
          >
            {copy.landing.hero.errorFallback}
          </a>
        </span>
      </span>
    </div>
  )
}
