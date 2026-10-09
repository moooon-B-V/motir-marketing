import { localizedPath } from '@/i18n/localizedPath'
import { ArrowRight } from 'lucide-react'
import { cn } from '@motir/design-system'
import { format, useCopy, usePageLocale } from '@/lib/copy'
import {
  hasText,
  ideaCategoryMark,
  ideaFieldLang,
  ideaTextLang,
  ideasHref,
  type IdeaMark,
  type IdeasParams,
  type PublicIdeaDto,
} from '@/lib/ideas'
import { OpenIdeaLink } from './IdeasNav'

/*
 * The two idea cards (MOTIR-7687): the Motir-would-buy tone card and the
 * direction card, both the shipped shapes from the 2026-10 redesign, now filled
 * from the store. A card's title is a link to the same view with `idea=<slug>`
 * whose `::after` stretches over the whole card, so the card opens the idea in
 * place; a source link inside sits above that stretch.
 *
 * Every piece of the idea's own text takes `lang="en"` when the store served it
 * in English on a page in another language (`ideaFieldLang` / `ideaTextLang`,
 * Story MOTIR-7772 · MOTIR-7777), on the element that holds that text alone.
 */

export const MONO = 'font-(family-name:--font-mono) tracking-[0.1em] uppercase'

const STRETCH =
  'no-underline text-[inherit] after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-(--focus-ring-color)'

/** Each band card's showcase field and the inks that read on it. */
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

/** A category's colour mark — one of the showcase fills, by its group. */
const MARK_FILL: Record<IdeaMark, string> = {
  field: 'bg-(--el-showcase-field)',
  decision: 'bg-(--el-showcase-decision)',
  record: 'bg-(--el-showcase-record)',
  ground: 'bg-(--el-showcase-ground)',
}

