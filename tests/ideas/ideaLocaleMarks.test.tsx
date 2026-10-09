import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { render } from '@/tests/helpers/withCopy'
import {
  toPublicIdea,
  type IdeasParams,
  type PublicIdeaDto,
  type PublicIdeaTagListDto,
  type PublicIdeaWire,
} from '@/lib/ideas'
import type { Locale } from '@/i18n/routing'
import {
  BuyCard,
  DirectionCard,
} from '@/app/[locale]/ideas/_components/IdeaCards'
import { IdeaControls } from '@/app/[locale]/ideas/_components/IdeaControls'
import { IdeaDetail } from '@/app/[locale]/ideas/_components/IdeaDetail'
import { IdeasNavProvider } from '@/app/[locale]/ideas/_components/IdeasNav'

/*
 * `lang="en"` on exactly the English (Story MOTIR-7772 · MOTIR-7777): rendered
 * from a Japanese response in which the pitch, one evidence claim and one tag
 * label fell back, the card, the open idea and the tag control mark those three
 * — on the element holding the text — and nothing else. The same response on
 * the English page marks nothing, and a response from a motir-core that
 * predates the locale fields marks every idea text on a Japanese page English.
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}))

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const PARAMS: IdeasParams = { tags: [] }

const PITCH_EN = 'Booking and reminders for small vet clinics.'
const CLAIM_EN = 'Most clinics still book by phone.'
const LABEL_EN = 'Small business'

/** A Japanese direction: pitch, the second claim and the first tag fell back. */
const direction: PublicIdeaDto = toPublicIdea({
  slug: 'vet-clinics',
  title: '小さな動物病院の予約',
  pitch: PITCH_EN,
  kind: 'direction',
  category: { slug: 'pets', label: 'Pets' },
  tags: [
    { slug: 'smb', label: LABEL_EN, labelFallback: true },
    { slug: 'healthcare', label: '医療', labelFallback: false },
  ],
  capabilities: ['予約を受け付ける', 'リマインダーを送る'],
  evidence: [
    {
      claim: '動物病院の半数は紙で運営している。',
      sourceName: 'Clinic survey',
      url: 'https://example.com/a',
      sourceDate: '2026-03-01',
      claimFallback: false,
    },
    {
      claim: CLAIM_EN,
      sourceName: 'Trade report',
      url: 'https://example.com/b',
      sourceDate: null,
      claimFallback: true,
    },
  ],
  gap: '小さな病院に誰も対応していない。',
  whyNow: '電話は遅すぎる。',
  whyMotir: null,
  whoElse: null,
  addedAt: '2026-10-01T00:00:00.000Z',
  lastReviewedAt: null,
  locale: 'ja',
  fallbackFields: ['pitch'],
})

/** The same direction with its first claim first, so the card shows the English one. */
const directionClaimFirst: PublicIdeaDto = {
  ...direction,
  evidence: [direction.evidence[1]!, direction.evidence[0]!],
}

const buy: PublicIdeaDto = {
  ...direction,
  slug: 'legal-team',
  kind: 'motir_buys',
  whyMotir: 'Motir には法務チームがない。',
  whoElse: 'すべてのソフトウェア企業。',
}

const tagList: PublicIdeaTagListDto = {
  tags: [
    { slug: 'smb', label: LABEL_EN, count: 2, labelFallback: true },
    { slug: 'healthcare', label: '医療', count: 1, labelFallback: false },
  ],
  locale: 'ja',
}

/** Every element carrying a `lang` attribute, and its text. */
function marked(): Array<[string, string]> {
  return Array.from(document.querySelectorAll('[lang]')).map((el) => [
    el.getAttribute('lang') ?? '',
    (el.textContent ?? '').trim(),
  ])
}

function renderAll(locale: Locale, idea = direction, tags = tagList) {
  return render(
    <IdeasNavProvider>
      <IdeaControls params={PARAMS} total={1} categories={[]} tags={tags} />
      <ol>
        <BuyCard idea={{ ...buy, ...pick(idea) }} index={0} params={PARAMS} />
      </ol>
      <ul>
        <DirectionCard idea={idea} params={PARAMS} />
      </ul>
      <IdeaDetail idea={idea} params={PARAMS} />
    </IdeasNavProvider>,
    { locale },
  )
}

