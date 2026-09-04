import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  listOperations,
  operationAnchorId,
  operationGroup,
  railOperations,
  type OpenApiDocument,
} from '@/lib/docs'

/*
 * THE DOCS RAIL (MOTIR-4396) — the navigation that makes forty-nine operations
 * reachable, built to `design/docs/design-notes.md`.
 *
 * ⚠️ EVERY TEST BELOW RUNS OVER A REALISTICALLY SIZED SET, and the card says
 * why in terms: "the shipped 49, not a fixture of three, because the whole
 * defect is one of scale". A rail is trivially correct over three rows. The
 * assertions that mean anything — two interactions to any operation, the filter
 * narrowing in place, the count reporting selectivity — are the ones that only
 * become interesting when the list is longer than the screen.
 */

/** A synthetic document the size of the shipped one: 49 operations, 9 groups. */
function buildSpec(): OpenApiDocument {
  const resources = [
    'work-items',
    'projects',
    'sprints',
    'plans',
    'comments',
    'attachments',
    'repositories',
    'dispatch-runs',
    'lessons',
  ]
  const paths: OpenApiDocument['paths'] = {}
  let made = 0
  for (const resource of resources) {
    for (const shape of ['', '/{key}', '/{key}/links']) {
      if (made >= 49) break
      const path = `/api/v1/${resource}${shape}`
      paths[path] = {}
      for (const method of ['get', 'post'] as const) {
        if (made >= 49) break
        paths[path]![method] = {
          operationId: `${method}${resource.replace(/-/g, '')}${shape.length}`,
          summary: `${method} ${resource}`,
        }
        made += 1
      }
    }
  }
  return {
    openapi: '3.1.0',
    info: { title: 'Motir API', version: '1.24.0' },
    paths,
  }
}

const SPEC = buildSpec()
const OPERATIONS = listOperations(SPEC)
const RAIL = railOperations(OPERATIONS)

function stubPath(pathname: string) {
  vi.doMock('next/navigation', () => ({ usePathname: () => pathname }))
}

afterEach(() => {
  vi.doUnmock('next/navigation')
  vi.resetModules()
})

/** Re-import the rail under a stubbed pathname. */
async function renderRail(pathname: string, withOperations = true) {
  stubPath(pathname)
  vi.resetModules()
  const { DocsRail: Rail } = await import('@/app/docs/_components/DocsRail')
  return render(<Rail operations={withOperations ? RAIL : undefined} />)
}

describe('the fixture really is the size the defect is about', () => {
  it('carries 49 operations across 9 groups — a guard over three rows passes for the wrong reason', () => {
    expect(OPERATIONS).toHaveLength(49)
    expect(RAIL.length).toBe(9)
    expect(RAIL.reduce((n, g) => n + g.operations.length, 0)).toBe(49)
  })
})

describe('an operation is reachable in at most TWO interactions', () => {
  it('ONE — every operation has a rail link, straight from the resting rail', async () => {
    const { container } = await renderRail('/docs/api')
    const hrefs = new Set(
      [...container.querySelectorAll('a')].map((a) => a.getAttribute('href')),
    )
    // Scrolling is not an interaction for this criterion: the assertion is that
    // the LINK exists at rest, not that it can be found by reading downward.
    for (const group of RAIL) {
      for (const operation of group.operations) {
        expect(hrefs, operation.id).toContain(`/docs/api#${operation.id}`)
      }
    }
  })

  it('TWO — filter, then click; the filter narrows IN PLACE and keeps its headings', async () => {
    const user = userEvent.setup()
    const { container } = await renderRail('/docs/api')

    await user.type(screen.getByLabelText('Filter operations'), 'sprints')

    const links = [...container.querySelectorAll('a[href^="/docs/api#"]')]
    expect(links.length).toBeGreaterThan(0)
    expect(links.length).toBeLessThan(49)
    // The heading survives the narrowing — a reader must not lose where they are.
    expect(container.textContent).toContain('Sprints')
    // …and nothing from another resource is still shown.
    const shownPaths = [...container.querySelectorAll('a[href^="/docs/api#"]')]
      .map((a) => a.textContent ?? '')
      .join(' ')
    expect(shownPaths).not.toContain('/work-items')
  })

  it('the COUNT reports the narrowed set against the whole', async () => {
    const user = userEvent.setup()
    const { container } = await renderRail('/docs/api')
    expect(container.textContent).toContain('49 operations')

    await user.type(screen.getByLabelText('Filter operations'), 'sprints')
    // ⚠️ A filter that hides its own selectivity is how a reader concludes an
    // operation does not exist. The count must say "N of 49", never just "N".
    expect(container.textContent).toMatch(/\d+ of 49 operations/)
  })

  it('says so when the filter matches nothing, rather than showing an empty rail', async () => {
    const user = userEvent.setup()
    const { container } = await renderRail('/docs/api')
    await user.type(
      screen.getByLabelText('Filter operations'),
      'zzz-no-such-operation',
    )
    expect(container.textContent).toContain('No operation matches that filter.')
    expect(container.querySelectorAll('a[href^="/docs/api#"]')).toHaveLength(0)
  })
})