export function CategoryMark({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  return (
    <i
      aria-hidden="true"
      data-mark={ideaCategoryMark(slug)}
      className={cn(
        'size-[9px] flex-none',
        MARK_FILL[ideaCategoryMark(slug)],
        className,
      )}
    />
  )
}

function OpenFoot({ className }: { className?: string }) {
  const i = useCopy().ideas
  return (
    <span
      aria-hidden="true"
      className={cn(
        MONO,
        'mt-auto flex items-center justify-end gap-1.5 text-[11px]',
        className,
      )}
    >
      {i.card.open}
      <ArrowRight className="size-3.5" />
    </span>
  )
}

export function BuyCard({
  idea,
  index,
  params,
}: {
  idea: PublicIdeaDto
  index: number
  params: IdeasParams
}) {
  const i = useCopy().ideas
  const locale = usePageLocale()
  const tone = TONES[index % TONES.length]
  return (
    <li
      id={`idea-${idea.slug}`}
      data-showcase={tone.showcase}
      className={cn(
        'relative flex scroll-mt-6 flex-col gap-4 overflow-hidden rounded-(--radius-card) border border-(--el-border) p-[calc(var(--spacing-card-padding)*1.5)] shadow-(--shadow-card)',
        tone.fill,
      )}
    >
      <p className={cn(MONO, 'm-0 flex items-center gap-2.5 text-[12px]')}>
        <i aria-hidden="true" className={cn('size-[9px]', tone.mark)} />
        {String(index + 1).padStart(2, '0')} · {idea.category.label}
      </p>
      <h3
        lang={ideaFieldLang(locale, idea, 'title')}
        className="m-0 font-(family-name:--font-serif) text-[clamp(26px,2.4vw,32px)] leading-[1.04] font-bold tracking-[-0.025em]"
      >
        <OpenIdeaLink
          href={localizedPath(locale, ideasHref(params, { idea: idea.slug }))}
          slug={idea.slug}
          className={STRETCH}
        >
          {idea.title}
        </OpenIdeaLink>
      </h3>
      <p
        lang={ideaFieldLang(locale, idea, 'pitch')}
        className={cn('m-0 text-[16px] leading-[1.5]', tone.soft)}
      >
        {idea.pitch}
      </p>
      {idea.capabilities.length > 0 ? (
        <ul className="m-0 grid list-none gap-2 p-0 text-[14.5px] leading-[1.45]">
          {idea.capabilities.map((line) => (
            <li
              key={line}
              lang={ideaFieldLang(locale, idea, 'capabilities')}
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
      ) : null}
      {idea.tags.length > 0 ? (
        <ul
          aria-label={i.card.tagsAria}
          className={cn(
            MONO,
            'm-0 flex list-none flex-wrap gap-1.5 p-0 text-[11px] tracking-[0.06em]',
          )}
        >
          {idea.tags.map((t) => (
            <li
              key={t.slug}
              lang={ideaTextLang(locale, idea.locale, t.labelFallback)}
              className="rounded-(--radius-badge) border border-current px-2 py-px"
            >
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}
      {hasText(idea.whyMotir) || hasText(idea.whoElse) ? (
        <dl
          className={cn(
            'm-0 mt-auto grid gap-2.5 border-t pt-4 text-[14px] leading-[1.5]',
            tone.rule,
          )}
        >
          {hasText(idea.whyMotir) ? (
            <div>
              <dt className={cn(MONO, 'text-[11px]')}>{i.needLabel}</dt>
              <dd
                lang={ideaFieldLang(locale, idea, 'whyMotir')}
                className={cn('m-0 mt-1', tone.soft)}
              >
                {idea.whyMotir}
              </dd>
            </div>
          ) : null}
          {hasText(idea.whoElse) ? (
            <div>
              <dt className={cn(MONO, 'text-[11px]')}>{i.whoLabel}</dt>
              <dd
                lang={ideaFieldLang(locale, idea, 'whoElse')}
                className={cn('m-0 mt-1', tone.soft)}
              >
                {idea.whoElse}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <OpenFoot />
    </li>
  )
}

export function DirectionCard({
  idea,
  params,
}: {
  idea: PublicIdeaDto
  params: IdeasParams
}) {
  const i = useCopy().ideas
  const locale = usePageLocale()
  const first = idea.evidence[0]
  const extra = idea.evidence.length - 1
  return (
    <li
      id={`idea-${idea.slug}`}
      data-surface="card"
      className="relative flex scroll-mt-6 flex-col gap-3 rounded-(--radius-card) border border-(--el-border) bg-(--el-card) p-[calc(var(--spacing-card-padding)*1.25)] shadow-(--shadow-card) hover:border-(--el-border-strong)"
    >
      <p
        className={cn(
          MONO,
          'm-0 flex items-center gap-2 text-[11px] tracking-[0.06em] text-(--el-text-secondary)',
        )}
      >
        <CategoryMark slug={idea.category.slug} />
        {idea.category.label}
      </p>
      <h3
        lang={ideaFieldLang(locale, idea, 'title')}
        className="m-0 text-[20px] leading-[1.2] font-semibold tracking-[-0.01em] text-(--el-text)"
      >
        <OpenIdeaLink
          href={localizedPath(locale, ideasHref(params, { idea: idea.slug }))}
          slug={idea.slug}
          className={STRETCH}
        >
          {idea.title}
        </OpenIdeaLink>
      </h3>
      <p
        lang={ideaFieldLang(locale, idea, 'pitch')}
        className="m-0 text-[15px] leading-[1.5] text-(--el-text-secondary)"
      >
        {idea.pitch}
      </p>
      {idea.tags.length > 0 ? (
        <ul
          aria-label={i.card.tagsAria}
          className={cn(
            MONO,
            'm-0 flex list-none flex-wrap gap-1.5 p-0 text-[11px] tracking-[0.06em] text-(--el-text-secondary)',
          )}
        >
          {idea.tags.map((t) => (
            <li
              key={t.slug}
              lang={ideaTextLang(locale, idea.locale, t.labelFallback)}
              className="rounded-(--radius-badge) bg-(--el-surface) px-2 py-0.5"
            >
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}
      {first || hasText(idea.gap) ? (
        <dl className="m-0 mt-auto grid gap-3 border-t border-(--el-border) pt-3.5 text-[14px] leading-[1.5]">
          {first ? (
            <div>
              <dt className={cn(MONO, 'text-[11px] text-(--el-text)')}>
                {i.more.evidenceLabel}
              </dt>
              <dd className="m-0 mt-1 text-(--el-text-secondary)">
                <span
                  lang={ideaTextLang(locale, idea.locale, first.claimFallback)}
                >
                  {first.claim}
                </span>{' '}
                <a
                  href={first.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-[1] text-(--el-accent-on-surface) underline underline-offset-2"
                >
                  {first.sourceName}
                </a>
              </dd>
            </div>
          ) : null}
          {hasText(idea.gap) ? (
            <div>
              <dt className={cn(MONO, 'text-[11px] text-(--el-text)')}>
                {i.more.gapLabel}
              </dt>
              <dd
                lang={ideaFieldLang(locale, idea, 'gap')}
                className="m-0 mt-1 text-(--el-text-secondary)"
              >
                {idea.gap}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {extra > 0 ? (
        <span className="font-(family-name:--font-mono) text-[12px] text-(--el-text-secondary)">
          {format(i.card.moreSources, { n: extra })}
        </span>
      ) : null}
      <OpenFoot className="text-(--el-text)" />
    </li>
  )
}
