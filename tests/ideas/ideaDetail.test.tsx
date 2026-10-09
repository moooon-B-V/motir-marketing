import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { copy } from '@/lib/copy'
import type { IdeasParams, PublicIdeaDto, PublicIdeaListDto } from '@/lib/ideas'
import { IdeaDetail } from '@/app/[locale]/ideas/_components/IdeaDetail'
import { OpenIdeaLink } from '@/app/[locale]/ideas/_components/IdeasNav'
import ideasFixture from '../../e2e/fixtures/ideas.json'
import ideaFixture from '../../e2e/fixtures/idea-stop-returns-before-they-happen.json'

/*
 * An idea open in place (MOTIR-7688, Story MOTIR-7665): the sheet draws every
 * field the contract carries and leaves out the empty ones, its close keeps the
 * filters, and close / Escape / the scrim go Back when the sheet was opened
 * from a card and REPLACE the URL when it was loaded from a link.
 */

const router = { push: vi.fn(), back: vi.fn(), replace: vi.fn() }
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const d = copy.ideas.detail
const list = ideasFixture as PublicIdeaListDto
const buy = list.items.find((i) => i.kind === 'motir_buys') as PublicIdeaDto
const direction = ideaFixture as PublicIdeaDto
const FILTERED: IdeasParams = {
  category: 'ecommerce',
  tags: ['smb'],
  q: 'returns',
  idea: direction.slug,
}

beforeEach(() => {
  router.back.mockReset()
  router.replace.mockReset()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
})
afterEach(() => vi.unstubAllGlobals())

describe('IdeaDetail', () => {
  it('a direction: its eyebrow, title, every evidence row with a new-tab source and month, the gap', () => {
    render(<IdeaDetail idea={direction} params={FILTERED} />)
    const sheet = screen.getByRole('dialog', { name: direction.title })
    expect(sheet).toHaveAttribute('aria-modal', 'true')
    expect(sheet).toHaveTextContent(
      `${direction.category.label} · ${d.kindDirection}`,
    )
    expect(sheet).toHaveTextContent(direction.pitch)
    const evidence = within(sheet)
      .getByRole('heading', { name: d.evidence })
      .closest('section') as HTMLElement
    const rows = within(evidence).getAllByRole('listitem')
    expect(rows).toHaveLength(direction.evidence.length)
    const source = within(rows[0]).getByRole('link')
    expect(source).toHaveAttribute('href', direction.evidence[0].url)
    expect(source).toHaveAttribute('target', '_blank')
    expect(source).toHaveTextContent(d.opensInNewTab)
    expect(within(sheet).getByRole('heading', { name: d.gap })).toBeTruthy()
    // The seeded directions carry `whyMotir: ""` — not drawn.
    expect(
      within(sheet).queryByRole('heading', { name: d.whyMotir }),
    ).toBeNull()
  })

  it('a Motir-would-buy idea: its capabilities and why Motir, no evidence section', () => {
    render(<IdeaDetail idea={buy} params={{ tags: [] }} />)
    const sheet = screen.getByRole('dialog', { name: buy.title })
    expect(sheet).toHaveTextContent(`${buy.category.label} · ${d.kindBuys}`)
    expect(
      within(sheet).getByRole('heading', { name: d.capabilities }),
    ).toBeTruthy()
    for (const line of buy.capabilities) expect(sheet).toHaveTextContent(line)
    expect(
      within(sheet).queryByRole('heading', { name: d.evidence }),
    ).toBeNull()
    expect(
      within(sheet).getByRole('heading', { name: d.whyMotir }),
    ).toBeTruthy()
  })

  it('a source with no date shows no month; an idea with no tags or capabilities draws neither', () => {
    const { unmount } = render(
      <IdeaDetail
        idea={{
          ...direction,
          evidence: [{ ...direction.evidence[0], sourceDate: '2024-03-01' }],
        }}
        params={{ tags: [] }}
      />,
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('March 2024')
    unmount()
    render(
      <IdeaDetail
        idea={{
          ...direction,
          tags: [],
          capabilities: [],
          evidence: [{ ...direction.evidence[0], sourceDate: null }],
        }}
        params={{ tags: [] }}
      />,
    )
    const sheet = screen.getByRole('dialog')
    expect(
      within(sheet).queryByRole('list', { name: copy.ideas.card.tagsAria }),
    ).toBeNull()
    expect(
      within(sheet).queryByRole('heading', { name: d.capabilities }),
    ).toBeNull()
    expect(sheet).not.toHaveTextContent('March 2024')
  })

  it('closes to the same view without the idea, and a tag adds itself to the filters', () => {
    render(<IdeaDetail idea={direction} params={FILTERED} />)
    expect(screen.getByRole('link', { name: d.close })).toHaveAttribute(
      'href',
      '/ideas?category=ecommerce&tag=smb&q=returns',
    )
    const tags = screen.getByRole('list', { name: copy.ideas.card.tagsAria })
    const [smb, other] = within(tags).getAllByRole('link')
    expect(smb).toHaveAttribute(
      'href',
      '/ideas?category=ecommerce&tag=smb&q=returns',
    )
    expect(other.getAttribute('href')).toBe(
      `/ideas?category=ecommerce&tag=smb&tag=${direction.tags[1].slug}&q=returns`,
    )
  })

  it('loaded from a link: focus lands on the title, close REPLACES the URL, the page does not scroll', () => {
    const { unmount } = render(
      <IdeaDetail idea={direction} params={FILTERED} />,
    )
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: direction.title, level: 2 }),
    )
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('link', { name: d.close }))
    expect(router.replace).toHaveBeenCalledWith(
      '/ideas?category=ecommerce&tag=smb&q=returns',
      { scroll: false },
    )
    expect(router.back).not.toHaveBeenCalled()
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('opened from a card: Escape and the scrim go Back, and focus returns to that card', () => {
    render(
      <>
        <OpenIdeaLink href="/ideas?idea=x" slug={direction.slug}>
          open
        </OpenIdeaLink>
      </>,
    )
    fireEvent.click(screen.getByRole('link', { name: 'open' }))
    const { unmount } = render(
      <IdeaDetail idea={direction} params={FILTERED} />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(router.back).toHaveBeenCalledTimes(1)
    const scrim = document.querySelector(
      `[data-idea-sheet] > a[aria-hidden="true"]`,
    ) as HTMLElement
    fireEvent.click(scrim)
    expect(router.back).toHaveBeenCalledTimes(2)
    expect(router.replace).not.toHaveBeenCalled()
    act(() => unmount())
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: 'open' }),
    )
  })

  it('holds Tab inside the sheet', () => {
    render(<IdeaDetail idea={direction} params={FILTERED} />)
    const sheet = screen.getByRole('dialog')
    const links = within(sheet).getAllByRole('link')
    const first = links[0]
    const last = links[links.length - 1]
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
    // From outside the sheet, Tab and Shift+Tab come back in at its ends.
    document.body.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    document.body.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
    // Mid-sheet, Tab is left to the browser.
    links[1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(links[1])
    last.focus()
    // A key that is neither Tab nor Escape is left alone.
    fireEvent.keyDown(document, { key: 'a' })
    expect(document.activeElement).toBe(last)
  })
})
