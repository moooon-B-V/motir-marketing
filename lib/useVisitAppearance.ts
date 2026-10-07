import { useEffect, useState, useSyncExternalStore } from 'react'
import type {
  PaletteId,
  StyleId,
  ThemePattern,
  TypeId,
} from '@motir/design-system'
import {
  SITE_APPEARANCE,
  siteAppearanceAttributes,
  siteTypeForStyle,
} from '@/lib/siteDefaults'

/*
 * `/design`'s appearance — a SANDBOX over motir.co's own look (MOTIR-7724).
 *
 * It starts from exactly what the visitor was just looking at
 * (`SITE_APPEARANCE`, which `app/layout.tsx` already rendered on `<html>`), so
 * arriving changes nothing. Each pick restyles the WHOLE document live — the
 * bar and footer included — by writing the four `data-*` attributes onto
 * `<html>`, which `theme.css` re-resolves for every element. Leaving the page
 * puts the site's look back, and nothing is written to storage, so a reload or
 * any other page is light Hand-Drawn / Grotesk again.
 *
 * This replaces the package's `ThemeProvider` here on purpose: that provider
 * seeds from `localStorage` with the APP's defaults as its fallback (which is
 * what restyled the site on arrival) and persists every pick.
 */

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeColorScheme(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

const prefersDark = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia(DARK_QUERY).matches

function writeAttributes(attributes: Record<string, string>) {
  const html = document.documentElement
  for (const [name, value] of Object.entries(attributes)) {
    html.setAttribute(name, value)
  }
}

export function useAppearanceSandbox() {
  const [pattern, setPattern] = useState<ThemePattern>(SITE_APPEARANCE.pattern)
  const [styleId, setStyleId] = useState<StyleId>(SITE_APPEARANCE.style)
  const [palette, setPalette] = useState<PaletteId>(SITE_APPEARANCE.palette)
  // A pinned pairing outranks the style's own; unpinned follows the style.
  const [pinnedType, setPinnedType] = useState<TypeId | null>(null)
  const osDark = useSyncExternalStore(
    subscribeColorScheme,
    prefersDark,
    () => false,
  )

  const type = pinnedType ?? siteTypeForStyle(styleId)
  const resolvedPattern =
    pattern === 'system' ? (osDark ? 'dark' : 'light') : pattern

  // `osDark` is a dependency even when the pattern is not `system`: the
  // package's `TokensSpecimen` runs its own provider, which re-stamps
  // `data-theme` from the OS when it changes, and this write must answer it.
  useEffect(() => {
    writeAttributes({
      'data-theme': resolvedPattern,
      'data-style': styleId,
      'data-palette': palette,
      'data-type': type,
    })
  }, [resolvedPattern, styleId, palette, type, osDark])

  // On the way out, motir.co gets its own look back.
  useEffect(() => () => writeAttributes(siteAppearanceAttributes), [])

  const offDefault =
    pattern !== SITE_APPEARANCE.pattern ||
    styleId !== SITE_APPEARANCE.style ||
    palette !== SITE_APPEARANCE.palette ||
    type !== SITE_APPEARANCE.type

  function reset() {
    setPattern(SITE_APPEARANCE.pattern)
    setStyleId(SITE_APPEARANCE.style)
    setPalette(SITE_APPEARANCE.palette)
    setPinnedType(null)
  }

  return {
    pattern,
    styleId,
    palette,
    type,
    offDefault,
    setPattern,
    setStyleId,
    setPalette,
    setType: setPinnedType as (type: TypeId) => void,
    reset,
  }
}
