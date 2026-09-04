import Link from 'next/link'
import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'
import { CodeBlock } from '../_components/DocSchema'

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
 */

export default function SandboxPage() {
  return (
    <>
      <DocsNav current="/docs/sandbox" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.sandbox}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        A sandbox is a container you start on your own machine, holding a coding
        agent, the Motir CLI and your checkouts — and nothing else. You bring
        your own agent credential, mounted read-only; the loop runs inside, so a
        misbehaving agent reaches your work tree and not the rest of your
        machine.
      </p>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        Start one
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        There is no build step — the image is published per agent profile, so
        you pull the tag for the agent you use. Run this from the folder that
        holds your checkouts.
      </p>
      <div className="mt-3">
        <CodeBlock
          caption="pull"
          code="docker pull ghcr.io/moooon-b-v/motir-sandbox:claude"
        />
        <CodeBlock
          caption="run"
          code={`docker run -it --name motir-sandbox \\
  -v "$PWD:/workspace" \\
  -v "$HOME/.claude:/home/node/.claude:ro" \\
  ghcr.io/moooon-b-v/motir-sandbox:claude`}
        />
      </div>
      <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Tags follow the agent:{' '}
        <code className="font-(family-name:--font-mono)">claude</code>,{' '}
        <code className="font-(family-name:--font-mono)">codex</code>,{' '}
        <code className="font-(family-name:--font-mono)">opencode</code> and{' '}
        <code className="font-(family-name:--font-mono)">kimi</code> are the
        first-tier profiles;{' '}
        <code className="font-(family-name:--font-mono)">antigravity</code>,{' '}
        <code className="font-(family-name:--font-mono)">cursor</code>,{' '}
        <code className="font-(family-name:--font-mono)">aider</code> and{' '}
        <code className="font-(family-name:--font-mono)">goose</code> follow,
        and <code className="font-(family-name:--font-mono)">base</code> carries
        no agent at all. Each profile mounts its own credential directory, so
        swap both the tag and the{' '}
        <code className="font-(family-name:--font-mono)">-v</code> line together
        — pulling one tag and starting another is the one mistake that leaves
        you worse off than not pulling.
      </p>
      <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Coming back to a container you already made is{' '}
        <code className="font-(family-name:--font-mono)">
          docker start -ai motir-sandbox
        </code>
        . Note that neither that nor{' '}
        <code className="font-(family-name:--font-mono)">docker run</code> goes
        back to the registry — a profile tag MOVES, so pull again to pick up a
        newer CLI.
      </p>

      <h2 className="mt-9 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)">
        Inside: link, check, run
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Three steps, in this order. The middle one is worth not skipping: it is
        the only thing that tells you the agent binary and its credential are
        actually visible inside the container, which is where a first run
        usually goes wrong.
      </p>
      <div className="mt-3">
        <CodeBlock
          caption="in the container"
          code={`motir login                 # or: motir auth login --token <pat>
motir link --project ACME   # bind this folder to a project
motir doctor                # auth, link, agent binary, credentials
motir run ACME-7            # one work item — or a story key, or 'sprint'`}
        />
      </div>
      <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
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
          The profile&apos;s credential directory is bind-mounted with{' '}
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
            Your agent&apos;s output stays local by default.
          </strong>{' '}
          Only the run&apos;s lifecycle reaches Motir. Passing{' '}
          <code className="font-(family-name:--font-mono)">--report-log</code>{' '}
          additionally sends the output&apos;s tail so a failed run shows it on
          the run page; it is OFF unless you ask, and file contents, paths and
          diffs are never sent either way.
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
        <CodeBlock
          caption="the grant a device-minted token carries"
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
          moves the card. That link is what the item page&apos;s Development
          panel shows, and it is what closes the item on merge — not the branch
          name and not the title.
        </li>
        <li>
          <strong className="text-(--el-text)">Status, as it goes.</strong> The
          item moves to In Progress when the run claims it and to Implemented
          when the pull request opens. In Review is written by CI when the
          checks go green, and Done by the merge.
        </li>
        <li>
          <strong className="text-(--el-text)">The terminal.</strong> The
          agent&apos;s own output stays in your terminal unless you passed{' '}
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
        , which is generated from the CLI&apos;s own catalogue and cannot drift
        from it. Wiring an agent to Motir directly, without the CLI, is{' '}
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
        . Running the sandbox anywhere other than your own machine, and the
        editor integrations, are not documented here yet.
      </p>
    </>
  )
}
