import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { THEME_DEFAULTS } from '@motir/design-system'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DesignShowcase } from '@/app/_components/DesignShowcase'
import { copy } from '@/lib/copy'

/*
 * `/design` — the showcase island (MOTIR-1043 · 8.3.16).
 *
 * ⚠️ THE ASSERTION IS ON `<html>`, NOT ON THE CONTROL. The page's claim is
 * that the WHOLE document restyles — bar and footer included — and the whole
 * of that mechanism is `ThemeProvider` writing `data-style` / `data-palette` /
 * `data-type` / `data-theme` onto `document.documentElement`, which
 * `theme.css`'s 23 `[data-palette]`, 112 `[data-style]` and 9 `[data-type]`
 * blocks then re-resolve for every element on the page. A test that asserted
 * `aria-checked` moved would pass on a picker that changed nothing outside
 * itself.
 */

const html = () => document.documentElement

/*
 * ⚠️ jsdom SHIPS NO `matchMedia`, and `ThemeProvider` reads it through
 * `useSyncExternalStore` to resolve the `system` pattern — so without this
 * every test in this file dies inside the provider rather than in an
 * assertion. `stubColorScheme` is also how the `system` arm below is driven:
 * the default answer is "not dark", which is precisely what makes a BROKEN
 * `system` arm indistinguishable from a working one.
 */
function stubColorScheme(prefersDark: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia
}

function clearTheme() {
  stubColorScheme(false)
  for (const attr of [
    'data-theme',
    'data-style',
    'data-palette',
    'data-type',
  ]) {
    html().removeAttribute(attr)
  }
  window.localStorage.clear()
}

beforeEach(clearTheme)
afterEach(clearTheme)

describe('the axis rail', () => {
  it('labels every axis region, so the rail is navigable by role', () => {
    render(<DesignShowcase />)
    for (const label of [
      copy.designShowcase.theme.name,
      copy.designShowcase.style.name,
      copy.designShowcase.palette.name,
      copy.designShowcase.type.name,
    ]) {
      expect(
        screen.getByRole('radiogroup', { name: label }),
      ).toBeInTheDocument()
    }
  })

  it('renders every axis help line from the catalogue, not from the component', () => {
    render(<DesignShowcase />)
    for (const help of [
      copy.designShowcase.theme.help,
      copy.designShowcase.style.help,
      copy.designShowcase.palette.help,
      copy.designShowcase.type.help,
    ]) {
      expect(screen.getByText(help)).toBeInTheDocument()
    }
  })

  it('offers the WHOLE registry on each axis — 11 styles, 10 palettes, 6 pairings', () => {
    render(<DesignShowcase />)
    const count = (name: string) =>
      within(screen.getByRole('radiogroup', { name })).getAllByRole('radio')
        .length
    expect(count(copy.designShowcase.style.name)).toBe(11)
    expect(count(copy.designShowcase.palette.name)).toBe(10)
    expect(count(copy.designShowcase.type.name)).toBe(6)
    expect(count(copy.designShowcase.theme.name)).toBe(3)
  })

  it('reports the selected option on every axis', () => {
    render(<DesignShowcase />)
    const selected = (name: string) =>
      within(screen.getByRole('radiogroup', { name }))
        .getAllByRole('radio')
        .filter((el) => el.getAttribute('aria-checked') === 'true')
    for (const name of [
      copy.designShowcase.theme.name,
      copy.designShowcase.style.name,
      copy.designShowcase.palette.name,
      copy.designShowcase.type.name,
    ]) {
      expect(selected(name)).toHaveLength(1)
    }
  })
})

