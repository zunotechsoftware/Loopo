---
last_verified: 2026-09-13
---

# Loopo — Project Overview (verified)

OLX-class marketplace. Monorepo, 4 apps at repo root:

| Path | Role | Stack (verified from package.json) |
|---|---|---|
| `loopo-backend` | API | NestJS 11, Prisma 6 + PostgreSQL, Redis (ioredis, BullMQ queues, socket.io redis adapter), Socket.io websockets, JWT + Passport (local, Google OAuth, Apple), AWS S3, Sharp, Helmet, Throttler |
| `loopo-client` | Buyer/seller web app | Next.js 16.3, React 19.2, Redux Toolkit, Tailwind v4 |
| `loopo-admin` | Admin/ops panel | Next.js 16.2, React 19.2, MUI v6, Recharts, socket.io-client, axios |
| `loopo-flutter` | Mobile app | Flutter, Dart SDK ^3.12.2, http, image_picker, flutter_dotenv |

Repo is on GitHub: `zunotechsoftware/Loopo`. Working branch at session start: `Frontend` (based off `main`; `development` also exists remotely).

## Backend module inventory (verified via `app.module.ts`, 30 modules)
addresses, admin, analytics, audit-logs, auth, brands, categories, chat, complaints,
dashboard, email-templates, interactions, kyc, moderation, notification-settings,
notifications, orders, payments, products, rbac, reports, reputation, reviews, search,
seller-profile, subscriptions, support, users.

Payments has a real dual-provider abstraction (`payment-provider.factory.ts` +
`interfaces/payment-provider.interface.ts`) backing both Razorpay and Stripe providers —
verified as intentional, not dead code.

## Database (verified via `prisma/schema.prisma`)
**112 models.** This is a mature, comprehensive schema — see [database.md](database.md)
for the full model inventory grouped by domain. The backend is materially further along
than "tangled/partially implemented" would suggest, at least at the data-model layer.

## Verified build health (2026-09-13) — see [implementation-status.md](implementation-status.md)
All four apps build clean as of this audit. They did NOT all start that way — see
[known-issues.md](known-issues.md) and [decisions.md](decisions.md) for what was found
and fixed this session.

## Deferred scope
The originating instructions call for a large `agents/00-master` + `02-domain` +
`03-backend` … `08-ops` documentation scaffold (~150 files). That was deliberately
**not** built this session — see [decisions.md](decisions.md) for why. Only
`01-context/` (this compressed memory) was created, and it reflects verified repo
findings, not speculative/generic content.
