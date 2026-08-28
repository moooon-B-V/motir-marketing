# syntax=docker/dockerfile:1
#
# motir-marketing on Fly.io — the production image (MOTIR-1455).
#
# Modelled on motir-core's Dockerfile, minus everything that repo needs and this
# one does not: no Prisma, no migration lane, no worker process group, no
# design-system workspace build. What is kept is the shape the host decided —
# `output: 'standalone'`, one long-running Node process, HOSTNAME=0.0.0.0 —
# per `motir-core/docs/decisions/marketing-site-hosting.md` Q1.

# ── deps ────────────────────────────────────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ── build ───────────────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm next build

# ── runner ──────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# ⚠️ HOSTNAME MUST be 0.0.0.0, and omitting it FAILS SILENTLY. Next's standalone
# server binds the CONTAINER HOSTNAME by default: the process logs "✓ Ready",
# every health signal looks correct, and nothing outside the container can reach
# it — on a first deploy it presents as a networking problem and is debugged as
# one. Learned on motir-core's spike (MOTIR-2383); inherited here rather than
# re-learned.
ENV HOSTNAME=0.0.0.0
ENV PORT=8080
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone bundle carries its own minimal node_modules; static and public
# are NOT included by Next and must be copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