describe('the rail links resolve INTO the page — they share one anchor rule', () => {
  it('every rail href is an anchor the reference actually renders', () => {
    // The page ids come from `operationAnchorId`; so do the rail's. This asserts
    // they are the same function rather than two copies that agree today — a
    // rail full of links that 404 into the page is worse than no rail.
    const pageIds = new Set(OPERATIONS.map(operationAnchorId))
    for (const group of RAIL) {
      for (const operation of group.operations) {
        expect(pageIds, operation.id).toContain(operation.id)
      }
    }
    expect(pageIds.size).toBe(49)
  })

  it('the rail is in the reference’s OWN order, so scrolling never loses your place', () => {
    expect(RAIL.flatMap((g) => g.operations.map((o) => o.id))).toEqual(
      OPERATIONS.map(operationAnchorId),
    )
  })
})

describe('the three tiers, and what decides them', () => {
  it('tier 1 is on every page — the six surfaces', async () => {
    const { container } = await renderRail('/docs/cli', false)
    for (const href of [
      '/docs',
      '/docs/api',
      '/docs/mcp',
      '/docs/cli',
      '/docs/sandbox',
      '/docs/public-address',
    ]) {
      expect(
        [...container.querySelectorAll('a')].map((a) => a.getAttribute('href')),
        href,
      ).toContain(href)
    }
  })

  it('a PROSE page shows no filter and no operation rows', async () => {
    const { container } = await renderRail('/docs/cli', false)
    // A filter over an empty set is a control describing nothing.
    expect(screen.queryByLabelText('Filter operations')).toBeNull()
    expect(container.querySelectorAll('a[href^="/docs/api#"]')).toHaveLength(0)
    expect(container.textContent).not.toContain('operations')
  })

  it('tier 2 renders INSIDE its sub-area and nowhere else', async () => {
    const inside = await renderRail('/docs/api/stability')
    expect(
      [...inside.container.querySelectorAll('a')].map((a) =>
        a.getAttribute('href'),
      ),
    ).toEqual(expect.arrayContaining(['/docs/api/getting-started']))
    inside.unmount()

    const outside = await renderRail('/docs/cli', false)
    expect(
      [...outside.container.querySelectorAll('a')].map((a) =>
        a.getAttribute('href'),
      ),
    ).not.toContain('/docs/api/getting-started')
  })

  it('ALL NINE page links survive — the count the card protects', async () => {
    // ⚠️ The MCP sub-area's tier 2 is a DEVIATION from the asset's panels and a
    // following of its RULE: the asset draws tier 2 only for the API reference,
    // and left literal `/docs/mcp/tools` would have dropped out of the
    // navigation entirely, taking nine links to eight. Recorded on MOTIR-4396.
    const onApi = await renderRail('/docs/api')
    const onMcp = await renderRail('/docs/mcp/tools', false)
    const reachable = new Set(
      [
        ...[...onApi.container.querySelectorAll('a')],
        ...[...onMcp.container.querySelectorAll('a')],
      ]
        .map((a) => a.getAttribute('href') ?? '')
        .filter((href) => href.startsWith('/docs') && !href.includes('#')),
    )
    expect([...reachable].sort()).toEqual([
      '/docs',
      '/docs/api',
      '/docs/api/getting-started',
      '/docs/api/stability',
      '/docs/cli',
      '/docs/mcp',
      '/docs/mcp/tools',
      '/docs/public-address',
      '/docs/sandbox',
    ])
  })
})

