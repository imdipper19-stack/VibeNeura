# OmniChat — журнал прогресса

**Дата последней сессии:** 2026-04-22
**Статус:** работали над P0/P1/P3. Билд падал на отсутствующем `@/lib/billing/daily-limit` — модуль создан, добавлен `ioredis`. Нужно перебилдить и проверить.

## На чём остановились (2026-04-22)
1. Создан `src/lib/billing/daily-limit.ts` — счётчик дневного лимита FREE-юзеров в Redis (ioredis, INCR + TTL 26h, fail-open). `DAILY_LIMIT = 20`.
2. В `package.json` добавлен `ioredis ^5.4.1`.
3. В `src/app/api/chat/route.ts` удалена болтающаяся строка `userMessageContent = ...` (необъявленная переменная).

## План на завтра
1. `del package-lock.json` (если есть) → `npm install` локально, чтобы залочить ioredis.
2. `docker compose build app --no-cache` — проверить, что билд проходит.
3. `docker compose up -d` → http://localhost:3000.
4. Уточнить у пользователя точный скоуп P0/P1/P3 (в файлах не зафиксирован).

---

## Архив: предыдущая сессия 2026-04-21

**Дата последней сессии:** 2026-04-21
**Статус:** код готов, Docker-сборка падает на `npm install` (exit 1) — нужно дебажить.

---

## Что сделано сегодня

### 1. Структура проекта (готово)
```
C:\Users\S6lev\Desktop\OmniChat\
├── src/
│   ├── app/
│   │   ├── layout.tsx                       # root html + шрифты
│   │   ├── globals.css                      # tailwind + .glass / .bloom / liquid loader
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                   # i18n provider + react-query
│   │   │   ├── page.tsx                     # лендинг с hero/features
│   │   │   ├── login/page.tsx
│   │   │   ├── billing/page.tsx
│   │   │   └── chat/
│   │   │       ├── layout.tsx               # sidebar + main
│   │   │       └── page.tsx                 # чат со streaming SSE
│   │   └── api/
│   │       ├── chat/route.ts                # Claude Hub proxy (SSE)
│   │       ├── models/route.ts              # модели из БД + fallback
│   │       └── antilopay/webhook/route.ts   # HMAC-проверка
│   ├── components/
│   │   ├── ui/{button,input,card}.tsx
│   │   ├── chat/{model-selector,message-bubble,chat-input}.tsx
│   │   ├── layout/sidebar.tsx
│   │   └── providers/query-provider.tsx
│   ├── lib/
│   │   ├── ai/{claude-hub.ts, models.ts}
│   │   ├── antilopay/client.ts
│   │   ├── prisma/client.ts
│   │   └── utils/cn.ts
│   ├── store/chat-store.ts                  # zustand
│   ├── messages/{ru,en}.json
│   ├── i18n/{config,request}.ts
│   └── middleware.ts                        # next-intl locale prefix
├── prisma/
│   ├── schema.prisma                        # User, Session, ModelRegistry, Chat, Message, Transaction + pgvector
│   └── seed.ts                              # 5 моделей из ТЗ
├── public/favicon.svg
├── package.json                             # Next 14.2.18, React 18, Prisma 5.22, next-intl 3.26
├── tsconfig.json                            # strict, paths "@/*"
├── next.config.mjs
├── tailwind.config.ts                       # палитра Aetheric Foundry
├── postcss.config.js
├── .eslintrc.json
├── .env.local                               # ЗАПОЛНЕН (см. ниже)
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile                               # multi-stage, Alpine + openssl
├── docker-compose.yml                       # app + pgvector:pg16 + redis:7
├── start.bat                                # one-click запуск
├── stop.bat
├── README.md
└── Desing/                                  # исходные мокапы пользователя (не трогать)
```

### 2. Заполненный `.env.local`
- `ANTHROPIC_BASE_URL=https://api.claudehub.fun`
- `ANTHROPIC_AUTH_TOKEN=sk-hub-dUZaHHmlL9vFHZjtb6ffE3656ywMi3yk` (из промта)
- `DATABASE_URL=postgresql://omnichat:omnichat@localhost:5432/omnichat?schema=public`
- `NEXTAUTH_SECRET` сгенерирован
- Antilopay креды пустые (стаб)

В `docker-compose.yml` те же переменные продублированы для `app`-сервиса (с `db` вместо `localhost`).

### 3. Docker-конфигурация
- `pgvector/pgvector:pg16` (621 МБ) — **скачан**
- `redis:7-alpine` (61 МБ) — **скачан**
- `omnichat-app` — **НЕ собран**, билд падает на `npm install --include=dev` (шаг 5/8 в builder-стейдже)

---

## ⚠ На чём остановились

`npm install` в Docker-контейнере (Alpine + Node 20) завершается с **exit code 1**.

Точную причину ошибки в чате не увидели — пользователь прервал диагностический ребилд. Скорее всего одно из:

1. **Сетевая проблема** внутри Alpine (DNS / прокси / медленный npm registry).
2. **Конфликт peer-deps** между `next-intl@^3.26` и Next 14.
3. **Несовместимость версии Node** в Alpine с `tsx@^4.19.2` (нужна Node ≥18.18).
4. **Native build для Prisma** падает из-за отсутствия `python3 / make / g++` в Alpine (хотя обычно `prisma` это делает на postinstall и должно работать).

---

## План на следующую сессию

1. **Получить точный лог ошибки**:
   ```cmd
   cd C:\Users\S6lev\Desktop\OmniChat
   docker compose build app --progress=plain --no-cache 2>&1 | findstr /C:"npm error" /C:"npm ERR" /C:"ERROR"
   ```
   Или полный лог в файл:
   ```cmd
   docker compose build app --progress=plain --no-cache > build.log 2>&1
   ```

2. **Готовые workarounds в порядке вероятности успеха:**

   a. **Сменить Alpine на Debian-slim** в Dockerfile (`node:20-slim` вместо `node:20-alpine`) — убирает 90% проблем с native-модулями:
   ```dockerfile
   FROM node:20-slim AS builder
   RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
   ```

   b. **Сгенерировать `package-lock.json` локально и закоммитить**, чтобы внутри контейнера шёл `npm ci` вместо `npm install`:
   ```cmd
   cd C:\Users\S6lev\Desktop\OmniChat
   npm install --package-lock-only
   ```
   Затем в Dockerfile заменить `npm install` на `npm ci`.

   c. **Запускать БЕЗ Docker для разработки:** Docker нужен только для prod-деплоя на VPS. На локалке достаточно:
   ```cmd
   docker compose up -d db redis
   npm install
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```
   Это в разы быстрее и проще для итераций.

3. **Проверить `package.json` на конфликты** — сделать `npm view <pkg> peerDependencies` для подозрительных.

4. После исправления — `start.bat` должен открывать http://localhost:3000 без вмешательства.

---

## Что НЕ трогать
- Папку `Desing/` — это исходные мокапы дизайна от пользователя.
- `promt.md` — техническое ТЗ.
- Палитру Aetheric Foundry в `tailwind.config.ts` (точные hex из дизайна).

## Полезные команды

```cmd
docker compose ps                # статус контейнеров
docker compose logs -f app       # логи приложения
docker compose down              # остановить
docker compose down -v           # остановить + удалить тома БД
docker system prune -a           # очистить всё (если совсем затык)
```
