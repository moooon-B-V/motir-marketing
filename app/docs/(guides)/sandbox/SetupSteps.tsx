'use client'

import { useState } from 'react'
import { CodeBlock } from '../../_components/DocSchema'
import {
  SANDBOX_PICKER_OPTIONS,
  SANDBOX_PROFILES,
  type SandboxOption,
  findProfile,
  sandboxDevcontainerJson,
  sandboxDevcontainerWriteCommand,
  sandboxPullCommand,
  sandboxRunCommand,
} from '@/lib/sandboxProfiles'

/*
 * THE STEPPED SETUP SEQUENCE (MOTIR-4993) — built to
 * `design/docs/design-notes.md` § `sandbox-steps.*`, drawn in
 * `design/docs/sandbox-steps.png`.
 *
 * ── Why the page's spine is a STEP and not a heading ───────────────────────
 * The guide used to be ten `<h2>` prose sections with seven code panes
 * scattered through them, and the paragraphs around each pane carried
 * instructions of their own — so a reader had to decide, sentence by sentence,
 * which text was a thing to do. A step is a ROW: a number in its own gutter,
 * then the body. Counted headings read as an article whose sections happen to
 * be numbered; a number in a gutter reads as a procedure before a word is
 * read. `Set it up` is ONE `<ol>`, so a screen reader announces "list, 5
 * items" before the first one.
 *
 * ── ⚠️ Why the PICKER exists, and why it is not a step ─────────────────────
 * The guide serves EIGHT agents and used to show one, with a paragraph after
 * the command telling the other seven to swap the tag and the `-v` line. That
 * worked while a reader was hand-selecting a multi-line command and going
 * slowly. A copy button removes exactly that reader: the whole point of the
 * affordance is that they stop reading and start doing. So the swap becomes a
 * CONTROL — seven readers in eight would otherwise paste a command for an
 * agent they do not use, from a button that looks authoritative.
 *
 * It is NOT a step. Both step kinds are things the reader does OFF this page,
 * in a terminal or in an editor; picking an agent happens ON it, and admitting
 * a third kind would break the rule the sequence rests on. It sits above the
 * sequence because steps 1, 2 and 2b cannot be written until it is answered.
 *
 * ── The two step KINDS, and the route that MIXES them ──────────────────────
 * A command step carries one copyable pane; a UI-instruction step carries
 * none. They are told apart by TWO signals — a filled vs outlined number AND a
 * `Command` / `In your editor` chip — never one, because the fills alone would
 * fail a reader who cannot separate them and the chips alone would leave the
 * sequence looking uniform while scanning.
 *
 * ⚠️ The VS Code route MIXES kinds: `2a` UI, `2b` COMMAND, `2c` UI. `2b`
 * creates `.devcontainer/devcontainer.json`, and a reader cannot do that in a
 * file picker — Finder and most GUI pickers refuse a name beginning with a dot
 * without saying why. Its one paste makes the folder AND writes the file, and
 * ONE PASTE IS ONE STEP: had they needed two, the route would run to four.
 */

type StepKind = 'command' | 'ui'

const KIND_CHIP: Record<StepKind, string> = {
  command: 'Command',
  ui: 'In your editor',
}

