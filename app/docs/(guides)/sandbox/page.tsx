import Link from 'next/link'
import { copy } from '@/lib/copy'
import { CodeBlock } from '../../_components/DocSchema'
import { SetupSteps } from './SetupSteps'

/*
 * The sandbox guide (MOTIR-4046, WRITTEN by MOTIR-4392) — committed prose, per
 * `lib/docs.ts`'s carve-out: the guide / policy / MCP / CLI / sandbox pages are
 * AUTHORED documentation rather than a registry, which is why they are allowed
 * to live in this repository at all.
 *
 * ⚠️ WHAT THIS CARD FIXED. The page was two sentences, zero `<code>` and zero
 * `<pre>`. Both sentences were accurate and neither was actionable: a reader
 * finished the page knowing what a sandbox IS and with no way to cause one to
 * exist. A definition is not a guide.
 *
 * ── Every claim below was READ off motir-core at `origin/main`, not restated ─
 * The card said in terms not to trust its own summary of these, and it was right
 * to: its summary of the grant was WRONG.
 *
 *   · the image, its tags and the profile list — `lib/apiDocs/sandbox.ts`
 *     (`SANDBOX_IMAGE`, `SANDBOX_CONTAINER_NAME`, `sandboxProfileRows()` derived
 *     from the CLI's own `AGENT_PROFILES`); the `docker pull` / `docker run`
 *     lines are what `sandboxPullCommand` / `sandboxRunCommand` emit for the
 *     `claude` profile, verbatim.
 *   · every command and flag — `packages/cli/src/commandCatalog.ts`.
 *   · the grant — `lib/mcp/toolPermissions.ts`'s `CLI_TOKEN_GRANT`.
 *
 * ⚠️ THE CARD'S OWN GRANT LIST WAS FALSIFIED, and this page carries the shipped
 * one. MOTIR-4392 states the grant as four keys — `project:browse`,
 * `work_item:edit`, `comment:add`, `ai:plan`. The constant on `origin/main`
 * carries SIX: `lesson:view` and `lesson:reinforce` were added deliberately, by
 * MOTIR-3480 and MOTIR-3553, each with its argument written at the line. The
 * half of the card's claim that matters is unchanged and TRUE: `ai:view_plan` is
 * absent, which is why a sandboxed run can open a plan and is refused on its
 * first append.
 *
 * ── The boundary with `/docs/cli` ──────────────────────────────────────────
 * Commands are LINKED, never restated — one home per fact. This page owns the
 * environment a run executes inside; that page owns what you type.
 *
 * ── ⚠️ THREE SECTIONS RESTORED (MOTIR-4429) ────────────────────────────────
 * MOTIR-4397's parity ledger found three things the deleted `motir-core` page
 * at `95a2d4468^` (`lib/apiDocs/sandbox.ts`) carried and this one did not:
 *
 *  1. **What it confines — and what it does not.** The most important of the
 *     three, and the one nobody measured: the page opened by saying an agent
 *     "reaches your work tree and not the rest of your machine" while the
 *     original said in terms that the NETWORK is open by design. A confinement
 *     claim with its exception deleted is not a smaller claim, it is a
 *     different and false one — so this is a correction as much as a restore.
 *     `Network` and `unprivileged` both appeared ZERO times here.
 *  2. **Before you start.** The Docker prerequisite, the `linux/arm64` fact
 *     (Apple Silicon is native; nothing is emulated), the agent sign-in that
 *     must exist on the host, and the folder tree showing that you mount the
 *     directory CONTAINING your checkouts. The page had compressed the last of
 *     these to one clause and dropped the rest.
 *  3. **Or start it from VS Code instead.** `devcontainer` and `VS Code` both
 *     appeared ZERO times, and the page's closing paragraph listed the editor
 *     integrations as "not documented here yet" — a deletion recorded as a
 *     decision. It was neither: the original documented them.
 *
 * ⚠️ THE HEREDOC DELIMITER IS QUOTED — `<<'JSON'` — and that is load-bearing.
 * Unquoted, the shell expands `${localWorkspaceFolder}` and `${localEnv:HOME}`
 * to empty strings on the way into the file, and the reader gets a container
 * that mounts nothing and finds no credential: a silent failure strictly worse
 * than being stuck. `tests/docs/sandbox.test.tsx` greps for the quoted form
 * rather than trusting review, which is what the deleted module did too.
 *
 * ⚠️ THE `postStartCommand` LINE IS TRANSCRIBED, NOT INVENTED (MOTIR-4961).
 * `overrideCommand: true` makes Dev Containers replace the image's ENTRYPOINT
 * as well as its CMD, so this route ran none of the container's own setup and
 * an agent started here had no writable config directory to sign in to — the
 * `docker run` recipe on this same page worked and this one could not, while
 * the page offered them as equals (MOTIR-4956). The string is copied VERBATIM
 * from the recipe motir-core ships, read at `lib/apiDocs/sandbox.ts`'s
 * `SANDBOX_DEVCONTAINER_JSON`; it is deliberately not derived at build time,
 * for the same reason every other claim on this page is transcribed rather than
 * imported across a repository boundary. The `|| true` is part of the literal:
 * it keeps an older pinned `:<profile>-<version>` image, which has no such
 * command, starting rather than erroring.
 *
 * ⚠️ AND ONE OBJECT, TWO BLOCKS. The listing and the heredoc are built from
 * `DEVCONTAINER_JSON`, so a `mounts` entry corrected in one cannot publish a
 * different config under the other caption.
 *
 * ⚠️ THE OPENING SENTENCE SAID "a coding agent" (MOTIR-4508). Motir's agents do
 * design, decision, content, test and code work — the sandbox runs an agent, not
 * specifically a coding one, and the narrower word sells a narrower product on
 * the page a developer reads immediately before deciding whether to run it. It
 * now reads "your own agent", which is how the next sentence already writes it.
 * `tests/copy.test.ts` bans the phrase and could not see this one: it walks the
 * copy CATALOGUE, and this is JSX prose. `tests/docs/terminology.test.tsx` is
 * the surface-correct guard — it runs the same three predicates over what every
 * `/docs` page RENDERS, which is also the only kind that can see a phrase JSX
 * has line-wrapped, as this one was.
 */

