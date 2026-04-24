# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Install ALL deps (including dev) so Prisma + tsx can run at build & seed time
# (prisma/ copied above so the postinstall `prisma generate` hook can find the schema)
RUN npm install --no-audit --no-fund --include=dev

COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl

# Copy full app (we keep node_modules with dev deps for tsx-based seed)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

# On first boot:
#  1. push schema (creates tables — no migration files needed yet)
#  2. seed model registry (idempotent upserts)
#  3. start Next.js
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npx prisma db seed || true; npm run start"]
