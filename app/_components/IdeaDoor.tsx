'use client'

import { useId, useRef, useState } from 'react'
import { ArrowRight, CircleAlert, LoaderCircle, Sparkles } from 'lucide-react'
import { Button } from '@motir/design-system'
import { copy, format } from '@/lib/copy'
import { DoorFoot, DoorHead, DoorLabel } from './DoorCard'
import { SIGN_UP } from '@/lib/destinations'
import { MAX_IDEA_LENGTH, handOffIdea } from '@/lib/ideaHandoff'

/*
 * DOOR 1 — "Start something new". The idea box and ALL FOUR of the states the
 * design asset's Panel 3 draws: empty (rest), typing, submitting, and
 * submit-failed.
 *
 * ⚠️ THE FAILURE STATE IS NOT OPTIONAL POLISH. This submit is a cross-origin
 * POST between two Fly apps and it can fail for reasons that have nothing to
 * do with the visitor — CORS, a cold machine, a network blip — at the exact
 * instant a first-time visitor has typed the most valuable thing they will
 * type all session. A hero that draws only the happy path leaves that moment
 * to be improvised. The typed idea is NEVER cleared, and the banner says so.
 */

type Status = 'idle' | 'submitting' | 'failed'

export function IdeaDoor() {
  const fieldId = useId()
  const [idea, setIdea] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  // The counter is PRESENT from first paint and merely invisible, so revealing
  // it on the first keystroke never reflows the footer row.
  const [touched, setTouched] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submitting = status === 'submitting'

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return
    setStatus('submitting')

    const result = await handOffIdea(idea)
    if (result.ok) {
      // A full navigation, not a router push: the destination is a different
      // ORIGIN, and the browser has to make the request for the cookie the
      // receiver plants to land there.
      window.location.assign(result.href)
      return
    }
    setStatus('failed')
    textareaRef.current?.focus()
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col">
      {/* The head, the label and the footer row come from the SHARED door
          primitives, not from local copies — co-equality with door 2 is a
          per-attribute promise, and two hand-kept-in-agreement heads is
          exactly how it erodes. */}
      <DoorHead
        tint="lavender"
        icon={<Sparkles className="size-[19px]" />}
        title={copy.landing.doors.new.title}
        description={copy.landing.doors.new.description}
      />
      {/* A real `<label for>`, never a placeholder standing in for one — the
          placeholder is a worked example and it disappears the moment somebody
          types. */}
      <DoorLabel htmlFor={fieldId}>{copy.landing.hero.ideaLabel}</DoorLabel>
      <textarea
        ref={textareaRef}
        id={fieldId}
        rows={7}
        // The browser enforces the same bound the server will. motir-core's
        // `normalizePendingIdea()` TRUNCATES past 2000 rather than rejecting,
        // so a visitor who pastes 4,000 characters loses half of them silently
        // somewhere after sign-in unless the cap bites HERE, visibly.
        maxLength={MAX_IDEA_LENGTH}
        // Submit stays ENABLED on an empty box — it is a head-start, not a
        // gate, which is the call the /onboarding entrance already made.
        autoFocus
        disabled={submitting}
        value={idea}
        onChange={(event) => {
          setIdea(event.target.value)
          setTouched(true)
        }}
        placeholder={copy.landing.hero.placeholder}
        className="min-h-[148px] w-full flex-1 resize-none border-0 bg-transparent text-[15px] leading-[1.55] text-(--el-text) outline-none placeholder:text-(--el-text-muted) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface) disabled:opacity-70"
      />

      {status === 'failed' ? <SubmitFailed /> : null}

      <DoorFoot>
        <span
          className="font-(family-name:--font-mono) text-[12px] font-medium text-(--el-text-muted)"
          // Present but invisible until the first keystroke — `visibility`,
          // never `display`, so the row's height never changes.
          style={touched ? undefined : { visibility: 'hidden' }}
        >
          {format(copy.landing.hero.counter, {
            count: idea.length,
            max: MAX_IDEA_LENGTH,
          })}
        </span>
        {/*
         * ⚠️ THE ICONS GO IN `leftIcon` / `rightIcon`, NOT IN `children` —
         * which is what the design asset's primitive table specifies
         * (`Button variant="primary" rightIcon={<ArrowRight/>}`) and what
         * rendering the page proved is load-bearing. `Button` wraps its
         * children in a plain `<span>`, so an icon passed as a child becomes
         * an inline element inside a text flow and drops onto its own line;
         * the icon SLOTS are flex siblings and cannot.
         *
         * ⚠️ AND NOT `loading` EITHER, for the reduced-motion reason. The
         * `loading` prop substitutes the design system's own `Spinner`, whose
         * `animate-spin` carries NO `prefers-reduced-motion` arm — and in this
         * page the spinner is the only animation, which the asset requires to
         * stop. So the disabled + busy state is set explicitly and the glyph
         * is ours, carrying the `.motir-spin` class globals.css guards. (That
         * gap in the shared package is filed, not absorbed — see the pull
         * request.)
         */}
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
          {/* The LABEL changes, not only the glyph. Under
              `prefers-reduced-motion` the spinner does not turn, so the word is
              the whole of the signal — which is why this is not optional. */}
          {submitting ? copy.landing.hero.ctaSubmitting : copy.landing.hero.cta}
        </Button>
      </DoorFoot>

      {/* A polite live region, so a screen-reader user is told the submit is
          under way rather than meeting a silently disabled control. */}
      <span aria-live="polite" className="sr-only">
        {submitting ? copy.landing.hero.statusSubmitting : ''}
      </span>
    </form>
  )
}

function SubmitFailed() {
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-2.5 rounded-(--radius-input) border border-(--el-danger) bg-(--el-danger-surface) px-3 py-2.5 text-[13px] leading-normal text-(--el-danger-on-surface)"
    >
      {/* An icon AND a sentence as well as the red edge — no state on this page
          is carried by colour alone. */}
      <CircleAlert aria-hidden="true" className="mt-px size-4 flex-none" />
      <span>
        <strong>{copy.landing.hero.errorTitle}</strong>{' '}
        {copy.landing.hero.errorBody}
        {/* `flex`, not `inline-flex`: the two exits take their own line under
            the sentence rather than trailing it, which is how Panel 3's state
            D draws them and what keeps them scannable as EXITS rather than as
            more prose. */}
        <span className="mt-2 flex gap-3.5">
          {/* Two exits, so the visitor is never stranded on a dead button:
              retry the hand-off, or continue into Motir without it. */}
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
