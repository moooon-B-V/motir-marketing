import Link from 'next/link'
import { copy } from '@/lib/copy'
import { CodeBlock } from '../../_components/DocSchema'

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

/**
 * The dev-container configuration the VS Code sub-step tells the reader to
 * write — the ONE source both of that step's code blocks are built from.
 *
 * The `\${…}` escapes are template-literal escapes, not shell ones: what this
 * constant HOLDS is the literal text `${localWorkspaceFolder}`, which is a Dev
 * Containers substitution the editor resolves and nothing before it may.
 */
const DEVCONTAINER_JSON = `{
  "name": "Motir sandbox (Claude Code)",
  "image": "ghcr.io/moooon-b-v/motir-sandbox:claude",
  "workspaceFolder": "/workspace",
  "workspaceMount": "source=\${localWorkspaceFolder},target=/workspace,type=bind",
  "mounts": [
    "source=\${localEnv:HOME}/.claude,target=/home/node/.claude,type=bind,readonly"
  ],
  "remoteUser": "node",
  "overrideCommand": true
}`

/**
 * The command that PRODUCES that file, because naming a filename is not an
 * instruction a reader can carry out: macOS Finder and most GUI file pickers
 * refuse a name beginning with `.`, and refuse it without saying why.
 */
const DEVCONTAINER_WRITE_COMMAND = `mkdir -p .devcontainer
cat > .devcontainer/devcontainer.json <<'JSON'
${DEVCONTAINER_JSON}
JSON`

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
        Before you start
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Two things, and neither is a Motir account detail — you sign in{' '}
        <strong className="text-(--el-text)">inside</strong> the container
        below, so there is nothing to mint or copy first. You do not need the
        Motir CLI on this machine either; it ships in the image.
      </p>
      <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <li>
          <strong className="text-(--el-text)">Docker, running.</strong> Docker
          Desktop or any engine. The images are built for{' '}
          <code className="font-(family-name:--font-mono)">linux/amd64</code>{' '}
          <strong className="text-(--el-text)">and</strong>{' '}
          <code className="font-(family-name:--font-mono)">linux/arm64</code>,
          so Apple Silicon is a first-class machine and nothing is emulated.
          There is no build step — you pull.
        </li>
        <li>
          <strong className="text-(--el-text)">
            Your agent’s own sign-in, on this machine.
          </strong>{' '}
          Sign in to your agent once, here, before you start — or have its API
          key in your environment. Its credential mount is read-only, so the
          container can use a sign-in and can never perform one.
        </li>
      </ul>
      <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        A Motir project usually spans several repositories and the work loop
        runs across all of them — so what you mount is the folder that{' '}
        <strong className="text-(--el-text)">contains</strong> your checkouts,
        not any one of them. Start the container from there:
      </p>
      <div className="mt-3">
        <CodeBlock
          caption="your machine"
          code={`~/work/                 ← start the container from HERE
├── motir-core/         ← a checkout
└── motir-ai/           ← another`}
        />
      </div>

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
        Or start it from VS Code instead
      </h2>
      <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        The same confined image, as a dev container: VS Code opens{' '}
        <code className="font-(family-name:--font-mono)">/workspace</code>{' '}
        inside it with the same mounts, so your editor, terminal and agent all
        run behind the same boundary. Three sub-steps, and they{' '}
        <strong className="text-(--el-text)">replace</strong> the{' '}
        <code className="font-(family-name:--font-mono)">docker run</code> above
        rather than following it — everything after is the same either way.
      </p>
      <ol className="mt-3 max-w-[68ch] list-decimal space-y-3 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        <li>
          <strong className="text-(--el-text)">
            Install the Dev Containers extension.
          </strong>{' '}
          From the Extensions view, or from the command palette — ⇧⌘P on macOS,
          Ctrl+Shift+P on Windows and Linux, F1 on all three — then{' '}
          <em>Extensions: Install Extensions</em>. The palette is where two of
          these three sub-steps happen, so it is worth pinning now. The
          extension drives the same Docker engine the command above uses.
        </li>
        <li>
          <strong className="text-(--el-text)">
            Add{' '}
            <code className="font-(family-name:--font-mono)">
              .devcontainer/devcontainer.json
            </code>
          </strong>{' '}
          to the folder you are mounting — the same one you would have started
          from. It pins the published image and passes the mount your profile
          needs. Write it from that folder in one command, because a GUI file
          manager will not do it for you: macOS Finder and most file pickers
          refuse a name beginning with a dot, and they refuse it without saying
          why.
        </li>
        <li>
          <strong className="text-(--el-text)">
            Open the folder in the container.
          </strong>{' '}
          Command palette → <em>Dev Containers: Open Folder in Container…</em>,
          and pick the folder you just wrote the file into. VS Code pulls the
          image and attaches; its terminal is the same shell the{' '}
          <code className="font-(family-name:--font-mono)">docker run</code>{' '}
          above would have dropped you into. If that folder is{' '}
          <em>already open</em> in VS Code,{' '}
          <em>Dev Containers: Reopen in Container</em> does the same attach
          without asking which folder.
        </li>
      </ol>
      <div className="mt-3">
        <CodeBlock
          caption="your machine — in the folder you are mounting"
          code={DEVCONTAINER_WRITE_COMMAND}
        />
      </div>
      <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        The quotes around{' '}
        <code className="font-(family-name:--font-mono)">&lt;&lt;’JSON’</code>{' '}
        are load-bearing: they are what stops your shell expanding{' '}
        <code className="font-(family-name:--font-mono)">
          ${'{'}localWorkspaceFolder{'}'}
        </code>{' '}
        and{' '}
        <code className="font-(family-name:--font-mono)">
          ${'{'}localEnv:HOME{'}'}
        </code>{' '}
        before they reach the file. Those are Dev Containers substitutions, and
        the editor is what resolves them. That command writes exactly this — the
        same file, if you would rather create it by hand:
      </p>
      <div className="mt-3">
        <CodeBlock
          caption=".devcontainer/devcontainer.json"
          code={DEVCONTAINER_JSON}
        />
      </div>
      <p className="mt-1 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        Swap the <code className="font-(family-name:--font-mono)">:claude</code>{' '}
        tag and the{' '}
        <code className="font-(family-name:--font-mono)">mounts</code> entry
        together for the profile you use — the same pairing the{' '}
        <code className="font-(family-name:--font-mono)">docker run</code> line
        needs. A dev container is not torn down when you close the window, so
        the sign-in below persists here with no extra flag — and for exactly
        that reason it also keeps the image it was first created from. Dev
        Containers reuses a local image just as{' '}
        <code className="font-(family-name:--font-mono)">docker run</code> does,
        so the{' '}
        <code className="font-(family-name:--font-mono)">docker pull</code>{' '}
        above is still yours to run before you reopen, and an existing container
        then needs <em>Dev Containers: Rebuild Container</em> to pick the new
        image up.
      </p>
      <p className="mt-3 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
        <strong className="text-(--el-text)">
          The devcontainer files inside the motir-core repository are not this
          file.
        </strong>{' '}
        They carry a{' '}
        <code className="font-(family-name:--font-mono)">build</code> block
        pointing at that repository’s own Dockerfile, because they are its dev
        containers and a checkout is what those are for. For your own workspace,
        pin the image as above.
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
