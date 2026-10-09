import { siteUrl } from '@/lib/siteOrigin'
import type { ProjectSquareCardDto } from '@/lib/explore'
import type { ExploreFaqItem } from './Faq'

/*
 * Server-rendered JSON-LD structured data for the project square (MOTIR-4045).
 * A `CollectionPage` whose `mainEntity` is an `ItemList` of `SoftwareApplication`
 * (one per visible card, linking to its public view at `/p/<key>`), a `FAQPage`
 * from the same Q/A the FAQ block renders, and — on a topic page — a
 * `BreadcrumbList`. Injected as a single `<script type="application/ld+json">`.
 */

export function ExploreJsonLd({
  pageUrl,
  name,
  description,
  cards,
  faq,
  breadcrumb,
}: {
  pageUrl: string
  name: string
  description: string
  cards: ProjectSquareCardDto[]
  faq: ExploreFaqItem[]
  breadcrumb?: { topicLabel: string; topicUrl: string; squareLabel: string }
}) {
  const origin = siteUrl('/')
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'CollectionPage',
      name,
      description,
      url: pageUrl,
      isPartOf: { '@type': 'WebSite', name: 'Motir', url: origin },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: cards.length,
        itemListElement: cards.map((card, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SoftwareApplication',
            name: card.name,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: siteUrl(`/p/${encodeURIComponent(card.identifier)}`),
            ...(card.description ? { description: card.description } : {}),
            ...(card.org.name
              ? { publisher: { '@type': 'Organization', name: card.org.name } }
              : {}),
          },
        })),
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  if (breadcrumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumb.squareLabel,
          item: siteUrl('/explore'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: breadcrumb.topicLabel,
          item: breadcrumb.topicUrl,
        },
      ],
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