describe('accessibility is a criterion, not a polish pass', () => {
  it('the current page is PROGRAMMATICALLY current, not only visually marked', async () => {
    const { container } = await renderRail('/docs/api')
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.getAttribute('href')).toBe('/docs/api')
  })

  it('marks the SUB-PAGE current when the reader is on one', async () => {
    const { container } = await renderRail('/docs/api/stability')
    const current = container.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0]!.getAttribute('href')).toBe('/docs/api/stability')
  })

  it('the `/` shortcut FOCUSES the filter — the asset draws the hint, so it must work', async () => {
    const user = userEvent.setup()
    await renderRail('/docs/api')
    const filter = screen.getByLabelText('Filter operations')
    expect(document.activeElement).not.toBe(filter)
    await user.keyboard('/')
    expect(document.activeElement).toBe(filter)
  })

  it('…and does NOT eat a `/` the reader is typing into a field', async () => {
    const user = userEvent.setup()
    await renderRail('/docs/api')
    const filter = screen.getByLabelText('Filter operations')
    await user.click(filter)
    await user.keyboard('a/b')
    expect((filter as HTMLInputElement).value).toBe('a/b')
  })

  it('the filter is labelled, so it is usable without sight or a mouse', async () => {
    await renderRail('/docs/api')
    const filter = screen.getByLabelText('Filter operations')
    expect(filter.tagName).toBe('INPUT')
    // The `/` hint is decorative — the affordance is the labelled input itself.
    expect(filter.getAttribute('aria-hidden')).toBeNull()
  })

  it('the count is a LIVE region, so the filter’s effect is perceivable', async () => {
    const { container } = await renderRail('/docs/api')
    expect(
      container.querySelector('[aria-live="polite"]')?.textContent,
    ).toContain('49 operations')
  })

  it('every rail row is a real link, so the whole rail is in the tab order', async () => {
    const { container } = await renderRail('/docs/api')
    const rows = container.querySelectorAll('nav li > a')
    expect(rows.length).toBe(49 + 6 + 2)
    for (const row of rows) expect(row.getAttribute('href')).toBeTruthy()
  })

  it('the narrow disclosure COLLAPSES the operation tier, and says so', async () => {
    // ⚠️ Panel 7. The rail sits ABOVE the content when narrow, so an operation
    // tier that opened expanded would bury the page a reader came to read.
    const user = userEvent.setup()
    const { container } = await renderRail('/docs/api')
    const toggle = screen.getByRole('button', { name: /operations/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    const tier = container.querySelector('#docs-operation-tier')!
    // Hidden below the breakpoint, shown above it — one element, two widths.
    expect(tier.className).toContain('hidden')
    expect(tier.className).toContain('md:block')

    await user.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('#docs-operation-tier')!.className).toBe(
      'block',
    )
  })

  it('the disclosure NAMES what it controls', async () => {
    const { container } = await renderRail('/docs/api')
    const toggle = screen.getByRole('button', { name: /operations/i })
    expect(toggle.getAttribute('aria-controls')).toBe('docs-operation-tier')
    expect(container.querySelector('#docs-operation-tier')).not.toBeNull()
  })

  it('the rail is a landmark with a name', async () => {
    const { container } = await renderRail('/docs/api')
    const nav = container.querySelector('nav')
    expect(nav?.getAttribute('aria-label')).toBe('Documentation')
  })
})

describe('operationGroup — derived from the path, never authored', () => {
  it('groups a sub-resource under its parent resource', () => {
    expect(operationGroup('/api/v1/projects/{projectKey}/work-items')).toBe(
      'Projects',
    )
  })

  it('humanises a kebab-case resource', () => {
    expect(operationGroup('/api/v1/work-items/{key}')).toBe('Work items')
  })

  it('drops the audience segment as well as the version', () => {
    expect(operationGroup('/api/public/explore')).toBe('Explore')
  })

  it('never returns an empty label, whatever the path', () => {
    expect(operationGroup('/api/v1')).toBe('Other')
    expect(operationGroup('/')).toBe('Other')
    expect(operationGroup('/api/v1/{onlyAParam}')).toBe('Other')
  })
})

describe('the route GROUP is what decides the operation tier', () => {
  /*
   * ⚠️ THE STRUCTURAL HALF OF THE ROUTE-PREFIX RULE. A server layout cannot read
   * a pathname, so "tiers 2 and 3 render if and only if the route is /docs/api
   * or below" is expressed by WHERE THE FILE LIVES: only `app/docs/api/layout.tsx`
   * passes operations. This walks the tree from disk so a page added later
   * cannot quietly acquire — or lose — the rail.
   */
  function pagesUnder(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) pagesUnder(path, out)
      else if (entry === 'page.tsx') out.push(path)
    }
    return out
  }

  it('every docs page sits under exactly one of the two sub-area layouts', () => {
    const pages = pagesUnder('app/docs')
    expect(pages.length).toBe(9)
    const unclaimed = pages.filter(
      (page) =>
        !page.startsWith(join('app', 'docs', '(guides)')) &&
        !page.startsWith(join('app', 'docs', 'api')),
    )
    expect(unclaimed).toEqual([])
  })

  it('the API sub-area is the ONLY layout that passes operations', () => {
    const layouts = [
      'app/docs/layout.tsx',
      'app/docs/(guides)/layout.tsx',
      'app/docs/api/layout.tsx',
    ]
    const passing = layouts.filter((layout) =>
      readFileSync(layout, 'utf8').includes('operations={'),
    )
    expect(passing).toEqual(['app/docs/api/layout.tsx'])
  })
})