function Step({
  kind,
  label,
  intent,
  children,
}: {
  kind: StepKind
  /** Overrides the ordinal — `2a`/`2b`/`2c` REPLACE step 2 rather than following it. */
  label?: string
  intent: string
  children?: React.ReactNode
}) {
  return (
    <li className="grid grid-cols-[30px_minmax(0,1fr)] gap-3.5 border-t border-(--el-border-soft) py-4 first:border-t-0 first:pt-1.5">
      <span
        aria-hidden
        className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-(--radius-badge) font-(family-name:--font-mono) text-[13px] font-bold ${
          kind === 'ui'
            ? 'border-[1.5px] border-(--el-border-strong) bg-(--el-page-bg) text-(--el-text-secondary)'
            : 'bg-(--el-muted) text-(--el-text)'
        }`}
      >
        {label ?? ''}
      </span>
      <div className="min-w-0">
        <p className="mt-1 flex flex-wrap items-baseline gap-2.5 text-[15px] leading-snug font-semibold text-(--el-text)">
          {intent}
          <span
            className={`rounded-(--radius-badge) px-(--spacing-chip-x) py-(--spacing-chip-y) text-[10px] font-semibold tracking-wide text-(--el-text-strong) uppercase ${
              kind === 'ui' ? 'bg-(--el-tint-lavender)' : 'bg-(--el-tint-sky)'
            }`}
          >
            {KIND_CHIP[kind]}
          </span>
        </p>
        {children}
      </div>
    </li>
  )
}

function Say({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
      {children}
    </p>
  )
}

/** A profile's own caveat on step 2 — three of the eight have one. */
function ProfileNote({ note }: { note?: string }) {
  if (!note) return null
  return (
    <p className="mt-2.5 rounded-(--radius-control) bg-(--el-tint-yellow) px-2.5 py-2 text-[12.5px] leading-snug text-(--el-text-strong)">
      {note}
    </p>
  )
}

export function SetupSteps() {
  const [profileId, setProfileId] = useState(SANDBOX_PROFILES[0]!.id)
  const profile = findProfile(profileId)

  return (
    <>
      {/* ── THE PROFILE PICKER — a control, not a step ────────────────── */}
      <div className="mt-6 max-w-[68ch] rounded-(--radius-card) border border-(--el-border) bg-(--el-surface-soft) px-4.5 py-4">
        <p className="mb-2.5 text-[14px] font-semibold text-(--el-text)">
          Which agent do you use?
        </p>
        <div
          role="radiogroup"
          aria-label="Agent profile"
          className="flex flex-wrap items-center gap-1.5"
        >
          {SANDBOX_PICKER_OPTIONS.map((option, index) => (
            <Chip
              key={option.id}
              option={option}
              selected={option.id === profileId}
              onSelect={() => setProfileId(option.id)}
              /* The tier break and the `or` are LABELS, not controls: both
                 groups are published and built, and a reader choosing an agent
                 is not choosing a tier. */
              before={
                index === SANDBOX_PROFILES.findIndex((p) => p.tier === 2)
                  ? 'also supported'
                  : option.id === 'base'
                    ? 'or'
                    : undefined
              }
            />
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-snug text-(--el-text-secondary)">
          Every command below is for{' '}
          <b className="text-(--el-text)">{profile.label}</b>. Switching
          rewrites the tag and the credential mount in{' '}
          <b className="text-(--el-text)">steps 1, 2 and 2b</b> — the three
          places they appear.
        </p>
      </div>

      <h2 className="mt-7 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        Set it up
      </h2>
      <Say>Five steps. Each one is a single thing to do.</Say>

      <ol className="mt-5 max-w-[68ch] list-none p-0">
        <Step kind="command" label="1" intent="Pull the image for your agent">
          <Say>
            There is no build step — the image is published per agent profile.
          </Say>
          <div className="mt-2.5">
            <CodeBlock caption="pull" code={sandboxPullCommand(profile.id)} />
          </div>
        </Step>

        <Step
          kind="command"
          label="2"
          intent="Start the container from your workspace root"
        >
          <Say>
            Run it from the folder that <b>contains</b> your checkouts, not from
            any one of them.
          </Say>
          <div className="mt-2.5">
            <CodeBlock caption="run" code={sandboxRunCommand(profile.id)} />
          </div>
          <ProfileNote note={profile.note} />
          <div className="mt-2.5 border-l-2 border-(--el-border-strong) py-0.5 pl-3">
            <p className="text-[13px] text-(--el-text-secondary)">
              <b className="text-(--el-text)">Using VS Code instead?</b> Steps
              2a–2c below replace this one. Everything after is the same either
              way.
            </p>
          </div>
        </Step>

        <Step
          kind="ui"
          label="2a"
          intent="Install the Dev Containers extension"
        >
          <Say>
            From the Extensions view, or the command palette — ⇧⌘P on macOS,
            Ctrl+Shift+P elsewhere, F1 on all three — then{' '}
            <em>Extensions: Install Extensions</em>. Two of these three steps
            happen in the palette, so it is worth pinning now.
          </Say>
        </Step>

        <Step
          kind="command"
          label="2b"
          intent="Create the dev container config"
        >
          <Say>
            Run this in the folder you are mounting. One paste: it makes the{' '}
            <code className="font-(family-name:--font-mono)">
              .devcontainer
            </code>{' '}
            folder and writes the file into it. Do not try to create them from a
            file picker — Finder and most GUI pickers refuse a name beginning
            with a dot, and refuse it without saying why.
          </Say>
          <div className="mt-2.5">
            <CodeBlock
              caption="your machine — in the folder you are mounting"
              copyLabel="Copy the dev container config command"
              code={sandboxDevcontainerWriteCommand(profile.id)}
            />
          </div>
        </Step>

        <Step kind="ui" label="2c" intent="Open the folder in the container">
          <Say>
            Command palette → <em>Dev Containers: Open Folder in Container…</em>
            , and pick the folder you just wrote the file into. Its terminal is
            the same shell step 2 would have dropped you into — carry on at step
            3.
          </Say>
        </Step>

        <Step kind="command" label="3" intent="Sign in, inside the container">
          <Say>
            A code and a URL are printed; approve it in any browser. The sign-in
            lands on the{' '}
            <code className="font-(family-name:--font-mono)">motir-auth</code>{' '}
            volume, so you do this once.
          </Say>
          <div className="mt-2.5">
            <CodeBlock
              caption="in the container"
              copyLabel="Copy the sign-in command"
              code="motir login"
            />
          </div>
        </Step>

        <Step kind="command" label="4" intent="Link the folder to your project">
          <Say>
            Swap <code className="font-(family-name:--font-mono)">ACME</code>{' '}
            for your project key. If your workspace has exactly one project,
            drop the flag — that is the whole step.
          </Say>
          <div className="mt-2.5">
            <CodeBlock
              caption="in the container"
              copyLabel="Copy the link command"
              code="motir link --project ACME"
            />
          </div>
        </Step>

        <Step
          kind="command"
          label="5"
          intent="Check it — all green is the end of this page"
        >
          <Say>
            Auth, link, the agent binary and its credential. This is the only
            thing that tells you the container actually got what you passed it.
          </Say>
          <div className="mt-2.5">
            <CodeBlock
              caption="in the container"
              copyLabel="Copy the check command"
              code="motir doctor"
            />
          </div>
        </Step>
      </ol>

      {/* ⚠️ THE LISTING LIVES HERE, NOT ON THE PAGE, AND THAT IS LOAD-BEARING.
          It shows the same config as 2b's heredoc under a second caption, and
          `tests/docs/sandbox.test.tsx` asserts the heredoc CONTAINS it — two
          typed copies is a `mounts` entry corrected in one and published wrong
          in the other.

          Drafted on the page it agreed with the heredoc only by coincidence of
          the DEFAULT profile: pick OpenCode and the heredoc gains a second
          mount while a page-level constant does not, and the test — which only
          ever renders the default — would have stayed green over a page showing
          two different configs. Both blocks read the same
          `sandboxDevcontainerJson(profile.id)` now, so they cannot disagree for
          any profile. */}
      <h3 className="mt-8 text-[15px] font-semibold text-(--el-text)">
        The file that command writes
      </h3>
      <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        Reference, not a step — 2b already wrote it. It is here for the reader
        who would rather create the file by hand, and because the quotes around{' '}
        <code className="font-(family-name:--font-mono)">&lt;&lt;’JSON’</code>{' '}
        are load-bearing: they stop your shell expanding{' '}
        <code className="font-(family-name:--font-mono)">
          ${'{'}localWorkspaceFolder{'}'}
        </code>{' '}
        and{' '}
        <code className="font-(family-name:--font-mono)">
          ${'{'}localEnv:HOME{'}'}
        </code>{' '}
        before they reach the file. Those are Dev Containers substitutions and
        the editor is what resolves them.
      </p>
      <div className="mt-3">
        <CodeBlock
          caption=".devcontainer/devcontainer.json"
          code={sandboxDevcontainerJson(profile.id)}
        />
      </div>
    </>
  )
}

function Chip({
  option,
  selected,
  onSelect,
  before,
}: {
  option: SandboxOption
  selected: boolean
  onSelect: () => void
  before?: string
}) {
  return (
    <>
      {before ? (
        <span className="ml-1 text-[11px] font-medium tracking-wide text-(--el-text-secondary)">
          {before}
        </span>
      ) : null}
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className={`inline-flex min-h-[30px] cursor-pointer items-center rounded-(--radius-badge) border px-(--spacing-control-x) text-[13px] outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--el-accent) ${
          selected
            ? 'border-(--el-accent) bg-(--el-accent) font-semibold text-(--el-accent-text)'
            : 'border-(--el-border) bg-(--el-page-bg) font-medium text-(--el-text-secondary) hover:bg-(--el-muted) hover:text-(--el-text)'
        }`}
      >
        {option.label}
      </button>
    </>
  )
}
