/*
 * THE AGENT PROFILE TABLE (MOTIR-4993) — what the `/docs/sandbox` profile
 * picker offers, and what each profile changes in the commands.
 *
 * ⚠️ TRANSCRIBED FROM `motir-core`, NOT IMPORTED, and that is this page's
 * standing rule rather than a shortcut. Every other claim on this guide is
 * copied from the source of record with a reading recorded beside it — the
 * `docker run` recipe, the devcontainer literal, the grant list — because the
 * two repositories deploy independently and an import across that boundary
 * would tie this site's build to that one's tree.
 *
 * Source of record: `motir-core` `packages/cli/src/agentProfiles.ts`, read at
 * `origin/main`. The container-side path is `packages/cli/sandbox/
 * docker-compose.yml`, which `test/sandbox.test.ts` pins against that file.
 *
 * ⚠️⚠️ READ `sandboxMounts`, NEVER `credentialPaths`. That file's own docstring
 * says so in terms, and the trap is that the two fields sound
 * interchangeable and are not:
 *
 *   - `credentialPaths` is what `motir doctor` PROBES to prove a sign-in
 *     happened, deliberately narrowed wherever a mounted location is not proof
 *     of auth.
 *   - `sandboxMounts` is what the IMAGE BINDS, which is what a published
 *     command has to say.
 *
 * They diverge on most of the eight profiles — three probe nothing at all
 * while the image binds a path for each — so deriving the published mount from
 * the probe list would tell those three they need no credential mount. The
 * divergence is WIDENING, not closing: `motir-core#2746` re-points three
 * profiles' probes at credential FILES and leaves `sandboxMounts` untouched.
 *
 * ⚠️ THREE PROFILES BREAK THE ONE-`-v`-LINE SHAPE, which is why `mounts` is a
 * LIST here and not a string: `opencode` binds two paths, `antigravity` binds
 * none, and `aider` binds a FILE and needs an environment variable besides. A
 * build that templated one mount line would be correct for five of eight and
 * silently wrong for three — and the five are the ones anybody would test.
 */

/** The published image, without a tag. Tags are per profile. */
export const SANDBOX_IMAGE = 'ghcr.io/moooon-b-v/motir-sandbox'

/** The named volume the sign-in lives in, so the container can be thrown away. */
export const SANDBOX_AUTH_VOLUME = 'motir-auth'

/** Where the CLI's own config (and therefore the sign-in) lives inside the image. */
export const SANDBOX_CONFIG_DIR = '/home/node/.config/motir'

/**
 * Anything the picker can offer: the eight agent profiles, plus `base`.
 *
 * ⚠️ `base` IS NOT A PROFILE, which is why this type exists beside
 * `SandboxProfile` rather than instead of it. `AGENT_PROFILES` has eight
 * members; `base` is the agent-less image TAG, and cards that called it a ninth
 * profile are corrected by `motir-core#2746`. Modelling it as `tier: 0` keeps
 * it out of the tier grouping without pretending it has a tier.
 */
export interface SandboxOption {
  /** Profile id — also the image tag. */
  id: string
  /** The agent's own name, as its vendor writes it. */
  label: string
  /** 1 = pinned by the sandbox matrix; 2 = also-supported; 0 = `base`, no agent. A LABEL, not a gate. */
  tier: 0 | 1 | 2
  /**
   * The host paths the image binds READ-ONLY, `~`-relative and in mount order.
   * Transcribed from `sandboxMounts`. `[]` when the profile binds nothing.
   */
  mounts: readonly string[]
  /** Environment variables the run must forward. Only `aider` has any. */
  env?: readonly string[]
  /**
   * The one-line caveat this profile needs on step 2, or `undefined` when it
   * behaves like the majority. Rendered as the step's per-profile note.
   */
  note?: string
}

/** One of the EIGHT agents. `base` is a `SandboxOption` and never one of these. */
export interface SandboxProfile extends SandboxOption {
  tier: 1 | 2
}

/**
 * The eight profiles, tier-1 first — the order the picker renders them in.
 *
 * ⚠️ `base` IS NOT ONE OF THEM. It is the agent-less image TAG: no tier, no
 * credential, no mount. The picker offers it after an `or`, outside the tier
 * grouping, because choosing it is choosing to have NO agent rather than
 * choosing which one.
 */
export const SANDBOX_PROFILES: readonly SandboxProfile[] = [
  { id: 'claude', label: 'Claude Code', tier: 1, mounts: ['~/.claude'] },
  { id: 'codex', label: 'Codex CLI', tier: 1, mounts: ['~/.codex'] },
  {
    id: 'opencode',
    label: 'OpenCode',
    tier: 1,
    mounts: ['~/.config/opencode', '~/.local/share/opencode'],
    note: 'OpenCode keeps configuration and credentials in two places, so it takes two -v lines. Both are needed.',
  },
  { id: 'kimi', label: 'Kimi Code CLI', tier: 1, mounts: ['~/.kimi-code'] },
  {
    id: 'antigravity',
    label: 'Antigravity CLI',
    tier: 2,
    mounts: [],
    note: 'Antigravity keeps its token in the OS keyring, which has no portable file to bind — so there is no -v line for it, and you sign in INSIDE the container rather than before you start. This is the one profile for which the second precondition above does not apply.',
  },
  {
    id: 'cursor',
    label: 'Cursor CLI',
    tier: 2,
    mounts: ['~/.local/share/cursor-agent'],
  },
  {
    id: 'aider',
    label: 'Aider',
    tier: 2,
    mounts: ['~/.aider.conf.yml'],
    env: ['ANTHROPIC_API_KEY'],
    note: 'Aider’s credential is a model API key it reads from the environment, so this is the only profile that adds an -e line. The bind is a FILE, which must exist — even empty — or docker creates a directory in its place.',
  },
  { id: 'goose', label: 'Goose', tier: 2, mounts: ['~/.config/goose'] },
]

