/*
 * The lane's two ports, in ONE place — imported by `playwright.config.ts`, by
 * the stub server and by any spec that needs to address the stub directly.
 *
 * ⚠️ IT EXISTS BECAUSE A SPEC MUST NEVER READ `NEXT_PUBLIC_MOTIR_APP_ORIGIN`.
 * `ci.yml` sets that variable at WORKFLOW level, to production, because the
 * `build` and `deploy` jobs need it there. A spec that read it with a local
 * fallback — `process.env[...] ?? 'http://127.0.0.1:4319'` — therefore behaved
 * completely differently in the two places: locally the variable is unset and
 * the fallback took it to the stub, while in CI it resolved to
 * `https://app.motir.co` and the spec REACHED PRODUCTION. It failed with a
 * confusing diff (`PROJECT_NOT_FOUND` where the stub answers `STUB_NO_FIXTURE`),
 * and the confusing diff was the lucky part: a spec shaped slightly differently
 * would have gone green against the live API and nobody would have known this
 * lane was making cross-repository network calls on every pull request — the
 * exact coupling `public-surface-hosts.md` AMENDMENT 2 §E splits its jobs to
 * avoid.
 *
 * The app under test is unaffected either way: `playwright.config.ts` passes
 * `NEXT_PUBLIC_MOTIR_APP_ORIGIN: STUB_ORIGIN` explicitly into the webServer's
 * build, which overrides the ambient value. Only the RUNNER's environment was
 * ever wrong, which is why 43 of 44 specs passed.
 */

/** The stub's port. One literal, read by the stub and by the app's origin. */
export const STUB_PORT = 4319

/** The site's own port under test — not 3000, so a `pnpm dev` can stay running. */
export const SITE_PORT = 4318

export const STUB_ORIGIN = `http://127.0.0.1:${STUB_PORT}`
export const SITE_ORIGIN = `http://127.0.0.1:${SITE_PORT}`
