import type { ReactElement, ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import type { Locale } from '@/i18n/routing'
import { type Copy, englishCopy } from '@/lib/copy'

/**
 * Render inside the catalogue a page would have (MOTIR-7950).
 *
 * Every component reads its words through `useCopy()`, which is next-intl's
 * `useMessages()`. In the app the locale layout's `NextIntlClientProvider`
 * supplies them; under jsdom nothing does, so a component rendered bare would
 * throw. This is the ONE place a test supplies that provider — English by
 * default, or any `{ locale, messages }` a test is about.
 */
export interface CopyOptions {
  locale?: Locale
  messages?: Copy
}

export function withCopy(
  ui: ReactNode,
  { locale = 'en', messages = englishCopy }: CopyOptions = {},
): ReactElement {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages as unknown as Record<string, unknown>}
    >
      {ui}
    </NextIntlClientProvider>
  )
}

/**
 * `@testing-library/react`'s `render`, with the provider around it. A test
 * imports `render` from here instead, and nothing else about it changes —
 * `rerender` keeps the provider too.
 */
export function render(
  ui: ReactElement,
  options: RenderOptions & CopyOptions = {},
) {
  const { locale, messages, ...rest } = options
  return rtlRender(ui, {
    wrapper: ({ children }) => withCopy(children, { locale, messages }),
    ...rest,
  })
}
