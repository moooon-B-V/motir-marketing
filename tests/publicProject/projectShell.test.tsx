import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SITE_ORIGIN } from '@/lib/siteOrigin'
import { APP_ORIGIN } from '@/lib/appOrigin'
import type { PublicProjectOverviewDto } from '@/lib/publicProject'
import { ProjectHeader } from '@/app/p/[identifier]/_components/ProjectHeader'
import { ProjectJsonLd } from '@/app/p/[identifier]/_components/JsonLd'
import { EmptyState, ErrorState } from '@/app/p/[identifier]/_components/States'

/*
 * The `/p/*` SHELL (MOTIR-4115) — the hero, the tab bar, the entity signal and
 * the three states, built to `design/public-projects/`.
 */

const project: PublicProjectOverviewDto = {
  id: 'proj_1',
  name: 'Motir',
  identifier: 'MOTIR',
  workspaceName: 'moooon B.V.',
  publicOverviewMd: '## What Motir is\n\nA planning platform.',
  publicTagline: 'AI planning, project management and agent orchestration.',
  publicTags: ['developer-tools', 'open-source'],
  stats: {
    publicRequests: 128,
    upvotes: 1204,
    planned: 37,
    shipped: 311,
    inProgress: 6,
  },
  links: {},
  viewerCanManage: false,
  addresses: { primary: 'https://motir.co/p/MOTIR', alternates: [] },
}

describe('the hero', () => {
  it('renders the name, the workspace, the tagline and the tags', () => {
    render(<ProjectHeader project={project} current="" />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Motir' }),
    ).toBeVisible()
    expect(screen.getByText('moooon B.V.')).toBeVisible()
    expect(screen.getByText(/AI planning, project management/)).toBeVisible()
    expect(screen.getByText('developer-tools')).toBeVisible()
  })

  it('formats the stat figures for a reader — 1204 is 1,204', () => {
    render(<ProjectHeader project={project} current="" />)

    expect(screen.getByText('1,204')).toBeVisible()
  })

  it('omits the tagline and the tag list rather than rendering empty shells', () => {
    render(
      <ProjectHeader
        project={{ ...project, publicTagline: null, publicTags: [] }}
        current=""
      />,
    )

    expect(screen.queryByText(/AI planning, project management/)).toBeNull()
    expect(screen.queryByText('developer-tools')).toBeNull()
  })

  it('shows NO account menu and NO edit affordance — AMENDMENT 4 rows 1 and 7', () => {
    // Both are ABSENT by decision, not by omission: a cross-origin page cannot
    // compute who is looking, and `viewerCanManage` is structurally false here.
    // A regression that added either would be drawing a state this host cannot
    // reach, so it is asserted rather than left to review.
    const { container } = render(
      <ProjectHeader
        project={{ ...project, viewerCanManage: true }}
        current=""
      />,
    )

    expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()
    expect(
      screen.queryByRole('link', { name: /account|sign out|profile/i }),
    ).toBeNull()
    expect(container.textContent).not.toMatch(/\bEdit\b/)
  })
})

describe('the tab bar', () => {
  it('renders all six destinations as links', () => {
    render(<ProjectHeader project={project} current="" />)

    const nav = screen.getByRole('navigation', { name: 'Project' })
    for (const label of [
      'Overview',
      'Board',
      'Items',
      'Tree',
      'Roadmap',
      'Changelog',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(nav).toBeVisible()
  })

  it('marks the CURRENT tab, and only that one', () => {
    render(<ProjectHeader project={project} current="roadmap" />)

    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page')

    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('Roadmap')
  })

  it('marks Overview current on the Overview itself', () => {
    render(<ProjectHeader project={project} current="" />)

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('points every tab at this project', () => {
    render(<ProjectHeader project={project} current="" />)

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/p/MOTIR',
    )
    expect(screen.getByRole('link', { name: 'Board' })).toHaveAttribute(
      'href',
      '/p/MOTIR/board',
    )
  })
})

describe('the entity signal', () => {
  const graphOf = () => {
    const { container } = render(<ProjectJsonLd project={project} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    return JSON.parse(script?.textContent ?? '{}') as Record<string, unknown>
  }

  it('names SITE_ORIGIN in `@id` and `url` — never APP_ORIGIN', () => {
    // The whole point of the move: this host owns the canonical. Getting it
    // backwards is silent in production and splits one project across two
    // identities in a knowledge graph, because /explore's ItemList already
    // points its entries at siteUrl('/p/<identifier>').
    const graph = graphOf()

    expect(graph['@id']).toBe(`${SITE_ORIGIN}/p/MOTIR`)
    expect(graph['url']).toBe(`${SITE_ORIGIN}/p/MOTIR`)
    expect(JSON.stringify(graph)).not.toContain(APP_ORIGIN)
  })

  it('carries the project as the subject, and its workspace as the author', () => {
    const graph = graphOf()

    expect(graph['@type']).toBe('SoftwareApplication')
    expect(graph['name']).toBe('Motir')
    expect(graph['author']).toMatchObject({ name: 'moooon B.V.' })
  })

  it('describes the project from its authored text, with no Markdown in it', () => {
    const graph = graphOf()

    expect(String(graph['description'])).not.toContain('##')
  })
})

describe('the three states', () => {
  it('the EMPTY state says the project exists and points at the tabs', () => {
    render(
      <EmptyState title="No overview yet">The tabs are the work.</EmptyState>,
    )

    expect(screen.getByText('No overview yet')).toBeVisible()
  })

  it('the ERROR state NAMES the other host, and is announced', () => {
    // "Something went wrong" on a page that otherwise looks fine is the least
    // actionable message a visitor can be given. §8 cost 1 is why this state
    // exists at all, and naming the separate deployment is what makes it honest.
    render(<ErrorState what="this project's board" identifier="MOTIR" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('app.motir.co')
    expect(alert).toHaveTextContent(/could not load this project's board/i)
  })

  it('the ERROR state offers the one route that does NOT depend on the failing hop', () => {
    render(<ErrorState what="this project's board" identifier="MOTIR" />)

    expect(
      screen.getByRole('link', { name: /changelog feed/i }),
    ).toHaveAttribute('href', '/p/MOTIR/changelog.xml')
  })

  it('the ERROR state does NOT claim the project is missing', () => {
    // The failure this split exists to prevent: telling a visitor the project
    // was deleted every time motir-core restarts.
    render(<ErrorState what="this project" />)

    expect(screen.getByRole('alert').textContent).not.toMatch(
      /not found|does not exist|deleted/i,
    )
  })
})
