import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/*
 * The repository's FIRST test lane (MOTIR-1152). `ci.yml`'s own header says to
 * "add a gate to `needs` as this repository grows one — do not declare a gate
 * before its job exists"; this is that job's other half, and `ci.yml` gains
 * both together.
 *
 * ⚠️ `NEXT_PUBLIC_MOTIR_APP_ORIGIN` IS SET HERE, and it is set to a value that
 * is NOT production on purpose. Every module that reaches `lib/destinations.ts`
 * imports `lib/appOrigin.ts`, which throws when the variable is missing — so
 * without this the whole suite would fail to import. A non-production value is
 * what lets `tests/destinations.test.ts` assert that the doors are BUILT from
 * the variable rather than merely equal to the string somebody expected.
 *
 * `tests/appOrigin.test.ts` is the one file that must see the variable ABSENT.
 * It re-imports the module under a stubbed environment rather than relying on
 * this default, which is why the default here does not weaken it.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    /*
     * ⚠️ `tests/design/**` BELONGS TO THE OTHER LANE (MOTIR-4001), and the
     * exclusion is load-bearing rather than tidy. Those specs drive a real
     * headless chromium — jsdom cannot measure a `.mock.html`, which is the
     * whole finding that card records — and the `Test` job installs no
     * browser, so a spec left in here would FAIL rather than run twice.
     * `vitest.design.config.mts` includes exactly what this excludes.
     */
    exclude: ['node_modules/**', 'tests/design/**'],
    env: {
      NEXT_PUBLIC_MOTIR_APP_ORIGIN: 'https://app.test.motir.co',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
