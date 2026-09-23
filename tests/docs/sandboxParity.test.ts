import { describe, expect, it } from 'vitest'
import {
  SANDBOX_AUTH_VOLUME,
  SANDBOX_CONFIG_DIR,
  SANDBOX_PICKER_OPTIONS,
  sandboxDevcontainerJson,
  sandboxRunCommand,
} from '@/lib/sandboxProfiles'

// THE GUIDE'S TWO ROUTES DELIVER THE SAME PROPERTIES (MOTIR-6120).
//
// MOTIR-4970 made the `docker run` literal disposable and put the sign-in on the
// `motir-auth` volume; nothing asserted the dev-container literal did the same,
// so a Rebuild Container — the only way to update one — deleted the sign-in
// while the page said "lands on the `motir-auth` volume". Every volume the run
// command mounts that is not a per-profile credential bind must also be mounted
// by the dev container, for EVERY profile including `base`, so the next property
// added to one route turns this red until the other carries it. This is the
// marketing copy of motir-core's assertion in `tests/docs/sandboxRunCommand.test.ts`.

// What a `-v` flag mounts as `source:target`, minus the `:ro` credential binds and
// the workspace bind (which a dev container spells as `workspaceMount`).
function nonCredentialVolumes(command: string): string[] {
  return command
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-v '))
    .map((line) =>
      line.replace(/^-v /, '').replace(/ \\$/, '').replace(/"/g, ''),
    )
    .filter((spec) => !spec.endsWith(':ro') && !spec.endsWith(':/workspace'))
}

describe('the dev container carries what the run command carries', () => {
  it('has profiles to assert over at all, base included', () => {
    expect(SANDBOX_PICKER_OPTIONS.length).toBeGreaterThan(0)
    expect(SANDBOX_PICKER_OPTIONS.some((p) => p.id === 'base')).toBe(true)
  })

  it.each(SANDBOX_PICKER_OPTIONS.map((p) => [p.id] as const))(
    '%s: mounts every non-credential volume of the run command',
    (id) => {
      const { mounts } = JSON.parse(sandboxDevcontainerJson(id)) as {
        mounts: string[]
      }
      const volumes = nonCredentialVolumes(sandboxRunCommand(id))
      // Vacuity guard: the auth volume is one, so an empty list means the filter broke.
      expect(volumes).toContain(`${SANDBOX_AUTH_VOLUME}:${SANDBOX_CONFIG_DIR}`)
      for (const volume of volumes) {
        const [source, target] = volume.split(':')
        expect(mounts, `${id}: ${volume}`).toContain(
          `source=${source},target=${target},type=volume`,
        )
      }
    },
  )

  it.each(SANDBOX_PICKER_OPTIONS.map((p) => [p.id] as const))(
    '%s: keeps every credential bind read-only',
    (id) => {
      const { mounts } = JSON.parse(sandboxDevcontainerJson(id)) as {
        mounts: string[]
      }
      for (const mount of mounts.filter((m) => m.includes('type=bind'))) {
        expect(mount).toMatch(/,readonly$/)
      }
    },
  )
})
