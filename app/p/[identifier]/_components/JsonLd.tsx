import { siteUrl } from '@/lib/siteOrigin'
import {
  deriveDescription,
  type PublicProjectOverviewDto,
} from '@/lib/publicProject'
import { publicUrlFor } from '@/lib/publicHost'

/**
 * Structured data for a public project page (MOTIR-4115), in the shape
 * `app/explore/_components/JsonLd.tsx` established.
 *
 * ⚠️ EVERY `@id` AND `url` NAMES THE PROJECT'S PRIMARY ADDRESS (MOTIR-4222).
 * It named `SITE_ORIGIN` while `motir.co` was the only address; now the same
 * document is served at up to three, and an `@id` that varied by host would
 * split ONE project into three entities in a knowledge graph — the failure this
 * whole card exists to prevent, in the one place where it is permanent.
 *
 * ⚠️ AND `/explore`'s `ItemList` STILL POINTS AT `motir.co/p/<identifier>`, ON
 * PURPOSE. That is an alternate address of the same entity, and the page-level
 * 301 carries a visitor from it to the primary — so the directory needs no
 * change and MOTIR-4222 does not touch it. A crawler that follows the list item
 * is redirected to this `@id`, which is how the two agree.
 *
 * `isPartOf` keeps naming `motir.co`: the WEBSITE a project is published on is
 * Motir whichever address it answers at, and that is a statement about the
 * publisher rather than about this document.
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
  const url = publicUrlFor(project)
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
