import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/*
 * next-intl's SERVER entry under jsdom (MOTIR-7948). This lane resolves the
 * package's client build, where every `next-intl/server` function — including
 * `setRequestLocale`, which each statically rendered page calls first — is a
 * stub that throws "not supported in Client Components". The real one records
 * the locale for the server render that follows and returns nothing, so the
 * stand-in records nothing and returns nothing; every other export stays the
 * package's own.
 */
vi.mock('next-intl/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-intl/server')>()),
  setRequestLocale: () => {},
}))
