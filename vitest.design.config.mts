import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

/*
 * MOTIR-4001 — the DESIGN-ASSET GUARD lane for `motir-marketing`.
 *
 * ── Why a second config rather than the root one ────────────────────────────
 * `vitest.config.mts` runs on `jsdom`, and jsdom is precisely what cannot
 * measure these assets: it drops the `font:` shorthand and does not apply
 * `background: var(--el-*)`, so every large-text call is wrong and the surface
 * walk resolves the sheet where the asset paints white. This lane runs on
 * `node` and drives a real headless chromium, which is the only thing that
 * reads a `.mock.html` the way the person accepting a Story reads it.
 *
 * It is also why `tests/design/**` is EXCLUDED from the root config: the `Test`
 * job installs no browser, so a spec that launches one there would fail rather
 * than run twice.
 *
 * ── Why it runs on EVERY branch prefix ──────────────────────────────────────
 * `.github/workflows/ci.yml` has no path filtering at all — every job runs on
 * every pull request — so unlike motir-core there is no `design/*` skip here
 * for this lane to work around. The `design-guards` job is a gate on `deploy`
 * from the moment it exists, per that file's own header.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/design/**/*.test.ts'],
    // One browser launch, two documents. The default pool would give each file
    // its own process and its own chromium; there is one file, and this keeps
    // it that way if a second is added.
    fileParallelism: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
