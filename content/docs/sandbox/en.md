A sandbox is a container you start on your own machine, holding your own agent, the Motir CLI and your checkouts — and nothing else. You bring your own agent credential, mounted read-only; the loop runs inside, so a misbehaving agent reaches your work tree and not the rest of your machine.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Before you start {#before-you-start}

- **Docker, running.** Built for `linux/amd64` **and** `linux/arm64`, so Apple Silicon is a first-class machine and nothing is emulated. There is no build step — you pull.
- **Your agent’s own sign-in, on this machine.** Its credential mount is read-only, so the container can use a sign-in and cannot renew one. Claude Code on macOS is the exception you will meet: it keeps its token in the login Keychain, so there is no file to mount, and you sign in to `claude` **inside** the container instead — the image gives it a writable config directory, and that is where the sign-in lands. (Antigravity is the same — step 2 says so when you pick it.)
- **Your workspace root — the folder that CONTAINS your checkouts.** A project usually spans several repositories and the loop runs across all of them.

{{slot:workspace}}

{{part:picker-label}}

Which agent do you use?

{{part:picker-also-supported}}

also supported

{{part:picker-or}}

or

{{part:picker-base}}

no agent (base)

{{part:picker-summary}}

Every command below is for **{{value:profileLabel}}**. Switching rewrites the tag and the credential mount in **steps 1, 2 and 2b** — the three places they appear.

{{part:chip-command}}

Command

{{part:chip-editor}}

In your editor

{{part:steps-intro}}

## Set it up {#set-it-up}

Five steps. Each one is a single thing to do.

{{part:step-1-intent}}

Pull the image for your agent

{{part:step-1-body}}

There is no build step — the image is published per agent profile.

{{part:step-2-intent}}

Start the container from your workspace root

{{part:step-2-body}}

Run it from the folder that **contains** your checkouts, not from any one of them.

{{part:step-2-vscode}}

**Using VS Code instead?** Steps 2a–2c below replace this one. Everything after is the same either way.

{{part:step-2a-intent}}

Install the Dev Containers extension

{{part:step-2a-body}}

From the Extensions view, or the command palette — ⇧⌘P on macOS, Ctrl+Shift+P elsewhere, F1 on all three — then _Extensions: Install Extensions_. Two of these three steps happen in the palette, so it is worth pinning now.

{{part:step-2b-intent}}

Create the dev container config

{{part:step-2b-body}}

Run this in the folder you are mounting. One paste: it makes the `.devcontainer` folder and writes the file into it. Do not try to create them from a file picker — Finder and most GUI pickers refuse a name beginning with a dot, and refuse it without saying why.

{{part:step-2b-warning}}

**A dev container keeps the image it was created from.** `--pull=always` belongs to the run command in step 2, not to this route. To move to the current image and `motir` CLI: **1.** run step 1's `{{value:dockerPull}}` in a terminal on your machine; **2.** _Dev Containers: Open Folder in Container…_ on this folder, which attaches the window; **3.** _Dev Containers: Rebuild Container_, which recreates the container from the image you just pulled. Rebuild Container only appears in a window attached to the container, which is why step 2 comes first. A rebuild keeps your Motir sign-in (it lives on the `{{value:authVolume}}` volume) but not a Claude Code sign-in made inside the container — run `claude` and sign in again.

{{part:step-2c-intent}}

Open the folder in the container

{{part:step-2c-body}}

Command palette → _Dev Containers: Open Folder in Container…_, and pick the folder you just wrote the file into. Its terminal is the same shell step 2 would have dropped you into — carry on at step 3.

{{part:step-3-intent}}

Sign in, inside the container

{{part:step-3-body}}

A code and a URL are printed; approve it in any browser. The sign-in lands on the `{{value:authVolume}}` volume, so you do this once.

{{part:step-4-intent}}

Link the folder to your project

{{part:step-4-body}}

Swap `ACME` for your project key. If your workspace has exactly one project, drop the flag — that is the whole step.

{{part:step-5-intent}}

Check it — all green is the end of this page

{{part:step-5-body}}

Auth, link, the agent binary and its credential. This is the only thing that tells you the container actually got what you passed it.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode keeps configuration and credentials in two places, so it takes two `-v` lines. Both are needed.

{{part:note-antigravity}}

Antigravity keeps its token in the OS keyring, which has no portable file to bind — so there is no `-v` line for it, and you sign in INSIDE the container rather than before you start. This is the one profile for which the second precondition above does not apply.

{{part:note-aider}}

Aider’s credential is a model API key it reads from the environment, so this is the only profile that adds an `-e` line. The bind is a FILE, which must exist — even empty — or docker creates a directory in its place.

{{part:note-base}}

The base image carries the Motir CLI and no agent at all — nothing to mount, and nothing to sign in to beyond Motir itself.

{{part:devcontainer-file}}

### The file that command writes {#devcontainer-file}

Reference, not a step — 2b already wrote it. It is here for the reader who would rather create the file by hand, and because the quotes around `<<’JSON’` are load-bearing: they stop your shell expanding `${localWorkspaceFolder}` and `${localEnv:HOME}` before they reach the file. Those are Dev Containers substitutions and the editor is what resolves them.

{{part:why}}

## Why it looks like this {#why}

### What the profile picker changes {#profile-picker}

Picking an agent rewrites three things and nothing else: the image **tag**, the credential `-v` line(s), and the dev container’s `image`, `name` and `mounts`. It is a control rather than a paragraph telling you to swap them yourself, because every command here has a Copy button and a reader who copies is a reader who did not read the swap instruction.

Not every profile has one credential directory. `opencode` keeps two and takes two `-v` lines; `antigravity` keeps its token in the OS keyring and takes none, signing in inside the container instead; and `aider` binds a file and reads a model key from the environment. The steps say so when you pick them.

### On the run command, nothing is kept that could go stale {#run-command}

`--pull=always` fetches the current image on every start, so a profile tag that has moved reaches you without your having to notice that it moved, and `--rm` means nothing is kept that could go stale. There is no separate coming-back-to-it path — which is exactly what used to leave people running a `motir` months older than the page they were reading it from. Your sign-in survives all of that: it is written to the `{{value:authVolume}}` volume, which lives outside the container, so you sign in once and every later run picks it up — sign out for good with `{{value:signOutCommand}}`. Working offline? Drop `--pull=always`: it reaches the registry on every start, so with no network the run fails instead of falling back to the image you already have. All of this is the run command's. A dev container (steps 2a–2c) keeps the image it was created from until you pull, attach with _Dev Containers: Open Folder in Container…_ and choose _Dev Containers: Rebuild Container_.

### What next {#what-next}

`motir run` takes a SCOPE — one work item, a whole story, or `sprint` for the active one. `motir auto` drains the ready set unattended instead, one item at a time onto a session branch. Every flag both accept is on the [{{value:cliPage}}](/docs/cli) page.

## What it confines — and what it does not {#confines}

Worth reading before you rely on it, because one of these three is an exception rather than a guarantee.

- **Filesystem — confined.** The only host surfaces inside the container are a writable `/workspace` and your agent’s own credential, mounted read-only. No Docker socket, no other host bind.
- **Network — OPEN, by design.** Every agent needs its provider API and every dispatched work item needs git remotes, so the image confines the filesystem blast radius and not egress. If your threat model needs more, reach for Docker’s own network controls — the container will not stop an agent talking to the internet.
- **Privileges — unprivileged.** It runs as the `node` user (uid 1000), so files written into the mount stay owned by you rather than by root.

## What the environment gives you {#environment}

- **Your folder, mounted.** `$PWD` becomes `/workspace`, so the checkouts the run works in are yours and the commits it makes are on your disk when it exits.
- **One checkout per work item, on a git worktree.** A run does not edit the tree you are sitting in; it adds a worktree per item, so parallel runs cannot collide on a branch checkout.
- **Your agent credential, READ-ONLY.** The profile’s credential directory is bind-mounted with `:ro`. Nothing in the container can rewrite it, and nothing about it is sent to Motir — this is bring-your-own-key, so the agent bill is yours and the API call never passes through us.
- **The CLI, preinstalled.** The image carries `motir` and the agent binary the tag names, so there is nothing to install before the first run.
- **Your agent’s output stays local by default.** Only the run’s lifecycle reaches Motir. Passing `--report-log` additionally sends the output’s tail so a failed run shows it on the run page; it is OFF unless you ask, and file contents, paths and diffs are never sent either way.

## What the token may do — and what it refuses {#token}

A token minted by `motir login` carries a fixed, narrowed grant. The approval screen shows it and cannot change it — neither wider nor narrower, because a hand-narrowed grant breaks an unattended loop halfway through.

{{slot:grant}}

**The one it does NOT carry is `ai:view_plan`, and the refusal that follows is the design rather than a bug.** Opening a plan needs only `work_item:edit`, so a sandboxed run CAN open one — and is then refused on its first append, because that is the key adding proposals asserts. A run executing a work item does not get to reshape the plan it was handed. When you meet that refusal, the agent has done the right thing: it records the correction as a comment, leaves the item blocked, and stops. Nothing is lost, and a person decides what the plan should say.

Two flags narrow this further when you want a quieter run: `--disable-log-bug` stops the agent filing a bug for a defect it finds elsewhere (it comments instead), and `--disable-replan` stops it submitting a re-plan for a work item it judges wrong (it comments and stops). On `motir auto` only, `--auto-approve-replan` goes the other way: it approves a submitted re-plan and keeps looping, instead of stopping for you.

## What a run produces, and where to read it {#produces}

- **A branch and a pull request** in each repository the item ships in, pushed with your git credentials from inside the container.
- **A link on the work item.** The run declares which item each pull request delivers, so merging it moves the card. That link is what the item page’s Development panel shows, and it is what closes the item on merge — not the branch name and not the title.
- **Status, as it goes.** The item moves to In Progress when the run claims it and to Implemented when the pull request opens. In Review is written by CI when the checks go green, and Done by the merge.
- **The terminal.** The agent’s own output stays in your terminal unless you passed `--report-log`.

## When it does not work {#troubleshooting}

### The agent binary is not found {#agent-binary-not-found}

The tag and the agent disagree. Check which profile you started, or point the run at a different binary with `--agent <cmd>`. `motir doctor` reports this before a run wastes a claim on it.

### The agent starts and is not authenticated {#agent-not-authenticated}

The credential mount is missing or points at the wrong directory — each profile mounts its own. Re-run the `{{value:dockerRun}}` line for the tag you actually pulled.

### Nothing is ready to run {#nothing-ready}

Every candidate has an unmet dependency. `motir ready` shows the set; `motir show` on a work item names what is blocking it. Dispatching anyway is `--force`, one item only.

### The run stops on a submitted re-plan {#stopped-on-replan}

The agent judged the work item wrong and proposed a corrected shape. That is the intended stop: read the plan in Motir and approve or decline it. To keep an unattended loop going instead, run `motir auto` with `--auto-approve-replan`.

### A run left work behind after it exited {#work-left-behind}

The worktrees and branches are on your disk, under the folder you mounted — a container that stopped did not take them with it. `motir done` closes out a merged item, or a whole merged session branch with `--session <branch>`.

## What this page does not cover {#not-covered}

Every command and every flag — that is [{{value:cliPage}}](/docs/cli), which is generated from the CLI’s own catalogue and cannot drift from it. Wiring an agent to Motir directly, without the CLI, is [{{value:mcpPage}}](/docs/mcp). Driving the same work loop over HTTP instead of from a terminal is the [{{value:apiPage}}](/docs/api). Running the sandbox anywhere other than your own machine is not documented here yet. (The VS Code path IS documented, above — that clause used to say otherwise, and it was recording a deleted section as a decision.)
