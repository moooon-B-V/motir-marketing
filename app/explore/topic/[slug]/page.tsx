import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { copy, format } from '@/lib/copy'
import { siteUrl } from '@/lib/siteOrigin'
import {
  buildExploreHref,
  categoryLabel,
  loadSquare,
  parseExploreSearchParams,
  type ExploreQuery,
  type RawSearchParams,
} from '@/lib/explore'
import { ExploreSearchForm } from '../../_components/SearchForm'
import { RankTabs } from '../../_components/RankTabs'
import { ActiveFilters } from '../../_components/ActiveFilters'
import { ExploreGallery } from '../../_components/Gallery'
import { CategoriesBrowse } from '../../_components/CategoriesBrowse'
import { ExploreFaq, exploreFaqItems } from '../../_components/Faq'
import { ExploreJsonLd } from '../../_components/JsonLd'

/*
 * A per-topic landing page (MOTIR-4045) — the same square narrowed to one topic
 * (`category = slug`, carried in the PATH not a query param), with its own <h1>,
 * a breadcrumb, and a BreadcrumbList JSON-LD. An unknown topic slug 404s when
 * the API lists categories and none matches.
 */
export const dynamic = 'force-dynamic'

function basePathFor(slug: string): string {
  return `/explore/topic/${slug}`
}

function topicQuery(slug: string, raw: RawSearchParams): ExploreQuery {
  return parseExploreSearchParams(raw, { category: slug })
}

function canonicalUrl(slug: string, query: ExploreQuery): string {
  return siteUrl(
    buildExploreHref(basePathFor(slug), {
      ...query,
      category: undefined,
      cursor: undefined,
    }),
  )
}

function galleryHeading(query: ExploreQuery, label: string): string {
  if (query.search)
    return format(copy.explore.galleryHeadingSearch, { query: query.search })
  return `${label} projects`
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<RawSearchParams>
}) {
  const { slug } = await params
  const query = topicQuery(slug, await searchParams)
  const { page, categories, failed } = await loadSquare(query)

  // A topic page 404s an unknown slug — but only when the API reached us and
  // named its categories; an unreachable API renders the error state, not a 404.
  if (!failed) {
    const label = categoryLabel(categories, slug)
    if (!label) notFound()
  }

  const label = categoryLabel(categories, slug) ?? slug

  return (
    <>
      <nav
        aria-label="Project square"
        className="mb-4 flex items-center gap-1 text-[13px]"
      >
        <Link
          href="/explore"
          className="text-(--el-text-secondary) hover:text-(--el-link)"
        >
          {copy.explore.heroEyebrow}
        </Link>
        <ChevronRight className="h-3 w-3 text-(--el-text-faint)" aria-hidden />
        <span className="font-medium text-(--el-text)">{label}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-(family-name:--font-serif) text-3xl font-semibold tracking-tight text-(--el-text)">
          {label} projects
        </h1>
        <p className="mt-2 max-w-[40rem] text-[14px] text-(--el-text-secondary)">
          {format(copy.explore.metaDescriptionTopic, { topic: label })}
        </p>
        <div className="mt-4 w-full max-w-[34rem]">
          <ExploreSearchForm
            basePath={basePathFor(slug)}
            query={query}
            preserveCategory={false}
          />
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <RankTabs basePath={basePathFor(slug)} query={query} />
        <ActiveFilters
          basePath={basePathFor(slug)}
          query={query}
          categoryLabel={label}
        />
      </div>

      <div className="mt-6">
        <ExploreGallery
          basePath={basePathFor(slug)}
          query={query}
          page={page}
          heading={galleryHeading(query, label)}
        />
      </div>

      {!failed ? (
        <div className="mt-14 border-t border-(--el-border) pt-10">
          <CategoriesBrowse categories={categories} />
        </div>
      ) : null}

      <div className="mt-10">
        <ExploreFaq />
      </div>

      <ExploreJsonLd
        pageUrl={canonicalUrl(slug, query)}
        name={`${label} projects`}
        description={format(copy.explore.metaDescriptionTopic, {
          topic: label,
        })}
        cards={page?.items ?? []}
        faq={exploreFaqItems()}
        breadcrumb={{
          topicLabel: label,
          topicUrl: siteUrl(basePathFor(slug)),
          squareLabel: copy.explore.heroEyebrow,
        }}
      />
    </>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<RawSearchParams>
}): Promise<Metadata> {
  const { slug } = await params
  const query = topicQuery(slug, await searchParams)
  const { categories, failed } = await loadSquare(query)
  const label = (failed ? undefined : categoryLabel(categories, slug)) ?? slug
  return {
    title: format(copy.explore.metaTitleTopic, { topic: label }),
    description: format(copy.explore.metaDescriptionTopic, { topic: label }),
    alternates: { canonical: canonicalUrl(slug, query) },
  }
}
