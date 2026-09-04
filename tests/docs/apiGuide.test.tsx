import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GettingStartedPage from '@/app/docs/api/getting-started/page'
import StabilityPage, {
  POLICY_ADDITIVE,
  POLICY_FORBIDDEN,
} from '@/app/docs/api/stability/page'
import { APP_ORIGIN } from '@/lib/appOrigin'

/*
 * THE TWO PROSE PAGES UNDER `/docs/api` (MOTIR-4429).
 *
 * Both were measured by MOTIR-4397's parity ledger and both were short in the
 * same way — the deleted `motir-core` pages handed a reader something they
 * could RUN or CHECK, and these handed them a description of it instead.
 *
 *   · `/docs/api/getting-started` — `0 <pre>`, and ZERO occurrences of `curl`,
 *     on a page titled *Getting started*.
 *   · `/docs/api/stability` — three bullets, and `v2` appeared ZERO times. The
 *     two missing sections were the client's own obligations and the migration
 *     story: a promise with only the vendor's half written down.
 *
 * ⚠️ THE `0 CODE BLOCKS` ASSERTION IS THE CARD'S OWN, AND IT IS NOT THE ONLY
 * ONE HERE. A floor of one can be met by a page that shows a request and no
 * response, which is most of the distance back to the defect — so the count is
 * a floor and the CONTENT of each block is asserted beside it.
 */

const catalogueFixture = {
  openapi: '3.1.0',
  info: { title: 'Motir API', version: '9.9.9' },
  paths: {},
}

function stubSpec(document: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(document), { status })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Every `<pre>` the page renders, as text. */
async function panes(): Promise<string[]> {
  const { container } = render(await GettingStartedPage())
  return [...container.querySelectorAll('pre')].map(
    (pane) => pane.textContent ?? '',
  )
}

describe('/docs/api/getting-started is a walkthrough, not a summary', () => {
  it('renders code blocks at all — the card’s own criterion, as a floor', async () => {
    stubSpec(catalogueFixture)
    expect((await panes()).length).toBeGreaterThan(0)
  })

  it('carries a runnable request AND its response for all three cases', async () => {
    stubSpec(catalogueFixture)
    const all = (await panes()).join('\n')

    // 1 · a first authenticated call, and the body it answers with.
    expect(all).toContain('/api/v1/me')
    expect(all).toContain('"permissions": ["project:browse"]')

    // 2 · a paginated read — both pages, and the cursor that joins them.
    expect(all).toContain('limit=2')
    expect(all).toContain('cursor=$CURSOR')
    expect(all).toContain('"nextCursor"')

    // 3 · an error, as a real body a client would branch on.
    expect(all).toContain('"code": "WORK_ITEM_NOT_FOUND"')

    // …and the headers, read back, which is the step a reader skips until a
    // 429 arrives.
    expect(all).toContain('X-RateLimit-Reset')
    expect(all).toContain('X-Request-Id')
  })

  it('every curl is BUILT from the configured origin, never typed', async () => {
    // ⚠️ The negative half is what makes this meaningful: a hard-coded
    // `https://app.motir.co` would work perfectly in production and silently
    // point a preview build's reader at production data. In this lane the
    // configured origin is `vitest.config.mts`'s test value, so a typed
    // production URL fails here.
    stubSpec(catalogueFixture)
    const curls = (await panes()).filter((pane) => pane.includes('curl'))
    // Three: the first authenticated call, and the two pages of the paginated
    // read. The response bodies beside them are not requests and carry no URL.
    expect(curls.length).toBe(3)
    for (const pane of curls) {
      expect(pane, pane.slice(0, 48)).toContain(APP_ORIGIN)
    }

    const source = readFileSync(
      'app/docs/api/getting-started/page.tsx',
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '')
    expect(source).not.toContain('https://app.motir.co')
  })

  it('reads the contract version off the SERVED document', async () => {
    // The deleted page interpolated motir-core's own constant. This repository
    // cannot import it, and a committed number is stale exactly when it is
    // displayed — so it comes from `info.version`, through the memoized fetch
    // the layout already makes.
    stubSpec(catalogueFixture)
    const all = (await panes()).join('\n')
    expect(all).toContain('X-Motir-Api-Version:   9.9.9')
  })

  it('UNREACHABLE shows a placeholder, never an invented version', async () => {
    stubSpec({}, 503)
    const { container } = render(await GettingStartedPage())
    const all = [...container.querySelectorAll('pre')]
      .map((pane) => pane.textContent ?? '')
      .join('\n')
    expect(all).toContain('X-Motir-Api-Version:   <the contract version>')
    expect(all).not.toContain('9.9.9')
    // The walkthrough itself does not depend on the fetch and still renders.
    expect(all).toContain('/api/v1/me')
    expect(container.textContent).toContain(
      'The specification was unreachable when this page was rendered',
    )
  })

  it('keeps the five steps it had, in order', async () => {
    // The restore ADDS to the five-step spine rather than replacing it — the
    // page's structure was not the defect.
    stubSpec(catalogueFixture)
    const { container } = render(await GettingStartedPage())
    const headings = [...container.querySelectorAll('h2')].map(
      (heading) => heading.textContent ?? '',
    )
    expect(headings).toEqual([
      '1Mint a token',
      '2Your first authenticated call',
      '3Paginate a collection',
      '4Read an error',
      '5Read the response headers',
      'What next',
    ])
  })
})

