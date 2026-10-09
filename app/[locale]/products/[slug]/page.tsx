import { localizedPath } from '@/i18n/localizedPath'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@motir/design-system'
import { format, getCopy, type Copy } from '@/lib/copy'
import { localePageMetadata } from '@/lib/localeMetadata'
import {
  PRODUCT_DOCS,
  PRODUCT_SLUGS,
  SITE_ROOT,
  SIGN_UP,
  type ProductSlug,
} from '@/lib/destinations'
import { SITE_HOST } from '@/lib/publicHost'
import { SiteShell } from '../../../_components/SiteShell'
import { enterLocale } from '@/i18n/locale'

/*
 * A product's page (2026-10 redesign). The header's Products menu points at
 * one page per product; each will get its own design and copy. Until a page is
 * written, its route shows the product's name and its one line, with a way
 * into Motir — and it is kept out of the index (`robots: noindex`) and out of
 * the sitemap, because a placeholder is not a page a search result should land
 * on.
 */

const ITEM_KEY: Record<ProductSlug, keyof Copy['nav']['productItems']> = {
  'ai-planner': 'aiPlanner',
  'project-management': 'projectManagement',
  'project-manager': 'projectManager',
  'ai-debugging': 'aiDebugging',
  mcp: 'mcp',
  cli: 'cli',
  'claude-code-connector': 'claudeCodeConnector',
  'claude-code-plugin': 'claudeCodePlugin',
  'agent-fleet': 'agentFleet',
  'agent-hosting': 'agentHosting',
  sandbox: 'sandbox',
}

function productFor(slug: string, copy: Copy) {
  return (PRODUCT_SLUGS as readonly string[]).includes(slug)
    ? copy.nav.productItems[ITEM_KEY[slug as ProductSlug]]
    : null
}

/** Products whose page is written in full, at its own route. */
const WRITTEN: ReadonlySet<ProductSlug> = new Set([
  'ai-planner',
  'project-management',
  'ai-debugging',
  'agent-fleet',
  'agent-hosting',
])

/**
 * The placeholders, AND the tooling slugs that forward to their docs.
 *
 * ⚠️ THE FORWARDING SLUGS MUST BE LISTED. The locale layout sets
 * `dynamicParams = false`, which every segment below inherits, so a slug this
 * function does not name is a 404 without a render — `/products/mcp` stopped
 * reaching its redirect when the pages moved under `[locale]` (MOTIR-7948).
 * Named here, each is prerendered as its 308 to the docs (MOTIR-7971).
 */
export function generateStaticParams() {
  return PRODUCT_SLUGS.filter((slug) => !WRITTEN.has(slug)).map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const copy = await getCopy(await enterLocale(params))
  const product = productFor(slug, copy)
  if (!product) return {}
  return localePageMetadata(params, `/products/${slug}`, () => ({
    title: format(copy.products.metaTitle, { name: product.name }),
    description: product.blurb,
    robots: { index: false, follow: true },
  }))
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const locale = await enterLocale(params)
  const copy = await getCopy(locale)
  const { slug } = await params
  // The tooling's page is its documentation: its address forwards there.
  const docs = PRODUCT_DOCS[slug as ProductSlug]
  // To the docs in the SAME language: `/fr/products/mcp` → `/fr/docs/mcp` (MOTIR-7971).
  if (docs) permanentRedirect(localizedPath(locale, docs))
  const product = productFor(slug, copy)
  if (!product) notFound()

  return (
    <>
      <SiteShell host={SITE_HOST} className="bg-(--el-surface)">
        <section className="mx-auto grid max-w-[880px] gap-5 px-[clamp(16px,3vw,48px)] py-[clamp(72px,10vw,144px)]">
          <span className="font-(family-name:--font-mono) text-[12px] tracking-[0.1em] text-(--el-text-secondary) uppercase">
            {copy.products.eyebrow}
          </span>
          <h1 className="m-0 font-(family-name:--font-serif) text-[clamp(44px,7vw,104px)] leading-[0.92] font-bold tracking-[-0.045em]">
            {product.name}
          </h1>
          <p className="m-0 max-w-[40ch] text-[clamp(18px,1.6vw,22px)] text-(--el-text-secondary)">
            {product.blurb}
          </p>
          <p className="m-0 max-w-[52ch] text-[16px] text-(--el-text-secondary)">
            {copy.products.comingSoon}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href={SIGN_UP} className={buttonVariants()}>
              {copy.products.start}
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
            <Link
              href={localizedPath(locale, SITE_ROOT)}
              className={buttonVariants({ variant: 'ghost' })}
            >
              {copy.products.back}
            </Link>
          </div>
        </section>
      </SiteShell>
    </>
  )
}
