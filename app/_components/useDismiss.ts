'use client'

import { type RefObject, useEffect } from 'react'

/**
 * The bar's popover rule (ProductsMenu, and since MOTIR-7953 the language
 * switcher): while `open`, Escape and a `pointerdown` outside `ref` close it.
 * One hook, so the two popovers in one bar cannot drift apart. `close` hears
 * which one happened — Escape hands focus back to the trigger, a click outside
 * leaves it where the visitor put it.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  close: (via: 'escape' | 'outside') => void,
) {
  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) close('outside')
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close('escape')
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, open, close])
}
