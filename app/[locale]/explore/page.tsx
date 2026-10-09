import type { Metadata } from 'next'
import { format, getCopy, type Copy } from '@/lib/copy'
import { localePageMetadata, localizedPath } from '@/lib/localeMetadata'
import { siteUrl } from '@/lib/siteOrigin'
import { enterLocale, type LocaleParams } from '@/i18n/locale'
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
import { ExploreClose } from './_components/Close'
import { SiteShell } from '@/app/_components/SiteShell'
import { SITE_HOST } from '@/lib/publicHost'

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

/** The canonical path in English (cursor dropped — deep pages consolidate). */
function canonicalPath(query: ExploreQuery): string {
  return buildExploreHref(BASE, { ...query, cursor: undefined })
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: LocaleParams
  searchParams: Promise<RawSearchParams>
}): Promise<Metadata> {
  const query = parseExploreSearchParams(await searchParams)
  return localePageMetadata(params, canonicalPath(query), (copy) => ({
    title: copy.explore.metaTitle,
    description: copy.explore.metaDescription,
  }))
}

function galleryHeading(query: ExploreQuery, copy: Copy): string {
  if (query.search)
    return format(copy.explore.galleryHeadingSearch, { query: query.search })
  if (query.rank === 'popular') return copy.explore.galleryHeadingPopular
  if (query.rank === 'recent') return copy.explore.galleryHeadingNew
  return copy.explore.galleryHeadingTrending
}

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: LocaleParams
  searchParams: Promise<RawSearchParams>
}) {
  const locale = await enterLocale(params)
  const copy = await getCopy(locale)
  const query = parseExploreSearchParams(await searchParams)
  const { page, categories, failed } = await loadSquare(query)
  const heading = galleryHeading(query, copy)

  return (
    <SiteShell host={SITE_HOST} overlayHeader>
      <ExploreHero basePath={BASE} query={query} />
      <div className="mx-auto w-full max-w-[1400px] px-[clamp(16px,3vw,48px)] pb-[clamp(56px,7vw,112px)]">
        <div className="flex flex-col gap-4">
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
        <div className="mt-14">
          <ExploreFaq />
        </div>
        <div className="mt-6">
          <ExploreClose />
        </div>
      </div>
      <ExploreJsonLd
        pageUrl={siteUrl(localizedPath(locale, canonicalPath(query)))}
        name={copy.explore.metaTitle}
        description={copy.explore.metaDescription}
        cards={page?.items ?? []}
        faq={exploreFaqItems(copy)}
      />
    </SiteShell>
  )
}
