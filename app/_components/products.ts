import type { Copy } from '@/lib/copy'
import type { ProductSlug } from '@/lib/destinations'

/*
 * Motir's products, as the Products menu and the product pages show them
 * (2026-10 redesign): three groups — the AI products, the tooling that brings
 * Motir into the tools people already use, and the infrastructure agents run
 * on — each product with its name, its one line and its mark colour.
 */

export type ProductItem = { slug: ProductSlug; name: string; blurb: string }

type ItemKey = keyof Copy['nav']['productItems']

const GROUPS: ReadonlyArray<{
  label: keyof Copy['nav']['productGroups']
  items: ReadonlyArray<readonly [ProductSlug, ItemKey]>
}> = [
  {
    label: 'ai',
    items: [
      ['ai-planner', 'aiPlanner'],
      ['project-management', 'projectManagement'],
      ['project-manager', 'projectManager'],
      ['ai-debugging', 'aiDebugging'],
    ],
  },
  {
    label: 'tooling',
    items: [
      ['mcp', 'mcp'],
      ['cli', 'cli'],
      ['claude-code-connector', 'claudeCodeConnector'],
      ['claude-code-plugin', 'claudeCodePlugin'],
    ],
  },
  {
    label: 'infrastructure',
    items: [
      ['agent-fleet', 'agentFleet'],
      ['agent-hosting', 'agentHosting'],
      ['sandbox', 'sandbox'],
    ],
  },
]

/*
 * ⚠️ FUNCTIONS OF THE CATALOGUE, NOT CONSTANTS (MOTIR-7950). These were built
 * from the English object when the module loaded, which no locale can reach:
 * the Products menu would have stayed English on every page. The ORDER and the
 * grouping are fixed here; the words come from whichever `Copy` the caller
 * read (`useCopy()` or `getCopy(locale)`).
 */
export function productGroupsFor(copy: Copy): ReadonlyArray<{
  label: string
  items: ReadonlyArray<ProductItem>
}> {
  return GROUPS.map((group) => ({
    label: copy.nav.productGroups[group.label],
    items: group.items.map(([slug, key]) => ({
      slug,
      ...copy.nav.productItems[key],
    })),
  }))
}

export function productItemsFor(copy: Copy): ReadonlyArray<ProductItem> {
  return productGroupsFor(copy).flatMap((group) => group.items)
}

/** A product by its slug, with the label of the group it belongs to. */
export function productOf(
  slug: ProductSlug,
  copy: Copy,
): ProductItem & { group: string } {
  for (const group of productGroupsFor(copy)) {
    const found = group.items.find((product) => product.slug === slug)
    if (found) return { ...found, group: group.label }
  }
  throw new Error(`Unknown product: ${slug}`)
}

/**
 * Each product's mark colour — the small square beside its name in the
 * Products menu and on its own page. One design-system token per product
 * (`--el-product-<slug>`), so a palette re-skins every mark.
 */
export const PRODUCT_MARK: Record<ProductSlug, string> = {
  'ai-planner': 'bg-(--el-product-ai-planner)',
  'project-management': 'bg-(--el-product-project-management)',
  'project-manager': 'bg-(--el-product-project-manager)',
  'ai-debugging': 'bg-(--el-product-ai-debugging)',
  mcp: 'bg-(--el-product-mcp)',
  cli: 'bg-(--el-product-cli)',
  'claude-code-connector': 'bg-(--el-product-claude-code-connector)',
  'claude-code-plugin': 'bg-(--el-product-claude-code-plugin)',
  'agent-fleet': 'bg-(--el-product-agent-fleet)',
  'agent-hosting': 'bg-(--el-product-agent-hosting)',
  sandbox: 'bg-(--el-product-sandbox)',
}
