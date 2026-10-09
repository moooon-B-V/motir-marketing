import { act, screen, waitFor } from '@testing-library/react'
import { render } from '@/tests/helpers/withCopy'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroBrief } from '@/app/_components/landing/HeroBrief'

/*
 * The hero brief's states — rest, submitting, submit-failed (it took them over
 * from the old door 1 in the 2026-10 redesign). The failure arm is the one that
 * gets dropped, and it is the one a cross-origin POST guarantees you will meet,
 * so it is asserted hardest here.
 */

const assign = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, assign },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  assign.mockReset()
})

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('HeroBrief — state A, empty (rest)', () => {
  it('gives the textarea a real <label for>, not a placeholder standing in for one', () => {
    render(<HeroBrief />)
    const field = screen.getByLabelText('What are you building?')
    expect(field).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('enables submit on an EMPTY idea — the box is a head-start, not a gate', () => {
    render(<HeroBrief />)
    expect(screen.getByRole('button', { name: /^start$/i })).toBeEnabled()
  })

  it('caps the field at motir-cores own truncation bound', () => {
    render(<HeroBrief />)
    expect(screen.getByLabelText('What are you building?')).toHaveAttribute(
      'maxlength',
      '2000',
    )
  })
})

describe('HeroBrief — state C, submitting', () => {
  it('changes the LABEL as well as the glyph, and disables the field', async () => {
    const user = userEvent.setup()
    let release!: (value: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        release = resolve
      }),
    )
    render(<HeroBrief />)

    await user.type(
      screen.getByLabelText('What are you building?'),
      'a salon app',
    )
    await user.click(screen.getByRole('button', { name: /^start$/i }))

    // The label is the whole of the signal under `prefers-reduced-motion`,
    // where the spinner does not turn — so it is asserted, not the animation.
    const button = await screen.findByRole('button', { name: /starting…/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    // The textarea is disabled so a second submit cannot double-POST the draft.
    expect(screen.getByLabelText('What are you building?')).toBeDisabled()

    release(jsonResponse(201, { draftId: 'd-1' }))
    await waitFor(() => expect(assign).toHaveBeenCalled())
  })

  it('navigates the whole browser to the sign-in URL carrying the draft', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue(jsonResponse(201, { draftId: 'd-42' }))
    render(<HeroBrief />)

    await user.type(
      screen.getByLabelText('What are you building?'),
      'a salon app',
    )
    await user.click(screen.getByRole('button', { name: /^start$/i }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        'https://app.test.motir.co/sign-in?draft=d-42',
      ),
    )
  })
})

describe('HeroBrief — state D, submit failed', () => {
  it('KEEPS the typed idea, says so, and offers two exits', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))
    render(<HeroBrief />)

    const idea = 'a time-off app for a 20-person startup'
    await user.type(screen.getByLabelText('What are you building?'), idea)
    await user.click(screen.getByRole('button', { name: /^start$/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't save your idea/i)
    // THE assertion of this whole file: nothing the visitor typed is lost.
    expect(screen.getByLabelText('What are you building?')).toHaveValue(idea)
    expect(assign).not.toHaveBeenCalled()

    // Two exits, so nobody is stranded on a dead button.
    expect(screen.getByRole('button', { name: /try again/i })).toBeEnabled()
    expect(
      screen.getByRole('link', { name: /continue to motir/i }),
    ).toHaveAttribute('href', 'https://app.test.motir.co/sign-up')
  })

  it('re-enables the field, so "try again" is actually reachable', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { code: 'RATE_LIMITED' }),
    )
    render(<HeroBrief />)

    await user.type(
      screen.getByLabelText('What are you building?'),
      'a salon app',
    )
    await user.click(screen.getByRole('button', { name: /^start$/i }))

    await screen.findByRole('alert')
    expect(screen.getByLabelText('What are you building?')).toBeEnabled()

    vi.mocked(fetch).mockResolvedValue(jsonResponse(201, { draftId: 'd-2' }))
    await user.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        'https://app.test.motir.co/sign-in?draft=d-2',
      ),
    )
  })

  it('an EMPTY submit skips the POST and still leaves the door', async () => {
    const user = userEvent.setup()
    render(<HeroBrief />)

    await user.click(screen.getByRole('button', { name: /^start$/i }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://app.test.motir.co/sign-in'),
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('HeroBrief — typed examples', () => {
  const examples = ['An AI legal team']

  afterEach(() => {
    vi.useRealTimers()
  })

  it('types an example into the empty box as a picture, keeping the real placeholder', () => {
    vi.useFakeTimers()
    render(<HeroBrief examples={examples} />)
    // Fully typed, and still held before it is erased.
    act(() => vi.advanceTimersByTime(3000))
    const typed = screen.getByTestId('hero-brief-typed')
    expect(typed).toHaveAttribute('aria-hidden', 'true')
    expect(typed).toHaveTextContent('An AI legal team')
    expect(screen.getByLabelText('What are you building?')).toHaveAttribute(
      'placeholder',
      'An AI personal assistant that helps people reach their goals…',
    )
  })

  it('stops typing once the box is focused', () => {
    vi.useFakeTimers()
    render(<HeroBrief examples={examples} />)
    act(() => vi.advanceTimersByTime(1000))
    act(() => screen.getByLabelText('What are you building?').focus())
    expect(screen.queryByTestId('hero-brief-typed')).toBeNull()
  })

  it('hides the placeholder while the box is focused, keeping the attribute', () => {
    render(<HeroBrief examples={examples} />)
    const field = screen.getByLabelText('What are you building?')
    act(() => field.focus())
    expect(field).toHaveClass('placeholder:text-transparent')
    expect(field).toHaveAttribute('placeholder')
    act(() => field.blur())
    expect(field).not.toHaveClass('placeholder:text-transparent')
  })

  it('keeps the placeholder on focus without examples, as the product pages use it', () => {
    render(<HeroBrief />)
    const field = screen.getByLabelText('What are you building?')
    act(() => field.focus())
    expect(field).not.toHaveClass('placeholder:text-transparent')
  })

  it('never starts under prefers-reduced-motion', () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
    )
    render(<HeroBrief examples={examples} />)
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.queryByTestId('hero-brief-typed')).toBeNull()
  })

  it('types nothing without examples, as the product pages use it', () => {
    vi.useFakeTimers()
    render(<HeroBrief />)
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.queryByTestId('hero-brief-typed')).toBeNull()
  })
})

describe('HeroBrief — typed examples come in a random order', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shuffles the list rather than walking it in order', () => {
    vi.useFakeTimers()
    // Fisher–Yates with random() ≡ 0 swaps every item with the first, so
    // [A, B, C] comes out [B, C, A]: B is typed first, not A.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<HeroBrief examples={['A', 'B', 'C']} />)
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByTestId('hero-brief-typed')).toHaveTextContent(/^B$/)
  })
})
