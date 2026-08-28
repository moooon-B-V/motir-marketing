# motir-marketing

The public marketing site for **Motir** — the AI planning, project-management and
agent orchestration platform — served at [motir.co](https://motir.co).

The application itself lives at [app.motir.co](https://app.motir.co) and is built
from [`motir-core`](https://github.com/moooon-B-V/motir-core). This repository is
the marketing site only; it holds no application code and reaches no database.

## Where it runs

A Fly.io app, `motir-marketing`, in org `moooon`, primary region `iad` — beside
`motir-core` and `motir-ai`. The decision, its rejected alternatives and the DNS
constraint that settled it are recorded in `motir-core`'s
[`docs/decisions/marketing-site-hosting.md`](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/marketing-site-hosting.md).

A push to `main` that passes lint, typecheck and build is deployed by
`.github/workflows/ci.yml`. There are no preview deployments, deliberately.

## Local development

```bash
pnpm install
pnpm dev
```

Requires Node 22+ and pnpm 11.

## Status

The site is currently an **empty scaffold** — the repository, the image, the
pipeline and the domain, with a placeholder page. The landing itself is tracked
as MOTIR-1152 (build), MOTIR-1143 (design) and MOTIR-1144 (copy).

## Licence

GPL-3.0-only, matching `motir-core`. © moooon B.V.
