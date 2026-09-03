import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ProjectJsonLd } from '@/app/p/[identifier]/_components/JsonLd'
import type { PublicProjectOverviewDto } from '@/lib/publicProject'

/*
 * THE CANONICAL, AS RENDERED (MOTIR-4222's second criterion).
 *
 * ⚠️ FROM THE RENDERED VALUES, NOT FROM A SOURCE GREP, and the card asks for
 * that in terms. A grep proves a call site exists; it cannot prove the call was
 * given the right project, and "the canonical names the primary" is a claim
 * about the string a crawler reads.
 *
 * ⚠️ AND THE ANSWER IS THE SAME ON ALL THREE HOSTS, WHICH IS THE POINT. The
 * primary is a property of the PROJECT, so a page served at three addresses
 * emits ONE canonical — the case that would split one project into three
 * entities is the one where it varies.
 */

vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

const project = (primary: string): PublicProjectOverviewDto => ({
  id: 'proj_1',
  name: 'Prod',
  identifier: 'PROD',
  workspaceName: 'Acme',
  publicOverviewMd: null,
  publicTagline: 'A public plan.',
  publicTags: ['tooling'],
  stats: {
    publicRequests: 1,
    upvotes: 2,
    planned: 3,
    shipped: 4,
    inProgress: 5,
  },
  links: {},
  viewerCanManage: false,
  addresses: { primary, alternates: [] },
})

const PRIMARIES: Array<[string, string, string]> = [
  ['motir.co', 'https://motir.co/p/PROD', 'https://motir.co/p/PROD/board'],
  [
    'a workspace subdomain',
    'https://acme.motir.site/PROD',
    'https://acme.motir.site/PROD/board',
  ],
  [
    'a customer domain',
    'https://roadmap.acme.com',
    'https://roadmap.acme.com/board',
  ],
]

describe.each(PRIMARIES)(
  'a project whose primary is %s',
  (_label, primary, boardUrl) => {
    it('names it in the tab’s canonical AND og:url', async () => {
      const loadProject = vi.fn(async () => ({
        status: 'ok' as const,
        data: project(primary),
      }))
      vi.doMock('@/lib/publicProject', async (importOriginal) => ({
        ...(await importOriginal<typeof import('@/lib/publicProject')>()),
        loadProject,
      }))
      try {
        vi.resetModules()
        const { tabMetadata } =
          await import('@/app/p/[identifier]/_components/tabPage')
        const meta = await tabMetadata({
          identifier: 'PROD',
          segment: 'board',
          label: 'Board',
        })

        expect(meta.alternates?.canonical).toBe(boardUrl)
        expect(meta.openGraph?.url).toBe(boardUrl)
      } finally {
        vi.doUnmock('@/lib/publicProject')
        vi.resetModules()
      }
    })

    it('names it in every JSON-LD `@id` and `url`', () => {
      const { container } = render(<ProjectJsonLd project={project(primary)} />)
      const graph = JSON.parse(
        container.querySelector('script')!.innerHTML,
      ) as Record<string, unknown>

      expect(graph['@id']).toBe(primary)
      expect(graph['url']).toBe(primary)
      // `isPartOf` keeps naming motir.co: the WEBSITE a project is published on
      // is Motir whichever address it answers at, and that is a statement about
      // the publisher rather than about this document.
      expect((graph['isPartOf'] as { url: string }).url).toBe(
        'https://motir.co/',
      )
    })
  },
)
