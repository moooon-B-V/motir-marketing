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
     *
     * ⚠️ `tests/seam/**` IS EXCLUDED FOR THE OPPOSITE REASON, and this one is
     * a CONTRACT rather than a capability (MOTIR-4139). That lane fetches the
     * egress manifest from the live motir-core deployment. It would RUN here
     * perfectly well — and that is the problem: `ci.yml` runs this job on every
     * pull request, so an app.motir.co restart would turn unrelated pull
     * requests red, which is precisely the cross-repository CI coupling
     * `public-surface-hosts.md` AMENDMENT 2 §E's split exists to avoid.
     * `vitest.seam.config.mts` includes exactly what this excludes, and
     * AMENDMENT 3 §B fixes where it may be triggered from: the deploy and a
     * schedule, never `pull_request`. Do not fold it back in.
     */
    exclude: ['node_modules/**', 'tests/design/**', 'tests/seam/**'],
    env: {
      NEXT_PUBLIC_MOTIR_APP_ORIGIN: 'https://app.test.motir.co',
    },
    /*
     * COVERAGE (MOTIR-4121) — this repository's first floor.
     *
     * ⚠️ IT RUNS INSIDE `pnpm test`, NOT AS A SECOND JOB, and that is the card's
     * own requirement ("the suite runs in the existing `test` job with no new CI
     * job"). `ci.yml`'s header says not to declare a gate before its job exists;
     * this adds a floor without adding a job, so the `test` gate that already
     * exists is the one that enforces it.
     *
     * ⚠️ `include` IS AN OPT-IN LIST, DELIBERATELY, and it is the same shape
     * motir-core uses. A repository-wide default would put every landing-page
     * component under a floor nobody measured, and the honest way to introduce
     * coverage to a repository that has never had it is one measured surface at
     * a time. What is listed here is what MOTIR-3877 added — MEASURED FIRST,
     * then pinned at the floor, per motir-core's own rule for that list.
     *
     * ⚠️ AND A FILE NOT IN THE LIST IS NOT MEASURED, which is exactly the defect
     * MOTIR-4120 found on the other side of this story: the sibling entry there
     * was a literal path, so five new route files inherited no floor at all and
     * the gate was green because it was measuring nothing. Adding a `/p/*` file
     * without adding it here reproduces that, so the list is checked by a test.
     */
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text-summary'],
      include: [
        'lib/publicProject.ts',
        'app/p/**/*.tsx',
        // MOTIR-4220. Added WITH the files rather than after them, which is the
        // rule the entry above earned: a file outside this list is not
        // measured, and a gate that measures nothing is green.
        'lib/publicHost.ts',
        'lib/hostResolution.ts',
        'lib/tenantDomain.ts',
        'proxy.ts',
      ],
      /*
       * ⚠️ EVERY EXCLUSION HAS A REASON, and the reasons are different — a list
       * of paths with one blanket justification is how a gate stops measuring
       * things nobody decided to stop measuring.
       *
       *  • `changelog.xml/route.ts` — a pass-through whose whole behaviour is a
       *    status mapping against a real upstream. Covered end to end in the
       *    browser lane, which has one; a jsdom test would assert a mock.
       *  • `opengraph-image.tsx` — renders a raster through satori, which jsdom
       *    cannot execute at all. The browser lane FETCHES the image and checks
       *    its bytes, which is the only assertion that means anything.
       *  • `**\/page.tsx` and `tabPage.tsx` — async Server Components. Covering
       *    one means awaiting it, and what it does is compose a read with a
       *    render: both halves are already covered — the read in
       *    `lib/publicProject.ts` at 100%, the render in the component tests —
       *    and the composition is what the browser lane walks. MOTIR-4121 says
       *    in terms not to duplicate the E2E. This is the same gap motir-core's
       *    own config records for its `page.tsx` files, for the same reason.
       *  • `layout.tsx` — nine lines of chrome composition with no branch.
       */
      exclude: [
        'app/p/**/changelog.xml/route.ts',
        'app/p/**/opengraph-image.tsx',
        'app/p/**/page.tsx',
        'app/p/**/layout.tsx',
        'app/p/**/_components/tabPage.tsx',
      ],
      /*
       * MEASURED FIRST, then pinned at the floor — motir-core's rule for its own
       * list, followed here. On this branch: `lib/publicProject.ts` 100 across;
       * `ActRail` / `ProjectHeader` / `Rows` / `States` / `JsonLd` 100 lines.
       */
      thresholds: {
        'lib/publicProject.ts': { lines: 90, functions: 90, branches: 90 },
        // MEASURED FIRST, then pinned at the floor — the same rule the entries
        // beside it follow. On this branch: `publicHost` and `tenantDomain` 100
        // lines, `hostResolution` and `proxy` 100 lines.
        'lib/publicHost.ts': { lines: 90, functions: 90, branches: 90 },
        'lib/hostResolution.ts': { lines: 90, functions: 90, branches: 85 },
        'lib/tenantDomain.ts': { lines: 90, functions: 90, branches: 85 },
        'proxy.ts': { lines: 90, functions: 90, branches: 85 },
        'app/p/**/_components/*.tsx': {
          lines: 90,
          functions: 90,
          branches: 75,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
