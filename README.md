# OmniChat

Premium AI aggregator (GPT, Claude, Llama) with no-VPN server-side proxy, Antilopay billing, and RU/EN i18n.

## Stack

Next.js 14 (App Router) · TypeScript · PostgreSQL + pgvector · Prisma · Tailwind + shadcn · Zustand + React Query · Framer Motion · next-intl · Docker.

## Quick start

```bash
cp .env.example .env.local
# set ANTHROPIC_AUTH_TOKEN and DATABASE_URL

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000 → redirects to `/ru`.

## Docker

```bash
docker compose up --build
```

Brings up: app (3000), postgres with pgvector (5432), redis (6379).

## Environment

| Variable | Purpose |
|---|---|
| `ANTHROPIC_BASE_URL` | Claude Hub endpoint (`https://api.claudehub.fun`) |
| `ANTHROPIC_AUTH_TOKEN` | Server-side key — **never exposed to client** |
| `DATABASE_URL` | Postgres connection string |
| `ANTILOPAY_PROJECT_ID` / `ANTILOPAY_SECRET_KEY` / `ANTILOPAY_WEBHOOK_SECRET` | Payment gateway |

All Claude Hub calls go through `/src/app/api/chat/route.ts` (Node runtime, streaming SSE).

## Project layout

```
src/
  app/
    [locale]/
      page.tsx          landing
      chat/             main interface (+ layout with glass sidebar)
      login/
      billing/
    api/
      chat/             Claude Hub proxy (streaming)
      models/           model registry
      antilopay/webhook payment webhooks
  components/
    ui/                 primitives (button, input, card)
    chat/               model selector, message bubble, input bar
    layout/             sidebar
    providers/          react-query
  lib/
    ai/                 claude-hub.ts, models.ts
    antilopay/          payment client
    prisma/             db client
    utils/
  store/                zustand
  messages/             ru.json · en.json
  i18n/                 config + request handler
prisma/
  schema.prisma
  seed.ts
```

## Models (seeded)

| Slug | Provider | Tier | Vision |
|---|---|---|---|
| gpt-5-4-omni | openai | Premium | ✅ |
| claude-opus-4-6 | anthropic | Premium | ✅ |
| claude-sonnet-4-5 | anthropic | Premium | ✅ |
| claude-haiku-4-5 | anthropic | Free | ✅ |
| llama-3 | meta | Free | — |

## Notes

- Never hardcode API keys — the runtime reads them from `.env.local`.
- pgvector is enabled for future RAG.
- `src/middleware.ts` handles locale prefixes (`/ru`, `/en`).
