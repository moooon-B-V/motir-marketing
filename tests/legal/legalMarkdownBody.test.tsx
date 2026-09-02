import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownBody } from '@/app/legal/_components/MarkdownBody'
import { listLegalDocuments } from '@/lib/legal/documents'

/**
 * The RENDERED half of MOTIR-4147's first acceptance criterion.
 *
 * `MarkdownBody`'s `isExternal` arm gives an absolute href
 * `target="_blank" rel="noreferrer"` for free — which is exactly why it is
 * worth asserting rather than assuming. "For free" is a claim about a
 * component two files away from the document, and the document is the thing
 * that changed. This drives the REAL privacy body through the REAL renderer,
 * so the two cannot drift apart silently.
 */

describe("the Privacy Policy's §7 anchor, as a reader receives it", () => {
  const privacy = listLegalDocuments().find((doc) => doc.slug === 'privacy')!

  it('leaves this host, in a new tab, with no referrer', () => {
    render(<MarkdownBody value={privacy.body} />)

    const anchor = screen.getByRole('link', {
      name: 'In your account settings',
    })
    expect(anchor).toHaveAttribute(
      'href',
      'https://app.test.motir.co/settings/account/data',
    )
    expect(anchor).toHaveAttribute('target', '_blank')
    expect(anchor).toHaveAttribute('rel', 'noreferrer')
  })

  it('the same-origin legal links stay in-page — the arm is not applied blanketly', () => {
    render(<MarkdownBody value={privacy.body} />)

    // A control: `isExternal` decides `target`/`rel`, so an assertion that the
    // §7 link opens in a tab proves nothing unless something in the same
    // document does NOT. The policy's own cross-references are that something.
    const inPage = screen
      .getAllByRole('link')
      .filter((el) => el.getAttribute('href')?.startsWith('/legal/'))

    expect(inPage.length).toBeGreaterThan(0)
    for (const el of inPage) {
      expect(el).not.toHaveAttribute('target')
      expect(el).not.toHaveAttribute('rel')
    }
  })
})