/** The served-locale fields of `idea`, so the buy card follows the case. */
function pick(idea: PublicIdeaDto) {
  return {
    locale: idea.locale,
    fallbackFields: idea.fallbackFields,
    tags: idea.tags,
    pitch: idea.pitch,
  }
}

/** A response as a motir-core without the locale fields would send it. */
function preLocale(idea: PublicIdeaWire): PublicIdeaWire {
  const LOCALE_KEYS = [
    'locale',
    'fallbackFields',
    'claimFallback',
    'labelFallback',
  ]
  return JSON.parse(
    JSON.stringify(idea, (key, value: unknown) =>
      LOCALE_KEYS.includes(key) ? undefined : value,
    ),
  ) as PublicIdeaWire
}

describe('a Japanese page', () => {
  it('the card marks exactly the fallback pitch and tag', () => {
    render(
      <ul>
        <DirectionCard idea={direction} params={PARAMS} />
      </ul>,
      { locale: 'ja' },
    )
    expect(marked()).toEqual([
      ['en', PITCH_EN],
      ['en', LABEL_EN],
    ])
  })

  it('the card shows the English claim marked, and only the claim, not its source', () => {
    render(
      <ul>
        <DirectionCard idea={directionClaimFirst} params={PARAMS} />
      </ul>,
      { locale: 'ja' },
    )
    expect(marked()).toEqual([
      ['en', PITCH_EN],
      ['en', LABEL_EN],
      ['en', CLAIM_EN],
    ])
  })

  it('the Motir-would-buy card marks exactly the fallback pitch and tag', () => {
    render(
      <ol>
        <BuyCard idea={buy} index={0} params={PARAMS} />
      </ol>,
      { locale: 'ja' },
    )
    expect(marked()).toEqual([
      ['en', PITCH_EN],
      ['en', LABEL_EN],
    ])
  })

  it('the open idea marks exactly the pitch, the one claim and the one tag', () => {
    render(<IdeaDetail idea={direction} params={PARAMS} />, { locale: 'ja' })
    expect(marked()).toEqual([
      ['en', PITCH_EN],
      ['en', LABEL_EN],
      ['en', CLAIM_EN],
    ])
    // The mark sits on the element holding the text, never on the sheet.
    expect(document.querySelector('[role="dialog"]')).not.toHaveAttribute(
      'lang',
    )
  })

  it('the tag control marks exactly the fallback label', () => {
    render(
      <IdeasNavProvider>
        <IdeaControls
          params={PARAMS}
          total={1}
          categories={[]}
          tags={tagList}
        />
      </IdeasNavProvider>,
      { locale: 'ja' },
    )
    expect(marked()).toEqual([['en', LABEL_EN]])
  })
})

describe('an English page', () => {
  it('marks no idea element at all', () => {
    renderAll('en')
    expect(marked()).toEqual([])
  })
})

describe('a response from a motir-core without the locale fields', () => {
  it('on a Japanese page, every idea text element is marked English', () => {
    const old = toPublicIdea(preLocale(direction as PublicIdeaWire))
    expect(old.locale).toBe('en')
    render(<IdeaDetail idea={old} params={PARAMS} />, { locale: 'ja' })
    const texts = marked().map(([, text]) => text)
    expect(marked().every(([lang]) => lang === 'en')).toBe(true)
    for (const text of [
      old.title,
      old.pitch,
      ...old.capabilities,
      ...old.evidence.map((e) => e.claim),
      ...old.tags.map((t) => t.label),
      old.gap,
      old.whyNow,
    ])
      expect(texts).toContain(text)
  })

  it('an old tags envelope on a Japanese page marks every label English', () => {
    render(
      <IdeasNavProvider>
        <IdeaControls
          params={PARAMS}
          total={1}
          categories={[]}
          tags={{
            tags: tagList.tags.map((t) => ({ ...t, labelFallback: false })),
            locale: 'en',
          }}
        />
      </IdeasNavProvider>,
      { locale: 'ja' },
    )
    expect(marked()).toEqual([
      ['en', LABEL_EN],
      ['en', '医療'],
    ])
  })
})