/** The agent-less image, offered beside the profiles rather than among them. */
export const SANDBOX_BASE: SandboxOption = {
  id: 'base',
  label: 'no agent (base)',
  tier: 0,
  mounts: [],
  note: 'The base image carries the Motir CLI and no agent at all — nothing to mount, and nothing to sign in to beyond Motir itself.',
}

/** Everything the picker offers: the eight profiles, then the agent-less image. */
export const SANDBOX_PICKER_OPTIONS: readonly SandboxOption[] = [
  ...SANDBOX_PROFILES,
  SANDBOX_BASE,
]

export function findProfile(id: string): SandboxOption {
  return SANDBOX_PICKER_OPTIONS.find((p) => p.id === id) ?? SANDBOX_PROFILES[0]!
}

/** `~/.config/opencode` → `/home/node/.config/opencode`. The compose file's own mapping. */
function containerPath(hostPath: string): string {
  return `/home/node/${hostPath.replace(/^~\//, '')}`
}

export function sandboxPullCommand(profileId: string): string {
  return `docker pull ${SANDBOX_IMAGE}:${profileId}`
}

/**
 * The `docker run` line for one profile.
 *
 * ⚠️ EVERY LINE EXCEPT THE CREDENTIAL MOUNTS AND THE TAG IS MOTIR-4970's
 * LITERAL, carried through unchanged: `-it --rm --pull=always`, the workspace
 * bind and the `motir-auth` volume. This function varies the two things the
 * picker owns and nothing else.
 */
export function sandboxRunCommand(profileId: string): string {
  const profile = findProfile(profileId)
  const lines = [
    'docker run -it --rm --pull=always \\',
    '  -v "$PWD:/workspace" \\',
    `  -v ${SANDBOX_AUTH_VOLUME}:${SANDBOX_CONFIG_DIR} \\`,
    ...profile.mounts.map(
      (m) => `  -v "$HOME/${m.replace(/^~\//, '')}:${containerPath(m)}:ro" \\`,
    ),
    ...(profile.env ?? []).map((name) => `  -e ${name} \\`),
    `  ${SANDBOX_IMAGE}:${profile.id}`,
  ]
  return lines.join('\n')
}

/**
 * The dev-container configuration for one profile.
 *
 * THREE keys move with the profile and only three: `image` takes the tag,
 * `mounts` takes the same per-profile paths as the run command — an ARRAY, so
 * two entries for OpenCode and an empty one for Antigravity — and `name`
 * carries the agent's own label, because a reader with two dev containers open
 * reads that string in the window title. Everything else is MOTIR-4970's
 * literal.
 */
export function sandboxDevcontainerJson(profileId: string): string {
  const profile = findProfile(profileId)
  const mounts = profile.mounts.map(
    (m) =>
      `    "source=\${localEnv:HOME}/${m.replace(/^~\//, '')},target=${containerPath(m)},type=bind,readonly"`,
  )
  return `{
  "name": "Motir sandbox (${profile.label})",
  "image": "${SANDBOX_IMAGE}:${profile.id}",
  "workspaceFolder": "/workspace",
  "workspaceMount": "source=\${localWorkspaceFolder},target=/workspace,type=bind",
  "mounts": [${mounts.length ? `\n${mounts.join(',\n')}\n  ` : ''}],
  "remoteUser": "node",
  "overrideCommand": true,
  "postStartCommand": "motir-sandbox-agent-config || true"
}`
}

/**
 * The command that PRODUCES that file — the folder AND the file, in ONE paste.
 *
 * ⚠️ IT IS ONE PASTE, WHICH IS WHY IT IS ONE STEP. Naming a filename is not an
 * instruction a reader can carry out: macOS Finder and most GUI file pickers
 * refuse a name beginning with `.`, and refuse it without saying why. The
 * heredoc delimiter is QUOTED — `<<'JSON'` — and that is load-bearing:
 * unquoted, the shell expands `${localWorkspaceFolder}` and `${localEnv:HOME}`
 * to empty strings on the way into the file, and the reader gets a container
 * that mounts nothing and finds no credential.
 */
export function sandboxDevcontainerWriteCommand(profileId: string): string {
  return `mkdir -p .devcontainer
cat > .devcontainer/devcontainer.json <<'JSON'
${sandboxDevcontainerJson(profileId)}
JSON`
}