describe('/docs/api/stability publishes BOTH halves of the promise', () => {
  it('states the client’s own obligations — the section that went missing', () => {
    const { container } = render(<StabilityPage />)
    const text = container.textContent ?? ''
    expect(text).toContain('Your side of the promise')
    expect(text).toMatch(/MUST tolerate unknown fields/)
    expect(text).toMatch(/MUST NOT\s*parse the human/)
  })

  it('states how a new major would arrive — `v2` appeared ZERO times before', () => {
    const { container } = render(<StabilityPage />)
    const text = container.textContent ?? ''
    expect(text).toContain('How a v2 would arrive')
    expect(text).toContain('served alongside v1')
    // The count, because the ledger's finding was a count.
    expect((text.match(/\bv2\b/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })

  it('renders all four sections, in the deleted page’s order', () => {
    const { container } = render(<StabilityPage />)
    expect(
      [...container.querySelectorAll('h2')].map((h) => h.textContent ?? ''),
    ).toEqual([
      'What v1 guarantees',
      'Your side of the promise',
      'Deprecation',
      'How a v2 would arrive',
    ])
  })

  it('publishes the two policy lists by MEMBERSHIP, not by summary', () => {
    /*
     * ⚠️ WHAT THIS CAN AND CANNOT CHECK, said plainly. motir-core's ADR §8 is
     * the INTERNAL record of the same promise, and over there a test held each
     * published sentence against its §8 bullet. That check cannot exist in
     * this lane: the ADR is in another repository and nothing here reaches it,
     * so a phrase-matching structure copied across would be a check that
     * cannot go red — which is worse than none, because it looks like one.
     *
     * What IS checkable here is that the published lists do not quietly move.
     * Silently adding a row to the additive list widens what may change under
     * a client without a version bump, and that is the edit worth failing on.
     */
    const { container } = render(<StabilityPage />)
    const text = container.textContent ?? ''

    expect(POLICY_ADDITIVE).toEqual([
      'A new endpoint.',
      'A new OPTIONAL query parameter.',
      'A new field on a response object.',
      'A new response header.',
      'A new value on a field documented as open-ended.',
      'A raised rate-limit budget.',
    ])
    expect(POLICY_FORBIDDEN).toEqual([
      'Removing a field.',
      'Renaming a field.',
      'Changing a field’s type or nullability.',
      'Removing or re-purposing an error `code`.',
      'Changing an existing status for an existing condition.',
      'Tightening a limit.',
      'Making an optional parameter required.',
    ])

    // …and every one of them actually reaches the page. A list nothing renders
    // is a constant, not a policy.
    for (const item of [...POLICY_ADDITIVE, ...POLICY_FORBIDDEN]) {
      expect(text, item).toContain(item.replaceAll('`', ''))
    }
  })
})