describe('each control restyles the WHOLE document', () => {
  it('writes data-style onto <html> when a style is picked', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(screen.getByRole('radio', { name: /Neo-Brutalism/ }))
    expect(html()).toHaveAttribute('data-style', 'neo-brutalism')
  })

  it('writes data-palette onto <html> when a palette is picked', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(screen.getByRole('radio', { name: /Graphite/ }))
    expect(html()).toHaveAttribute('data-palette', 'graphite')
  })

  it('writes data-type onto <html> when a pairing is picked', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(screen.getByRole('radio', { name: /Mono-Technical/ }))
    expect(html()).toHaveAttribute('data-type', 'mono-technical')
  })

  it('writes data-theme onto <html> for light and dark', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(
      screen.getByRole('radio', { name: copy.designShowcase.theme.dark }),
    )
    expect(html()).toHaveAttribute('data-theme', 'dark')
    await user.click(
      screen.getByRole('radio', { name: copy.designShowcase.theme.light }),
    )
    expect(html()).toHaveAttribute('data-theme', 'light')
  })

  it('resolves `system` through prefers-color-scheme rather than defaulting to light', async () => {
    /*
     * `system` is the DEFAULT pattern, so this is the arm a first-time visitor
     * actually meets. jsdom answers `matches: false` for every media query
     * unless it is told otherwise, which is exactly how a broken `system` arm
     * looks indistinguishable from a working one.
     */
    stubColorScheme(true)
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(
      screen.getByRole('radio', { name: copy.designShowcase.theme.light }),
    )
    expect(html()).toHaveAttribute('data-theme', 'light')
    await user.click(
      screen.getByRole('radio', { name: copy.designShowcase.theme.system }),
    )
    expect(html()).toHaveAttribute('data-theme', 'dark')
  })

  it('moves the selection with the arrow keys — the radiogroup contract', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    const group = screen.getByRole('radiogroup', {
      name: copy.designShowcase.style.name,
    })
    const chips = within(group).getAllByRole('radio')
    chips[0].focus()
    await user.keyboard('{ArrowRight}')
    expect(html()).toHaveAttribute('data-style', 'soft-playful')
    expect(chips[1]).toHaveFocus()
  })

  it('keeps only the selected chip in the tab order', () => {
    render(<DesignShowcase />)
    const chips = within(
      screen.getByRole('radiogroup', { name: copy.designShowcase.style.name }),
    ).getAllByRole('radio')
    expect(chips.filter((c) => c.tabIndex === 0)).toHaveLength(1)
  })
})

describe('Reset to default', () => {
  it('is ABSENT at arrival — a reset with nothing to reset is noise', () => {
    render(<DesignShowcase />)
    expect(
      screen.queryByRole('button', { name: copy.designShowcase.reset }),
    ).toBeNull()
  })

  it('appears the moment ANY axis leaves its default', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(screen.getByRole('radio', { name: /Graphite/ }))
    expect(
      screen.getByRole('button', { name: copy.designShowcase.reset }),
    ).toBeInTheDocument()
  })

  it('returns all four axes to THEME_DEFAULTS and disappears again', async () => {
    const user = userEvent.setup()
    render(<DesignShowcase />)
    await user.click(screen.getByRole('radio', { name: /Neo-Brutalism/ }))
    await user.click(screen.getByRole('radio', { name: /Graphite/ }))
    await user.click(
      screen.getByRole('radio', { name: copy.designShowcase.theme.dark }),
    )
    await user.click(
      screen.getByRole('button', { name: copy.designShowcase.reset }),
    )
    expect(html()).toHaveAttribute('data-style', THEME_DEFAULTS.style)
    expect(html()).toHaveAttribute('data-palette', THEME_DEFAULTS.palette)
    expect(html()).toHaveAttribute('data-type', THEME_DEFAULTS.type)
    expect(
      screen.queryByRole('button', { name: copy.designShowcase.reset }),
    ).toBeNull()
  })
})

describe('the composed specimen', () => {
  it('renders the page words from the catalogue', () => {
    render(<DesignShowcase />)
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: copy.designShowcase.heading,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(copy.designShowcase.subline)).toBeInTheDocument()
    expect(screen.getByText(copy.designShowcase.closing)).toBeInTheDocument()
  })

  it('mounts the package own TokensSpecimen rather than a redrawn slice of it', () => {
    render(<DesignShowcase />)
    expect(screen.getByText('@motir/design-system')).toBeInTheDocument()
  })

  it('shows EmptyState and ErrorState as SPECIMENS, never as states of the page', () => {
    /*
     * The page fetches nothing, so it has no loading state and no error state
     * — the asset says so rather than leaving it unasked. Both primitives are
     * nevertheless on it, as exhibits. The distinction is not decorative: if
     * they ever became real states, they would have to move behind a
     * condition, and this assertion is what would go red.
     */
    render(<DesignShowcase />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })
})