export const metadata = {
  title: copy.docs.metaTitleSandbox,
  description: copy.docs.metaDescriptionSandbox,
}

export default function SandboxPage() {
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.sandbox}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        A sandbox is a container you start on your own machine, holding your own
        agent, the Motir CLI and your checkouts — and nothing else. You bring
        your own agent credential, mounted read-only; the loop runs inside, so a
        misbehaving agent reaches your work tree and not the rest of your
        machine.
      </p>

      {/* ⚠️ THE PAGE'S SPINE IS THE STEP SEQUENCE (MOTIR-4993).

          It replaces four prose sections — the preconditions, `Start one`, the
          VS Code route and `Inside: link, check, run` — which between them held
          seven code panes with instructions in the paragraphs around each one.
          A reader had to decide, sentence by sentence, which text was a thing
          to do.

          The explanation did not go away; it moved BELOW the sequence, under
          `Why it looks like this`, and that includes the confinement list — a
          reader mid-setup wants the procedure, and a reader deciding whether to
          trust the thing is not in a hurry. */}
      <p className="mt-9 text-[11px] font-semibold tracking-[0.06em] text-(--el-text-secondary) uppercase">
        Before you start
      </p>
      <ul className="mt-2.5 max-w-[68ch] list-none p-0">
        <li className="py-1.5 text-[13.5px] leading-relaxed text-(--el-text-secondary)">
          <strong className="text-(--el-text)">Docker, running.</strong> Built
          for{' '}
          <code className="font-(family-name:--font-mono)">linux/amd64</code>{' '}
          <strong className="text-(--el-text)">and</strong>{' '}
          <code className="font-(family-name:--font-mono)">linux/arm64</code>,
          so Apple Silicon is a first-class machine and nothing is emulated.
          There is no build step — you pull.
        </li>
        <li className="border-t border-(--el-border-soft) py-1.5 text-[13.5px] leading-relaxed text-(--el-text-secondary)">
          <strong className="text-(--el-text)">
            Your agent’s own sign-in, on this machine.
          </strong>{' '}
          Its credential mount is read-only, so the container can use a sign-in
          and can never perform one. (Antigravity is the exception — step 2 says
          so when you pick it.)
        </li>
        <li className="border-t border-(--el-border-soft) py-1.5 text-[13.5px] leading-relaxed text-(--el-text-secondary)">
          <strong className="text-(--el-text)">
            Your workspace root — the folder that CONTAINS your checkouts.
          </strong>{' '}
          A project usually spans several repositories and the loop runs across
          all of them.
        </li>
      </ul>
      <div className="mt-3">
        {/* Not a command — a diagram. `copyable={false}` is the design's
            filled-in-block-only asymmetry: a pane you cannot usefully paste
            must not offer a button that says you can. */}
        <CodeBlock
          caption="your machine"
          copyable={false}
          code={`~/work/                 ← start the container from HERE
├── motir-core/         ← a checkout
└── motir-ai/           ← another`}
        />
      </div>

      <SetupSteps />

      <hr className="mt-8 border-0 border-t border-(--el-border)" />
      <p className="mt-7 text-[11px] font-semibold tracking-[0.06em] text-(--el-text-secondary) uppercase">
        Why it looks like this
      </p>

      <h3 className="mt-6 text-[15px] font-semibold text-(--el-text)">
        What the profile picker changes
      </h3>
      <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        Picking an agent rewrites three things and nothing else: the image{' '}
        <strong className="text-(--el-text)">tag</strong>, the credential{' '}
        <code className="font-(family-name:--font-mono)">-v</code> line(s), and
        the dev container’s{' '}
        <code className="font-(family-name:--font-mono)">image</code>,{' '}
        <code className="font-(family-name:--font-mono)">name</code> and{' '}
        <code className="font-(family-name:--font-mono)">mounts</code>. It is a
        control rather than a paragraph telling you to swap them yourself,
        because every command here has a Copy button and a reader who copies is
        a reader who did not read the swap instruction.
      </p>
      <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        Not every profile has one credential directory.{' '}
        <code className="font-(family-name:--font-mono)">opencode</code> keeps
        two and takes two{' '}
        <code className="font-(family-name:--font-mono)">-v</code> lines;{' '}
        <code className="font-(family-name:--font-mono)">antigravity</code>{' '}
        keeps its token in the OS keyring and takes none, signing in inside the
        container instead; and{' '}
        <code className="font-(family-name:--font-mono)">aider</code> binds a
        file and reads a model key from the environment. The steps say so when
        you pick them.
      </p>

      <h3 className="mt-6 text-[15px] font-semibold text-(--el-text)">
        Nothing is kept that could go stale
      </h3>
      <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        <code className="font-(family-name:--font-mono)">--pull=always</code>{' '}
        fetches the current image on every start, so a profile tag that has
        moved reaches you without your having to notice that it moved, and{' '}
        <code className="font-(family-name:--font-mono)">--rm</code> means
        nothing is kept that could go stale. There is no separate
        coming-back-to-it path — which is exactly what used to leave people
        running a <code className="font-(family-name:--font-mono)">motir</code>{' '}
        months older than the page they were reading it from. Your sign-in
        survives all of that: it is written to the{' '}
        <code className="font-(family-name:--font-mono)">motir-auth</code>{' '}
        volume, which lives outside the container, so you sign in once and every
        later run picks it up — sign out for good with{' '}
        <code className="font-(family-name:--font-mono)">
          docker volume rm motir-auth
        </code>
        . Working offline? Drop{' '}
        <code className="font-(family-name:--font-mono)">--pull=always</code>:
        it reaches the registry on every start, so with no network the run fails
        instead of falling back to the image you already have.
      </p>

      <h3 className="mt-6 text-[15px] font-semibold text-(--el-text)">
        What next
      </h3>
      <p className="mt-2 max-w-[68ch] text-[13.5px] leading-relaxed text-(--el-text-secondary)">
        <code className="font-(family-name:--font-mono)">motir run</code> takes
        a SCOPE — one work item, a whole story, or{' '}
        <code className="font-(family-name:--font-mono)">sprint</code> for the
        active one.{' '}
        <code className="font-(family-name:--font-mono)">motir auto</code>{' '}
        drains the ready set unattended instead, one item at a time onto a
        session branch. Every flag both accept is on the{' '}
        <Link
          href="/docs/cli"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.cli}
        </Link>{' '}
        page.
      </p>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        What it confines — and what it does not
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Worth reading before you rely on it, because one of these three is an
        exception rather than a guarantee.
      </p>
      <dl className="mt-3 max-w-[68ch] space-y-3 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <div>
          <dt className="font-semibold text-(--el-text)">
            Filesystem — confined.
          </dt>
          <dd className="m-0">
            The only host surfaces inside the container are a writable{' '}
            <code className="font-(family-name:--font-mono)">/workspace</code>{' '}
            and your agent’s own credential, mounted read-only. No Docker
            socket, no other host bind.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            Network — OPEN, by design.
          </dt>
          <dd className="m-0">
            Every agent needs its provider API and every dispatched work item
            needs git remotes, so the image confines the filesystem blast radius
            and not egress. If your threat model needs more, reach for Docker’s
            own network controls — the container will not stop an agent talking
            to the internet.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            Privileges — unprivileged.
          </dt>
          <dd className="m-0">
            It runs as the{' '}
            <code className="font-(family-name:--font-mono)">node</code> user
            (uid 1000), so files written into the mount stay owned by you rather
            than by root.
          </dd>
        </div>
      </dl>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        What the environment gives you
      </h2>
      <ul className="mt-2 max-w-[68ch] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <li>
          <strong className="text-(--el-text)">Your folder, mounted.</strong>{' '}
          <code className="font-(family-name:--font-mono)">$PWD</code> becomes{' '}
          <code className="font-(family-name:--font-mono)">/workspace</code>, so
          the checkouts the run works in are yours and the commits it makes are
          on your disk when it exits.
        </li>
        <li>
          <strong className="text-(--el-text)">
            One checkout per work item, on a git worktree.
          </strong>{' '}
          A run does not edit the tree you are sitting in; it adds a worktree
          per item, so parallel runs cannot collide on a branch checkout.
        </li>
        <li>
          <strong className="text-(--el-text)">
            Your agent credential, READ-ONLY.
          </strong>{' '}
          The profile’s credential directory is bind-mounted with{' '}
          <code className="font-(family-name:--font-mono)">:ro</code>. Nothing
          in the container can rewrite it, and nothing about it is sent to Motir
          — this is bring-your-own-key, so the agent bill is yours and the API
          call never passes through us.
        </li>
        <li>
          <strong className="text-(--el-text)">The CLI, preinstalled.</strong>{' '}
          The image carries{' '}
          <code className="font-(family-name:--font-mono)">motir</code> and the
          agent binary the tag names, so there is nothing to install before the
          first run.
        </li>
        <li>
          <strong className="text-(--el-text)">
            Your agent’s output stays local by default.
          </strong>{' '}
          Only the run’s lifecycle reaches Motir. Passing{' '}
          <code className="font-(family-name:--font-mono)">--report-log</code>{' '}
          additionally sends the output’s tail so a failed run shows it on the
          run page; it is OFF unless you ask, and file contents, paths and diffs
          are never sent either way.
        </li>
      </ul>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        What the token may do — and what it refuses
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        A token minted by{' '}
        <code className="font-(family-name:--font-mono)">motir login</code>{' '}
        carries a fixed, narrowed grant. The approval screen shows it and cannot
        change it — neither wider nor narrower, because a hand-narrowed grant
        breaks an unattended loop halfway through.
      </p>
      <div className="mt-3">
        {/* A permission table, not a command — see `copyable` on `CodeBlock`. */}
        <CodeBlock
          caption="the grant a device-minted token carries"
          copyable={false}
          code={`project:browse      read the project and its work items
lesson:view         search the recorded lessons before building
lesson:reinforce    record that a lesson described what went wrong
work_item:edit      edit the item it is running, and file a bug
comment:add         comment on the item
ai:plan             open a plan`}
        />
      </div>
      <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        <strong className="text-(--el-text)">
          The one it does NOT carry is{' '}
          <code className="font-(family-name:--font-mono)">ai:view_plan</code>,
          and the refusal that follows is the design rather than a bug.
        </strong>{' '}
        Opening a plan needs only{' '}
        <code className="font-(family-name:--font-mono)">work_item:edit</code>,
        so a sandboxed run CAN open one — and is then refused on its first
        append, because that is the key adding proposals asserts. A run
        executing a work item does not get to reshape the plan it was handed.
        When you meet that refusal, the agent has done the right thing: it
        records the correction as a comment, leaves the item blocked, and stops.
        Nothing is lost, and a person decides what the plan should say.
      </p>
      <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Two flags narrow this further when you want a quieter run:{' '}
        <code className="font-(family-name:--font-mono)">
          --disable-log-bug
        </code>{' '}
        stops the agent filing a bug for a defect it finds elsewhere (it
        comments instead), and{' '}
        <code className="font-(family-name:--font-mono)">--disable-replan</code>{' '}
        stops it submitting a re-plan for a work item it judges wrong (it
        comments and stops). On{' '}
        <code className="font-(family-name:--font-mono)">motir auto</code> only,{' '}
        <code className="font-(family-name:--font-mono)">
          --auto-approve-replan
        </code>{' '}
        goes the other way: it approves a submitted re-plan and keeps looping,
        instead of stopping for you.
      </p>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        What a run produces, and where to read it
      </h2>
      <ul className="mt-2 max-w-[68ch] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <li>
          <strong className="text-(--el-text)">
            A branch and a pull request
          </strong>{' '}
          in each repository the item ships in, pushed with your git credentials
          from inside the container.
        </li>
        <li>
          <strong className="text-(--el-text)">A link on the work item.</strong>{' '}
          The run declares which item each pull request delivers, so merging it
          moves the card. That link is what the item page’s Development panel
          shows, and it is what closes the item on merge — not the branch name
          and not the title.
        </li>
        <li>
          <strong className="text-(--el-text)">Status, as it goes.</strong> The
          item moves to In Progress when the run claims it and to Implemented
          when the pull request opens. In Review is written by CI when the
          checks go green, and Done by the merge.
        </li>
        <li>
          <strong className="text-(--el-text)">The terminal.</strong> The
          agent’s own output stays in your terminal unless you passed{' '}
          <code className="font-(family-name:--font-mono)">--report-log</code>.
        </li>
      </ul>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        When it does not work
      </h2>
      <dl className="mt-2 max-w-[68ch] space-y-3 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <div>
          <dt className="font-semibold text-(--el-text)">
            The agent binary is not found
          </dt>
          <dd className="m-0">
            The tag and the agent disagree. Check which profile you started, or
            point the run at a different binary with{' '}
            <code className="font-(family-name:--font-mono)">
              --agent &lt;cmd&gt;
            </code>
            .{' '}
            <code className="font-(family-name:--font-mono)">motir doctor</code>{' '}
            reports this before a run wastes a claim on it.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            The agent starts and is not authenticated
          </dt>
          <dd className="m-0">
            The credential mount is missing or points at the wrong directory —
            each profile mounts its own. Re-run the{' '}
            <code className="font-(family-name:--font-mono)">docker run</code>{' '}
            line for the tag you actually pulled.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            Nothing is ready to run
          </dt>
          <dd className="m-0">
            Every candidate has an unmet dependency.{' '}
            <code className="font-(family-name:--font-mono)">motir ready</code>{' '}
            shows the set;{' '}
            <code className="font-(family-name:--font-mono)">motir show</code>{' '}
            on a work item names what is blocking it. Dispatching anyway is{' '}
            <code className="font-(family-name:--font-mono)">--force</code>, one
            item only.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            The run stops on a submitted re-plan
          </dt>
          <dd className="m-0">
            The agent judged the work item wrong and proposed a corrected shape.
            That is the intended stop: read the plan in Motir and approve or
            decline it. To keep an unattended loop going instead, run{' '}
            <code className="font-(family-name:--font-mono)">motir auto</code>{' '}
            with{' '}
            <code className="font-(family-name:--font-mono)">
              --auto-approve-replan
            </code>
            .
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-(--el-text)">
            A run left work behind after it exited
          </dt>
          <dd className="m-0">
            The worktrees and branches are on your disk, under the folder you
            mounted — a container that stopped did not take them with it.{' '}
            <code className="font-(family-name:--font-mono)">motir done</code>{' '}
            closes out a merged item, or a whole merged session branch with{' '}
            <code className="font-(family-name:--font-mono)">
              --session &lt;branch&gt;
            </code>
            .
          </dd>
        </div>
      </dl>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        What this page does not cover
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Every command and every flag — that is{' '}
        <Link
          href="/docs/cli"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.cli}
        </Link>
        , which is generated from the CLI’s own catalogue and cannot drift from
        it. Wiring an agent to Motir directly, without the CLI, is{' '}
        <Link
          href="/docs/mcp"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.mcp}
        </Link>
        . Driving the same work loop over HTTP instead of from a terminal is the{' '}
        <Link
          href="/docs/api"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.api}
        </Link>
        . Running the sandbox anywhere other than your own machine is not
        documented here yet. (The VS Code path IS documented, above — that
        clause used to say otherwise, and it was recording a deleted section as
        a decision.)
      </p>
    </>
  )
}
