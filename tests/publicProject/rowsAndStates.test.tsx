import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  MoreLink,
  StatusPill,
  WorkItemRow,
} from '@/app/p/[identifier]/_components/Rows'
import {
  EmptyState,
  ErrorState,
  LoadingRows,
} from '@/app/p/[identifier]/_components/States'
import type { PublicWorkItemDto } from '@/lib/publicProject'
import { SITE_HOST } from '@/lib/publicHost'

/*
 * The shared list primitives and the three states (MOTIR-4121).
 *
 * These are the pieces five tabs compose from, so a defect here is a defect on
 * every tab — which is exactly why they are shared and why they are covered
 * once rather than through five page tests.
 */

const item: PublicWorkItemDto = {
  id: 'wi_1',
  identifier: 'ACME-1',
  key: 1,
  title: 'A work item',
  kind: 'subtask',
  status: 'In Progress',
  statusCategory: 'in_progress',
  priority: 'medium',
}

describe('WorkItemRow', () => {
  it('links to the item’s public detail page', () => {
    render(<WorkItemRow identifier="ACME" item={item} host={SITE_HOST} />)

    expect(screen.getByRole('link', { name: 'A work item' })).toHaveAttribute(
      'href',
      '/p/ACME/items/ACME-1',
    )
  })

  it('renders the epic-privacy MARKER when the projection carries it', () => {
    // Set only on a private epic seen by a non-member, whose descendants are
    // already excluded server-side. Saying so is more honest than showing an
    // epic that merely looks empty.
    render(
      <WorkItemRow
        identifier="ACME"
        item={{ ...item, kind: 'epic', childrenHidden: true }}
        host={SITE_HOST}
      />,
    )

    expect(screen.getByText('Children are not public.')).toBeVisible()
  })

  it('omits the marker on an ordinary row', () => {
    render(<WorkItemRow identifier="ACME" item={item} host={SITE_HOST} />)
    expect(screen.queryByText('Children are not public.')).toBeNull()
  })

  it('encodes an identifier that needs it', () => {
    render(
      <WorkItemRow
        identifier="OPEN CORE"
        item={{ ...item, identifier: 'A B' }}
        host={SITE_HOST}
      />,
    )
    expect(screen.getByRole('link', { name: 'A work item' })).toHaveAttribute(
      'href',
      '/p/OPEN%20CORE/items/A%20B',
    )
  })
})

describe('StatusPill', () => {
  it('tones by CATEGORY, not by the status string', () => {
    // A project names its statuses; the categories are the contract. Toning on
    // the label would break on every workspace that renamed one.
    const { container: done } = render(
      <StatusPill status="Shipped" category="done" />,
    )
    const { container: todo } = render(
      <StatusPill status="Shipped" category="todo" />,
    )

    expect(done.firstElementChild?.className).not.toBe(
      todo.firstElementChild?.className,
    )
  })

  it('falls back to the todo tone for a category it does not know', () => {
    const { container } = render(<StatusPill status="X" category="nonsense" />)
    expect(container.firstElementChild?.className).toContain('--el-surface')
  })
})

describe('MoreLink', () => {
  it('is a real anchor with rel=next — the no-JS pager', () => {
    render(<MoreLink href="/p/ACME/items?cursor=x" label="Load more" />)

    const link = screen.getByRole('link', { name: 'Load more' })
    expect(link).toHaveAttribute('href', '/p/ACME/items?cursor=x')
    expect(link).toHaveAttribute('rel', 'next')
  })
})

describe('the three states', () => {
  it('EMPTY renders its title, and its body only when given one', () => {
    const { rerender } = render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeVisible()

    rerender(<EmptyState title="Nothing here">Some explanation.</EmptyState>)
    expect(screen.getByText('Some explanation.')).toBeVisible()
  })

  it('ERROR names the other host and is announced to assistive tech', () => {
    render(<ErrorState what="this project's board" identifier="ACME" />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('app.motir.co')
    expect(alert).toHaveTextContent("could not load this project's board")
  })

  it('ERROR offers the feed only when it knows which project', () => {
    // Without an identifier there is no feed URL to offer, and a link to
    // nowhere is worse than no link.
    const { rerender } = render(<ErrorState what="this project" />)
    expect(screen.queryByRole('link', { name: /changelog feed/i })).toBeNull()

    rerender(<ErrorState what="this project" identifier="ACME" />)
    expect(
      screen.getByRole('link', { name: /changelog feed/i }),
    ).toHaveAttribute('href', '/p/ACME/changelog.xml')
  })

  it('LOADING draws rows in the shape of the list, hidden from the a11y tree', () => {
    // Skeletons are decoration: announcing four empty rows would be noise. The
    // shape is what stops the page jumping when the data lands.
    const { container } = render(<LoadingRows rows={3} />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('.bg-\\(--el-muted\\)').length).toBe(9)
  })
})
