import type { Metadata } from 'next'
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
import { ExploreHero } from './_components/Hero'
import { RankTabs } from './_components/RankTabs'
import { CategoryFilter } from './_components/CategoryFilter'
import { ActiveFilters } from './_components/ActiveFilters'
import { ExploreGallery } from './_components/Gallery'
import { CategoriesBrowse } from './_components/CategoriesBrowse'
import { ExploreFaq, exploreFaqItems } from './_components/Faq'
import { ExploreJsonLd } from './_components/JsonLd'

/*
 * The PROJECT SQUARE (MOTIR-4045) — the fully-public, server-rendered, crawlable
 * `/explore` page on motir.co. Reads THROUGH motir-core's public API
 * (`/api/public/explore` + `/categories`), never the database. Every navigable
 * state (rank tab, window, search, topic, cursor) is a real crawlable URL param.
 *
 * ⚠️ DYNAMIC — the square ranks by recent activity, so a copy frozen at build
 * time would serve a stale leaderboard.
 */
export const dynamic = 'force-dynamic'

const BASE = '/explore'

/** Absolute canonical URL (cursor dropped — deep pages consolidate). */
function canonicalUrl(query: ExploreQuery): string {
  return siteUrl(buildExploreHref(BASE, { ...query, cursor: undefined }))
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}): Promise<Metadata> {
  const query = parseExploreSearchParams(await searchParams)
  const url = canonicalUrl(query)
  return {
    title: copy.explore.metaTitle,
    description: copy.explore.metaDescription,
    alternates: { canonical: url },
  }
}

function galleryHeading(query: ExploreQuery): string {
  if (query.search)
    return format(copy.explore.galleryHeadingSearch, { query: query.search })
  if (query.rank === 'popular') return copy.explore.galleryHeadingPopular
  if (query.rank === 'recent') return copy.explore.galleryHeadingNew
  return copy.explore.galleryHeadingTrending
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const query = parseExploreSearchParams(await searchParams)
  const { page, categories, failed } = await loadSquare(query)
  const heading = galleryHeading(query)

  return (
    <>
      <ExploreHero basePath={BASE} query={query} />

      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <RankTabs basePath={BASE} query={query} />
          <CategoryFilter
            basePath={BASE}
            query={query}
            categories={categories}
          />
        </div>
        <ActiveFilters
          basePath={BASE}
          query={query}
          categoryLabel={categoryLabel(categories, query.category ?? '')}
        />
      </div>

      <div className="mt-6">
        <ExploreGallery
          basePath={BASE}
          query={query}
          page={page}
          heading={heading}
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
        pageUrl={canonicalUrl(query)}
        name={copy.explore.metaTitle}
        description={copy.explore.metaDescription}
        cards={page?.items ?? []}
        faq={exploreFaqItems()}
      />
    </>
  )
}
