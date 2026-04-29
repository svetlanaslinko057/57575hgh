# ATLAS DevOS — Развёрнутый проект

## Что развёрнуто из https://github.com/svetlanaslinko057/324324dfd

Платформа из 3 частей, объединённых одним FastAPI бэкендом.

### 1. Backend (FastAPI + Socket.IO + MongoDB)
- `/app/backend/server.py` — основной сервер (~22k строк, 50+ модулей)
- Запущен на порту 8001, доступ через `/api/*`
- MongoDB локально на 27017 (db: `test_database`)
- Seed: 4 quick-access пользователя + demo-проект "Acme Analytics Platform" (3 модуля) + mock-invoices/payouts/earnings
- Auto-loops: GUARDIAN (120s), MODULE_MOTION (15s), OPERATOR (300s), EVENT_ENGINE (15min)

### 2. Mobile App (Expo SDK 54, React Native 0.81)
- `/app/frontend/` — клиентский Expo Router app
- Roles: client, developer, admin, operator, lead
- Доступен через preview-URL на `/` (порт 3000)

### 3. Web Platform (React CRA + Tailwind + Radix UI)
- `/app/web/` — лендинг, клиентский кабинет, dev-кабинет, админка
- Собрана `yarn build` → `/app/web/build` (4 MB)
- Сервится бэкендом на `GET /api/web-ui/*` (см. `server.py` строки 22766-22796)

## Endpoints
- **Web Platform**: `https://expo-admin-suite.preview.emergentagent.com/api/web-ui/`
- **Mobile (Expo)**: `https://expo-admin-suite.preview.emergentagent.com/`
- **API**: `https://expo-admin-suite.preview.emergentagent.com/api/*`

## Test credentials (`/app/memory/test_credentials.md`)
- admin@atlas.dev / admin123
- john@atlas.dev / dev123 (developer)
- client@atlas.dev / client123
- multi@atlas.dev / multi123

## Этап 3 — Wallet / Withdraw / Admin payouts ✅

Полный денежный цикл замкнут и протестирован end-to-end:

| Шаг | API | Изменения |
|-----|-----|-----------|
| Dev requests $600 | `POST /api/developer/withdraw` | avail −600, pending +600 |
| Admin approves | `POST /api/admin/withdrawals/{id}/approve` | status → approved |
| Admin marks paid | `POST /api/admin/withdrawals/{id}/mark-paid` | pending −600, withdrawn +600 |

Реализованные экраны:
- Mobile: `/app/frontend/app/developer/wallet.tsx` — hero-balance + Withdraw-modal
- Web: `/app/web/src/pages/DeveloperEarnings.js` + `/app/web/src/pages/AdminWithdrawalsPage.js`

## Что было сделано при развёртывании
1. Склонирован репозиторий
2. Скопирован код в `/app/{backend,frontend,web}` (с сохранением protected `.env` файлов)
3. Очищен `/root/.cache/pip` + `/root/.npm` (~3 GB) для освобождения /app partition
4. Установлены зависимости backend (torch, sentence-transformers, resend, emergentintegrations и т.д.)
5. Установлены deps web (yarn install), собран bundle (`yarn build`), удалён `node_modules`
6. Перезапущены сервисы supervisor (backend, expo, mongodb) — все RUNNING

## Все сервисы
```
backend                          RUNNING   port 8001
expo                             RUNNING   port 3000
mongodb                          RUNNING   port 27017
nginx-code-proxy                 RUNNING
```

## Архитектура
> "UI renders JSON. Backend is the source of truth."
> Web и Mobile — это лишь проекции бэкенда. Никакой client-side aggregation/filtering/computing (см. `/app/web/ARCHITECTURE.md`).

## MOCKED / Disabled в dev-режиме
- **Email (Resend)**: `RESEND_API_KEY not set` → email delivery disabled. OTP работает в DEV_MODE (код в логах).
- **Cloudinary**: MOCK режим (no API keys), файлы сохраняются локально в `/app/backend/uploads`.
- **Payment provider (WayForPay/Stripe)**: MOCK provider активен (нет ключей).
- **Google OAuth / Push notifications / LLM (OpenAI/Gemini)**: ключи не настроены — функции работают как заглушки.
