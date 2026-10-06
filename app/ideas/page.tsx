import type { Metadata } from 'next'
import { ArrowDown } from 'lucide-react'
import { cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { SITE_HOST } from '@/lib/publicHost'
import { SiteShell } from '../_components/SiteShell'
import { HeroBrief } from '../_components/landing/HeroBrief'
import { HeroWaves } from '../_components/landing/HeroWaves'
import {
  Eyebrow,
  GUTTER,
  H2,
  PointGrid,
  ProductClose,
} from '../products/_components/ProductPage'

/*
 * Ideas to build (2026-10 redesign) — the products Motir would buy. A
 * software company needs work no code covers: legal, finance, security,
 * support, languages, growth. Each idea here is one Motir needs itself (the
 * "why Motir needs it" line is Motir's real situation) and one thousands of
 * other companies need too, so it can scale — never an app for one person or
 * one firm's own process. Build one on Motir, and Motir is its first customer.
 * A second section offers directions Motir does NOT need, each researched
 * (2026-10-06): documented demand, the gap current players leave, and why now,
 * with the source of every figure linked. Only figures read in the source.
 *
 * Kept out of the index (`robots: noindex`) and the sitemap while it is in
 * review, like the product pages.
 */

const i = copy.ideas

export const metadata: Metadata = {
  title: i.metaTitle,
  description: i.metaDescription,
  robots: { index: false, follow: true },
}

const MONO = 'font-(family-name:--font-mono) tracking-[0.1em] uppercase'

/** Each tile's showcase field and the inks that read on it. */
const TONES = [
  {
    showcase: 'field',
    fill: 'bg-(--el-showcase-field) text-(--el-showcase-field-text) mk-halftone',
    soft: 'text-(--el-showcase-field-text)',
    rule: 'border-(--el-showcase-field-text)/30',
    mark: 'bg-(--el-showcase-field-text)',
  },
  {
    showcase: 'ground',
    fill: 'bg-(--el-showcase-ground) text-(--el-showcase-ground-text)',
    soft: 'text-(--el-showcase-ground-muted)',
    rule: 'border-(--el-showcase-ground-rule)',
    mark: 'bg-(--el-showcase-highlight)',
  },
  {
    showcase: 'wash',
    fill: 'bg-(--el-showcase-wash) text-(--el-showcase-text)',
    soft: 'text-(--el-showcase-text)',
    rule: 'border-(--el-showcase-rule)',
    mark: 'bg-(--el-showcase-field-ink)',
  },
] as const

/** Each direction's mark — one of the showcase fills, so a palette re-skins it. */
const MORE_MARK: Record<string, string> = {
  decision: 'bg-(--el-showcase-decision)',
  field: 'bg-(--el-showcase-field)',
  record: 'bg-(--el-showcase-record)',
  highlight: 'bg-(--el-showcase-highlight)',
}

export default function IdeasPage() {
  return (
    <SiteShell host={SITE_HOST} overlayHeader>
      <section
        aria-labelledby="ideas-h"
        className={cn(
          'relative isolate overflow-hidden pt-[calc(clamp(48px,6vw,96px)+4.75rem)] pb-[clamp(56px,7vw,112px)]',
          GUTTER,
        )}
      >
        <HeroWaves />
        <div className="mx-auto grid max-w-[1400px] items-center gap-x-[clamp(32px,5vw,80px)] gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="grid gap-6">
            <p
              className={cn(
                MONO,
                'm-0 flex items-center gap-2.5 text-[12px] text-(--el-text)',
              )}
            >
              <i
                aria-hidden="true"
                className="size-[10px] bg-(--el-showcase-highlight)"
              />
              {i.eyebrow}
            </p>
            <h1
              id="ideas-h"
              className="m-0 font-(family-name:--font-serif) text-[clamp(44px,6.2vw,96px)] leading-[0.92] font-bold tracking-[-0.045em] text-balance"
            >
              {i.headline}
            </h1>
            <p
              data-hero-lede=""
              className="m-0 max-w-[56ch] text-[clamp(17px,1.4vw,20px)] text-(--el-text-secondary)"
            >
              {i.lede}
            </p>
            <HeroBrief placeholder={i.placeholder} />
          </div>
          <div
            data-showcase="ground"
            data-tilt=""
            className="landing-art grid gap-5 rounded-(--radius-card) border border-(--el-border) bg-(--el-showcase-ground) p-[calc(var(--spacing-card-padding)*2)] text-(--el-showcase-ground-text) shadow-(--shadow-elevated)"
          >
            <p
              className={cn(MONO, 'm-0 flex items-center gap-2.5 text-[12px]')}
            >
              <i
                aria-hidden="true"
                className="size-[9px] bg-(--el-showcase-highlight)"
              />
              {i.promiseTitle}
            </p>
            <p className="m-0 max-w-[36ch] text-[clamp(20px,1.8vw,26px)] leading-[1.3]">
              {i.promiseBody}
            </p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {i.items.map((item, n) => (
                <li key={item.tab}>
                  <a
                    href={`#idea-${n + 1}`}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-(--radius-control) border border-(--el-showcase-ground-rule) px-(--spacing-control-x) py-(--spacing-control-y) text-[15px] text-(--el-showcase-ground-text) no-underline hover:border-(--el-showcase-highlight) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-showcase-highlight)"
                  >
                    <span
                      className={cn(
                        MONO,
                        'text-[11px] text-(--el-showcase-ground-muted)',
                      )}
                    >
                      {String(n + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 truncate">{item.tab}</span>
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="rules-h"
        className={cn('py-[clamp(40px,5vw,80px)]', GUTTER)}
      >
        <div className="mx-auto grid max-w-[1400px] gap-8">
          <div className="grid gap-5">
            <Eyebrow>{i.rulesEyebrow}</Eyebrow>
            <h2 id="rules-h" className={H2}>
              {i.rulesHeadline}
            </h2>
          </div>
          <PointGrid items={i.rules} />
        </div>
      </section>

      <section
        aria-labelledby="list-h"
        className={cn('py-[clamp(40px,5vw,80px)]', GUTTER)}
      >
        <div className="mx-auto grid max-w-[1400px] gap-8">
          <div className="grid gap-5">
            <Eyebrow>{i.listEyebrow}</Eyebrow>
            <h2 id="list-h" className={H2}>
              {i.listHeadline}
            </h2>
          </div>
          <ol className="m-0 grid list-none gap-5 p-0 lg:grid-cols-2">
            {i.items.map((item, n) => {
              const tone = TONES[n % TONES.length]
              return (
                <li
                  key={item.tab}
                  id={`idea-${n + 1}`}
                  data-showcase={tone.showcase}
                  data-tilt=""
                  className={cn(
                    'landing-art flex scroll-mt-6 flex-col gap-5 overflow-hidden rounded-(--radius-card) border border-(--el-border) p-[calc(var(--spacing-card-padding)*1.75)] shadow-(--shadow-card)',
                    tone.fill,
                  )}
                >
                  <p
                    className={cn(
                      MONO,
                      'm-0 flex items-center gap-2.5 text-[12px]',
                    )}
                  >
                    <i
                      aria-hidden="true"
                      className={cn('size-[9px]', tone.mark)}
                    />
                    {String(n + 1).padStart(2, '0')} · {item.tab}
                  </p>
                  <h3 className="m-0 font-(family-name:--font-serif) text-[clamp(26px,2.4vw,36px)] leading-[1.02] font-bold tracking-[-0.025em]">
                    {item.title}
                  </h3>
                  <p className={cn('m-0 text-[17px] leading-[1.5]', tone.soft)}>
                    {item.pitch}
                  </p>
                  <ul className="m-0 grid list-none gap-2 p-0 text-[15px] leading-[1.45]">
                    {item.does.map((line) => (
                      <li
                        key={line}
                        className="grid grid-cols-[14px_minmax(0,1fr)] gap-2.5"
                      >
                        <i
                          aria-hidden="true"
                          className={cn('mt-[7px] size-[7px]', tone.mark)}
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <dl
                    className={cn(
                      'mt-auto grid gap-3 border-t pt-5 text-[14.5px] leading-[1.5]',
                      tone.rule,
                    )}
                  >
                    <div>
                      <dt className={cn(MONO, 'text-[11px]')}>{i.needLabel}</dt>
                      <dd className={cn('m-0 mt-1', tone.soft)}>{item.need}</dd>
                    </div>
                    <div>
                      <dt className={cn(MONO, 'text-[11px]')}>{i.whoLabel}</dt>
                      <dd className={cn('m-0 mt-1', tone.soft)}>{item.who}</dd>
                    </div>
                  </dl>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="more-h"
        className={cn('py-[clamp(40px,5vw,80px)]', GUTTER)}
      >
        <div className="mx-auto grid max-w-[1400px] gap-8">
          <div className="grid gap-5">
            <Eyebrow>{i.more.eyebrow}</Eyebrow>
            <h2 id="more-h" className={H2}>
              {i.more.headline}
            </h2>
            <p className="m-0 max-w-[60ch] text-[18px] text-(--el-text-secondary)">
              {i.more.body}
            </p>
          </div>
          <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
            {i.more.ideas.map((idea) => (
              <li
                key={idea.title}
                data-surface="card"
                className="flex flex-col gap-3 rounded-(--radius-card) border border-(--el-border) bg-(--el-card) p-[calc(var(--spacing-card-padding)*1.25)] shadow-(--shadow-card)"
              >
                <p
                  className={cn(
                    MONO,
                    'm-0 flex items-center gap-2.5 text-[11px] text-(--el-text)',
                  )}
                >
                  <i
                    aria-hidden="true"
                    className={cn('size-[9px]', MORE_MARK[idea.mark])}
                  />
                  {idea.category}
                </p>
                <h3 className="m-0 text-[20px] leading-[1.2] font-semibold tracking-[-0.01em] text-(--el-text)">
                  {idea.title}
                </h3>
                <p className="m-0 text-[15px] leading-[1.5] text-(--el-text-secondary)">
                  {idea.pitch}
                </p>
                <dl className="mt-auto grid gap-3 border-t border-(--el-border) pt-4 text-[14px] leading-[1.5]">
                  <div>
                    <dt className={cn(MONO, 'text-[11px] text-(--el-text)')}>
                      {i.more.evidenceLabel}
                    </dt>
                    <dd className="m-0 mt-1 text-(--el-text-secondary)">
                      {idea.evidence}{' '}
                      <a
                        href={idea.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--el-accent-on-surface) underline underline-offset-2"
                      >
                        {idea.sourceName}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className={cn(MONO, 'text-[11px] text-(--el-text)')}>
                      {i.more.gapLabel}
                    </dt>
                    <dd className="m-0 mt-1 text-(--el-text-secondary)">
                      {idea.gap}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ProductClose headline={i.close.headline} body={i.close.body} />
    </SiteShell>
  )
}
