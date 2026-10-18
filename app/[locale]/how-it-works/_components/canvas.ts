'use client'

import { createContext, useContext } from 'react'

/*
 * The width of the canvas the three "How Motir works" drawings are laid out
 * on. They are drawn on a 1600×900 grid; when `RackStage` pins them in a frame
 * wider than 16:9, it widens the canvas to the frame's shape and every drawing
 * spreads its layout across it — positions and panel widths stretch by `k`,
 * while text, knobs, jacks and LEDs keep their size. Everywhere else the
 * canvas is the plain 1600.
 */
export const BASE_WIDTH = 1600

export const CanvasWidth = createContext(BASE_WIDTH)

export function useCanvas() {
  const W = useContext(CanvasWidth)
  const k = W / BASE_WIDTH
  return { W, k, X: (x: number) => x * k }
}
