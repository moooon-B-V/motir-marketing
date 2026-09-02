import { siteUrl } from '@/lib/siteOrigin'
import {
  deriveDescription,
  type PublicProjectOverviewDto,
} from '@/lib/publicProject'

/**
 * Structured data for a public project page (MOTIR-4115), in the shape
 * `app/explore/_components/JsonLd.tsx` established.
 *
 * ⚠️ EVERY `@id` AND `url` NAMES `SITE_ORIGIN`. `/explore`'s own `ItemList`
 * already points its entries at `siteUrl('/p/<identifier>')`, so this page is
 * the entity those list items reference — and a mismatch between the two would
 * split one project across two identities in a knowledge graph.
 *
 * `SoftwareApplication` rather than `WebPage`: it is the type `/explore` uses
 * for exactly these entries, and the subject of this page is the project, not
 * the document.
 */
export function ProjectJsonLd({
  project,
}: {
  project: PublicProjectOverviewDto
}) {
  const url = siteUrl(`/p/${encodeURIComponent(project.identifier)}`)
  const graph = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': url,
    url,
    name: project.name,
    applicationCategory: 'DeveloperApplication',
    description: deriveDescription(
      project.publicTagline ?? project.publicOverviewMd,
      `${project.name} — a public project plan on Motir.`,
    ),
    author: { '@type': 'Organization', name: project.workspaceName },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Motir',
      url: siteUrl('/'),
    },
    ...(project.publicTags.length > 0
      ? { keywords: project.publicTags.join(', ') }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      // The value is JSON we build here from typed fields, never markup from a
      // response — the same posture `/explore`'s JsonLd takes.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
