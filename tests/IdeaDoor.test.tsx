import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IdeaDoor } from '@/app/_components/IdeaDoor'

/*
 * Door 1's FOUR states — Panel 3 of `design/marketing/landing.mock.html`:
 * empty (rest), typing, submitting, submit-failed. The failure arm is the one
 * that gets dropped, and it is the one a cross-origin POST guarantees you will
 * meet, so it is asserted hardest here.
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

describe('IdeaDoor — state A, empty (rest)', () => {
  it('gives the textarea a real <label for>, not a placeholder standing in for one', () => {
    render(<IdeaDoor />)
    const field = screen.getByLabelText('Your idea')
    expect(field).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('enables submit on an EMPTY idea — the box is a head-start, not a gate', () => {
    render(<IdeaDoor />)
    expect(
      screen.getByRole('button', { name: /start planning/i }),
    ).toBeEnabled()
  })

  it('caps the field at motir-cores own truncation bound', () => {
    render(<IdeaDoor />)
    expect(screen.getByLabelText('Your idea')).toHaveAttribute(
      'maxlength',
      '2000',
    )
  })

  it('renders the counter INVISIBLE rather than absent, so revealing it never reflows', () => {
    render(<IdeaDoor />)
    const counter = screen.getByText('0 / 2000')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveStyle({ visibility: 'hidden' })
  })
})

describe('IdeaDoor — state B, typing', () => {
  it('reveals the counter on the first keystroke and tracks the length', async () => {
    const user = userEvent.setup()
    render(<IdeaDoor />)

    await user.type(screen.getByLabelText('Your idea'), 'a salon app')

    const counter = screen.getByText('11 / 2000')
    expect(counter).not.toHaveStyle({ visibility: 'hidden' })
  })
})

describe('IdeaDoor — state C, submitting', () => {
  it('changes the LABEL as well as the glyph, and disables the field', async () => {
    const user = userEvent.setup()
    let release!: (value: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((resolve) => {
        release = resolve
      }),
    )
    render(<IdeaDoor />)

    await user.type(screen.getByLabelText('Your idea'), 'a salon app')
    await user.click(screen.getByRole('button', { name: /start planning/i }))

    // The label is the whole of the signal under `prefers-reduced-motion`,
    // where the spinner does not turn — so it is asserted, not the animation.
    const button = await screen.findByRole('button', { name: /starting…/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    // The textarea is disabled so a second submit cannot double-POST the draft.
    expect(screen.getByLabelText('Your idea')).toBeDisabled()

    release(jsonResponse(201, { draftId: 'd-1' }))
    await waitFor(() => expect(assign).toHaveBeenCalled())
  })

  it('navigates the whole browser to the sign-in URL carrying the draft', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue(jsonResponse(201, { draftId: 'd-42' }))
    render(<IdeaDoor />)

    await user.type(screen.getByLabelText('Your idea'), 'a salon app')
    await user.click(screen.getByRole('button', { name: /start planning/i }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        'https://app.test.motir.co/sign-in?draft=d-42',
      ),
    )
  })
})

describe('IdeaDoor — state D, submit failed', () => {
  it('KEEPS the typed idea, says so, and offers two exits', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))
    render(<IdeaDoor />)

    const idea = 'a time-off app for a 20-person startup'
    await user.type(screen.getByLabelText('Your idea'), idea)
    await user.click(screen.getByRole('button', { name: /start planning/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't save your idea/i)
    // THE assertion of this whole file: nothing the visitor typed is lost.
    expect(screen.getByLabelText('Your idea')).toHaveValue(idea)
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
    render(<IdeaDoor />)

    await user.type(screen.getByLabelText('Your idea'), 'a salon app')
    await user.click(screen.getByRole('button', { name: /start planning/i }))

    await screen.findByRole('alert')
    expect(screen.getByLabelText('Your idea')).toBeEnabled()

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
    render(<IdeaDoor />)

    await user.click(screen.getByRole('button', { name: /start planning/i }))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://app.test.motir.co/sign-in'),
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
