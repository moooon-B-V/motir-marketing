import { describe, expect, it } from 'vitest'
import { APP_ORIGIN } from '@/lib/appOrigin'
import { MCP_ENDPOINT_PATH, mcpTransportFacts } from '@/lib/mcpWiring'

/**
 * THE ONE FACT `/docs/mcp` TYPES, HELD AGAINST WHAT MOTIR-CORE SERVES
 * (MOTIR-4429).
 *
 * `lib/mcpWiring.ts` builds five client configurations by interpolating one set
 * of transport facts, and `tests/docs/mcpWiring.test.tsx` proves the
 * interpolation with a sentinel origin. That check is total over the ORIGIN and
 * silent about the PATH: `/api/mcp` is a literal in this repository, exactly as
 * `/api/openapi/v1.json` and `/api/docs/mcp-tools.json` already are.
 *
 * A literal is fine while something checks it, and nothing offline can: the
 * route lives in the other repository. So the check lives here, where the lane
 * is licensed to reach the deployment — and what it reads is not the route but
 * motir-core's own published DECLARATION of it. `/api/docs/mcp-tools.json`
 * carries `endpoint`, set from `MCP_ENDPOINT_PATH` over there, so the two
 * repositories are compared on the fact rather than on a request that might
 * succeed for an unrelated reason.
 *
 * ⚠️ NOT IN THE DEFAULT LANE, and that is the design (`vitest.seam.config.mts`).
 * Running this on `pull_request` would make an app.motir.co restart redden an
 * unrelated pull request, which is the cross-repository CI coupling
 * `public-surface-hosts.md` AMENDMENT 2 §E's split exists to avoid.
 *
 * ⚠️ AND IT ASSERTS THE PATH, NOT THE URL. The origin is this build's own
 * configuration and is SUPPOSED to differ between local, preview and
 * production — comparing the whole URL would fail on a preview for the one
 * reason that is correct behaviour.
 */

const CATALOGUE_URL = `${APP_ORIGIN}/api/docs/mcp-tools.json`

describe('the endpoint /docs/mcp documents is the one motir-core declares', () => {
  it('agrees with the published catalogue', async () => {
    const response = await fetch(CATALOGUE_URL)

    // The report is the deliverable of a red run: whoever is holding the
    // failure needs to know WHICH side is unreachable before they read a diff.
    if (!response.ok) {
      console.error(
        `\n${CATALOGUE_URL} answered ${response.status}. The MCP wiring guide's ` +
          `endpoint could not be verified against motir-core — this is a ` +
          `reachability failure, not a disagreement.\n`,
      )
    }
    expect(response.ok, `${CATALOGUE_URL} is unreachable`).toBe(true)

    const document = (await response.json()) as { endpoint?: unknown }

    expect(
      document.endpoint,
      `motir-core declares its MCP endpoint as ${String(document.endpoint)}; ` +
        `lib/mcpWiring.ts publishes ${MCP_ENDPOINT_PATH} in five client ` +
        `configurations. Update the constant, not this test.`,
    ).toBe(MCP_ENDPOINT_PATH)

    // …and the URL a reader pastes is that path on this build's own origin.
    expect(mcpTransportFacts().url).toBe(`${APP_ORIGIN}${MCP_ENDPOINT_PATH}`)
  })
})
