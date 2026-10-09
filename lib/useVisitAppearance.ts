import { useEffect, useSyncExternalStore } from 'react'
import type {
  PaletteId,
  StyleId,
  ThemePattern,
  TypeId,
} from '@motir/design-system'
import { SITE_APPEARANCE, siteTypeForStyle } from '@/lib/siteDefaults'
import {
  CJK_LANGS,
  cjkAttribute,
  defaultCjkFace,
  type CjkLang,
} from '@/lib/cjkFaces'

/*
 * The appearance a visitor picks on `/design` — for THIS VISIT (MOTIR-7724).
 *
 * A pick restyles the WHOLE of motir.co, not just `/design`: it is written
 * onto `<html>` (four `data-*` attributes `theme.css` re-resolves for every
 * element), and motir.co has one root layout whose `<html>` survives every
 * client-side navigation, so the bar, the footer and every page the visitor
 * moves on to keep the look. Coming back to `/design` shows the same choice,
 * because it is held here, in memory, rather than read back off the page.
 *
 * ⚠️ AND NOTHING OUTLIVES THE VISIT. The choice is a module-level value, never
 * written to storage, so a fresh load of any motir.co page — a new visit, a
 * new tab, a reload — is the server-rendered site look again
 * (`app/layout.tsx`, `SITE_APPEARANCE`).
 *
 * This replaces the package's `ThemeProvider` here on purpose: that provider
 * seeds from `localStorage` with the APP's defaults as its fallback (which is
 * what restyled the site on arrival) and persists every pick.
 */

interface VisitChoice {
  pattern: ThemePattern
  styleId: StyleId
  palette: PaletteId
  /** A pinned pairing outranks the style's own; null follows the style. */
  pinnedType: TypeId | null
  /** The CJK font picked per language (`lib/cjkFaces.ts`); absent is the default. */
  cjkFaces: Partial<Record<CjkLang, string>>
}

const SITE_CHOICE: VisitChoice = {
  pattern: SITE_APPEARANCE.pattern,
  styleId: SITE_APPEARANCE.style,
  palette: SITE_APPEARANCE.palette,
  pinnedType: null,
  cjkFaces: {},
}

let choice = SITE_CHOICE
const listeners = new Set<() => void>()

function subscribeChoice(onChange: () => void) {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function updateChoice(patch: Partial<VisitChoice>) {
  choice = { ...choice, ...patch }
  for (const listener of listeners) listener()
}

/** Back to a fresh visit. What a new page load does; tests call it too. */
export function forgetVisitAppearance() {
  choice = SITE_CHOICE
  for (const listener of listeners) listener()
}

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

export function useVisitAppearance() {
  const current = useSyncExternalStore(
    subscribeChoice,
    () => choice,
    () => SITE_CHOICE,
  )
  const osDark = useSyncExternalStore(
    subscribeColorScheme,
    prefersDark,
    () => false,
  )

  const { pattern, styleId, palette, pinnedType, cjkFaces } = current
  const type = pinnedType ?? siteTypeForStyle(styleId)
  const resolvedPattern =
    pattern === 'system' ? (osDark ? 'dark' : 'light') : pattern

  // `osDark` is a dependency even when the pattern is not `system`: the
  // package's `TokensSpecimen` runs its own provider, which re-stamps
  // `data-theme` from the OS when it changes, and this write must answer it.
  // Nothing is undone on unmount — the choice is the whole site's.
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', resolvedPattern)
    html.setAttribute('data-style', styleId)
    html.setAttribute('data-palette', palette)
    html.setAttribute('data-type', type)
    for (const lang of CJK_LANGS) {
      const face = cjkFaces[lang]
      if (face) html.setAttribute(cjkAttribute(lang), face)
      else html.removeAttribute(cjkAttribute(lang))
    }
  }, [resolvedPattern, styleId, palette, type, cjkFaces, osDark])

  const offDefault =
    pattern !== SITE_APPEARANCE.pattern ||
    styleId !== SITE_APPEARANCE.style ||
    palette !== SITE_APPEARANCE.palette ||
    type !== SITE_APPEARANCE.type ||
    Object.keys(cjkFaces).length > 0

  return {
    pattern,
    styleId,
    palette,
    type,
    cjkFaces,
    offDefault,
    setPattern: (next: ThemePattern) => updateChoice({ pattern: next }),
    setStyleId: (next: StyleId) => updateChoice({ styleId: next }),
    setPalette: (next: PaletteId) => updateChoice({ palette: next }),
    setType: (next: TypeId) => updateChoice({ pinnedType: next }),
    // Picking the default face forgets the pick, so Reset shows only while a
    // language is genuinely off its default.
    setCjkFace: (lang: CjkLang, face: string) => {
      const next = { ...cjkFaces }
      if (face === defaultCjkFace(lang)) delete next[lang]
      else next[lang] = face
      updateChoice({ cjkFaces: next })
    },
    reset: forgetVisitAppearance,
  }
}
