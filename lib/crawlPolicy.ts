/*
 * What crawlers are asked to skip on motir.co, and who is turned away.
 *
 * ⚠️ THE FILTER URLS ARE A CRAWL TRAP, AND THAT IS WHAT THIS MODULE CLOSES.
 * `/explore` and `/ideas` render every filter state as a real link —
 * `/ideas?category=…&tag=…&idea=…` composes 25 categories × 19 tags × 40 ideas
 * across eleven locales — and every one of those addresses renders at request
 * time and reads motir-core. Before launch, with no visitors, the site served
 * ~130k requests in 48 h (Fly edge metrics, 2026-10-17/18), almost all from
 * cloud regions, and a crawl of the `/p/*` social cards ran both machines out
 * of memory (`app/_brand/ogRenderGate.ts`). A crawl spent there indexes
 * nothing worth indexing: `/ideas` is `noindex`, and an `/explore` filter
 * state is the same square re-sorted. The pages that should rank are the
 * plain ones and `/explore/topic/<slug>`, which stay open.
 *
 * Three layers, each for a different crawler:
 *  - `robots.txt` disallows the filter URLs ({@link FILTER_DISALLOW}) — the
 *    crawlers that obey it (Google, Bing, the AI crawlers) stop there;
 *  - the filter links carry `rel="nofollow"` ({@link filterLinkRel}), so a
 *    crawler that reads the page is not invited down them either;
 *  - the canonical of an `/explore` filter state is the unfiltered page.
 *
 * ⚠️ ONLY QUERY STRINGS ON THE TWO FILTER SURFACES — NOT `/*?`. A blanket
 * `Disallow: /*?` would also block `/_next/image?url=…` and the hashed icon
 * addresses (`/icon.svg?…`), and Google renders a page with its images and
 * icons: blocking them makes the page it indexes a broken one.
 */

/** The `robots.txt` disallow lines for the filter URLs, in every locale. */
export const FILTER_DISALLOW: readonly string[] = [
  '/explore?',
  '/*/explore?',
  '/explore/topic/*?',
  '/*/explore/topic/*?',
  '/ideas?',
  '/*/ideas?',
]

/**
 * `rel` for a link on a filter surface: `nofollow` when it carries a query
 * string, nothing when it is a plain page. One rule, so a new filter link
 * cannot forget it and a plain link is never marked.
 */
export function filterLinkRel(href: string): 'nofollow' | undefined {
  return href.includes('?') ? 'nofollow' : undefined
}

/*
 * ⚠️ CRAWLERS WITH NOTHING TO GIVE THE SITE, TURNED AWAY. SEO-tool and bulk
 * scrapers: they do not send visitors, they sell this site's link graph to
 * third parties, and they crawl hardest. They are named in `robots.txt` with
 * `Disallow: /`, and `proxy.ts` ALSO answers them 403 — the same list —
 * because the costliest of them (Bytespider) is documented as ignoring
 * `robots.txt`, and an answer that depends on the crawler's manners is no
 * answer.
 *
 * NOT ON THE LIST, deliberately: search engines (Googlebot, Bingbot,
 * DuckDuckBot, Applebot, YandexBot) and the AI assistants' crawlers (GPTBot,
 * OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended) — a developer tool
 * being an answer in an assistant is marketing, not a cost.
 *
 * TRIGGER to revise: running Ahrefs or Semrush against the site ourselves —
 * both crawl as these agents, and the audit would be refused.
 */
export const REFUSED_CRAWLERS: readonly string[] = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'BLEXBot',
  'DataForSeoBot',
  'Bytespider',
  'PetalBot',
]

const REFUSED = new RegExp(REFUSED_CRAWLERS.join('|'), 'i')

/** Whether a user agent is one of {@link REFUSED_CRAWLERS}. */
export function isRefusedCrawler(userAgent: string | null): boolean {
  return userAgent !== null && REFUSED.test(userAgent)
}
