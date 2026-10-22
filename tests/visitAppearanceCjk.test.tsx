import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  forgetVisitAppearance,
  useVisitAppearance,
} from '@/lib/useVisitAppearance'

/*
 * A zh-tw pick reaches `<html>` as `data-cjk-zh-tw` and leaves it again when
 * the default is picked (MOTIR-9248). `app/globals.css` draws the Traditional
 * faces from that attribute, under `:lang(zh-TW)`.
 */

afterEach(() => act(() => forgetVisitAppearance()))

describe('the zh-tw font pick on <html>', () => {
  it('writes data-cjk-zh-tw for a pick and removes it for the default', () => {
    const html = document.documentElement
    const { result } = renderHook(() => useVisitAppearance())
    expect(html.hasAttribute('data-cjk-zh-tw')).toBe(false)

    act(() => result.current.setCjkFace('zh-tw', 'noto-serif-tc'))
    expect(html.getAttribute('data-cjk-zh-tw')).toBe('noto-serif-tc')
    expect(html.hasAttribute('data-cjk-zh')).toBe(false)

    act(() => result.current.setCjkFace('zh-tw', 'lxgw-wenkai-tc'))
    expect(html.hasAttribute('data-cjk-zh-tw')).toBe(false)
  })

  it('keeps a zh pick and a zh-tw pick apart', () => {
    const html = document.documentElement
    const { result } = renderHook(() => useVisitAppearance())
    act(() => result.current.setCjkFace('zh', 'noto-sans-sc'))
    act(() => result.current.setCjkFace('zh-tw', 'noto-sans-tc'))
    expect(html.getAttribute('data-cjk-zh')).toBe('noto-sans-sc')
    expect(html.getAttribute('data-cjk-zh-tw')).toBe('noto-sans-tc')
  })
})
