import type { Metadata } from 'next'
import { copy, format } from '@/lib/copy'
import { SITE_HOST } from '@/lib/publicHost'
import { SiteShell } from '../../_components/SiteShell'
import { productOf } from '../../_components/products'
import {
  PointGrid,
  ProductClose,
  ProductHero,
  ProductSection,
  WorksWith,
} from '../_components/ProductPage'
import { LessonsArt } from '../_components/PlannerArt'
import { PlannerChatUi, PlannerWorkspaceUi } from '../_components/PlannerUi'

/*
 * Motir AI Planner's page (2026-10 redesign) — the first product page written
 * in full; the other products keep the placeholder at `/products/[slug]` until
 * theirs is. The page follows the planner's own order: the idea goes in, the
 * planner works it through with you, you approve, and the plan holds what the
 * work needs — then the learning loop that makes the next plan better.
 *
 * Kept out of the index (`robots: noindex`) and the sitemap while it is in
 * review, like the placeholders.
 */

const p = copy.products.aiPlanner
const product = productOf('ai-planner')

export const metadata: Metadata = {
  title: format(copy.products.metaTitle, { name: product.name }),
  description: p.metaDescription,
  robots: { index: false, follow: true },
}

export default function AiPlannerPage() {
  return (
    <SiteShell host={SITE_HOST} overlayHeader>
      <ProductHero
        slug="ai-planner"
        headline={p.headline}
        lede={p.lede}
        art={<PlannerChatUi />}
      />
      <ProductSection
        id="steps"
        eyebrow={p.steps.eyebrow}
        headline={p.steps.headline}
      >
        <PointGrid items={p.steps.items} numbered />
      </ProductSection>
      <ProductSection
        id="gate"
        eyebrow={p.gate.eyebrow}
        headline={p.gate.headline}
        body={p.gate.body}
      >
        <PlannerWorkspaceUi />
      </ProductSection>
      <ProductSection
        id="holds"
        eyebrow={p.holds.eyebrow}
        headline={p.holds.headline}
      >
        <PointGrid items={p.holds.items} />
      </ProductSection>
      <ProductSection
        id="learns"
        eyebrow={p.learns.eyebrow}
        headline={p.learns.headline}
        body={p.learns.body}
        art={<LessonsArt />}
        flip
      />
      <WorksWith
        slugs={['project-management', 'project-manager', 'agent-fleet']}
      />
      <ProductClose headline={p.close.headline} body={p.close.body} />
    </SiteShell>
  )
}
