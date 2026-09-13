---
last_verified: 2026-09-13
---

# Known Issues

## OPEN

### P0 — Aadhaar KYC image still in git history on origin/development
`aadhaar_front_1788186479093.jpg` (a real Aadhaar ID card image) was committed at the
repo root in `39f8427` and pushed to `origin/development`. Per user decision on
2026-09-13, only the working-tree copy was removed (commit `4d20b0b` on `Frontend`) —
**the file is still recoverable from git history and from `origin/development`**.
User explicitly declined a history purge for now ("just remove going forward").
Revisit: if this repo is or becomes public, or if compliance requires it, this needs
`git filter-repo` + coordinated force-push to fully scrub it. Do not do this
unilaterally — it rewrites shared history every collaborator must re-sync from.
See [decisions.md](decisions.md).

### P0 — Production Dockerfile used `db push --accept-data-loss`; fixed locally, remote DB needs a one-time baseline before deploying
Found via git history: commit `497f85b` (pre-dates this session) switched
`loopo-backend/Dockerfile`'s CMD from `prisma migrate deploy` to
`prisma db push --accept-data-loss` specifically to fix a 502 crash loop. That
crash loop is the exact same root cause found and fixed locally this session:
`migrate deploy` refuses to run (`P3005`) against a database with no
`_prisma_migrations` history (i.e. one provisioned via `db push`, not tracked
migrations) — it's a real production incident, not hypothetical, and it directly
matches the local repro.

`db push --accept-data-loss` "fixed" the crash loop but is genuinely dangerous
long-term: it runs on **every** container start/restart and will silently apply
destructive schema changes to production data with zero review, the moment any
future `schema.prisma` change removes/renames a column.

**Fixed the Dockerfile** to use `prisma migrate deploy` again (this session). But
this alone will crash-loop again on the next deploy unless the **real
staging/production database** gets the same one-time baseline treatment done
locally (see decisions.md). This session deliberately did not touch any
remote/staging DB (explicit user instruction: "keep it local") — someone with
access to the actual Lightsail server / production `DATABASE_URL` needs to run,
**before or during** the next deploy with the updated image:

```sh
# 1. Confirm zero drift first - do NOT baseline if this prints anything
#    other than "-- This is an empty migration."
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
  --to-url "$DATABASE_URL" --script

# 2. Only if step 1 was empty: mark existing migrations as already applied
#    (does not run any SQL, purely bookkeeping)
npx prisma migrate resolve --applied 20260718181804_init
npx prisma migrate resolve --applied 20260823183500_update_schema

# 3. Confirm:
npx prisma migrate status   # should say "Database schema is up to date!"
```

If step 1 is **not** empty (production schema has drifted from what's in
`prisma/migrations` + current `schema.prisma`), stop and investigate rather than
baselining blindly — that would silently paper over real, uncaptured schema
changes.

Also noticed in passing: `loopo-backend/docker-compose.prod.yml` (committed) has
placeholder secrets (`prodpassword123`, `your_jwt_access_secret_change_me`) and an
unfilled `<your-dockerhub-username>` image tag — it's clearly a template, not
something that runs as-is, so the real Lightsail server almost certainly has its
own filled-in version outside this repo. Not verified either way (no server
access) — worth the user double-checking the actual deployed secrets are strong,
independent of this repo's template file.

### P2 — loopo-client has no ESLint config
`npx eslint .` in `loopo-client` fails immediately with "couldn't find an
eslint.config.*" (ESLint v9+ flat-config required, none present). `package.json` has
no `lint` script either, unlike `loopo-backend` and `loopo-admin`. Not a build
blocker (`next build` passes clean either way), but there's currently zero lint
signal on this app. Not fixed this session — needs a deliberate flat-config choice
(what plugin/rule set) rather than a rushed default.

### P2 — loopo-admin has ~197 pre-existing `@typescript-eslint/no-explicit-any` lint errors
Plus one `react-hooks/set-state-in-effect` in `AuthProvider.tsx` (a normal
localStorage-hydration-on-mount pattern — likely a non-issue, not confirmed broken).
Does not block `next build` (Next 16 doesn't run ESLint during build by default here).
Real code-quality debt, but 197 findings is deliberately **not** being bulk-fixed
under deadline pressure — see [decisions.md](decisions.md).

### P2 — Backend CORS: `origin: true` + `credentials: true`
`main.ts` reflects any request Origin back as allowed, with credentials enabled.
Verified there is **no cookie-based auth anywhere in the backend** (no
`cookie-parser`, no `res.cookie`, no `Set-Cookie` — auth is pure Bearer-token), so
the classic CSRF/credential-theft exploitation of this pattern doesn't apply here.
Still broader than necessary; tightening to an explicit allowlist (client/admin
origins from env) is a reasonable hardening pass, not an emergency — not done this
session pending knowing the actual deployed frontend origins.

### RESOLVED — Local dev environment now has DB/Redis/MinIO reachable
Docker was started mid-session (`loopo-postgres`, `loopo-redis`, `loopo-minio`
containers). Local DB was baselined (see decisions.md) and seeded via
`npx prisma db seed`. Full e2e suite now runs: started at 61 failed/9 passed,
ended this session at **0 failed / 69 passed / 2 skipped** (71 total) after the
fixes below. Local dev DB state: freshly truncated `users`/`categories`/`products`
+ re-seeded as of end of session — re-run `npx prisma db seed` if you need the
full seeded dataset (150 support tickets/complaints, categories, brands, sellers,
products, KYC docs, etc.) rather than an empty table.

### P1/P2 — Admin analytics frontend calls backend routes that don't exist at all
`loopo-admin/src/services/admin.service.ts`'s `analyticsService` calls
`/admin/analytics/summary`, `/users`, `/products`, `/revenue`, `/categories`,
`/search`, `/moderation` — **none of these match any real backend route**. The
only real analytics routes are `AdminAnalyticsController`'s `dashboard`, `search`,
`categories`, `payments` (fixed this session to no longer double-prefix, see
RESOLVED) plus a per-product-ID `products/:id/analytics`. Nothing in
`loopo-client`/`loopo-flutter` references any of `analytics.controller.ts`'s routes
either. This means **the admin analytics page has no working backend behind it at
all** right now, regardless of the double-prefix bug. Not fixed this session —
deciding the real contract (rename backend routes to match the frontend's
expectations, or vice versa, plus building whatever handlers/response shapes
`summary`/`users`/`revenue`/`moderation` actually need) is a scoped feature task on
its own, not a quick bug fix.

### Not yet audited
Most of the ~30 backend modules haven't been read at all yet (this session's code
review was targeted: auth, payments, chat, products, the shared audit-log
interceptor). No cross-platform API-contract pass was done beyond what surfaced
incidentally (the analytics mismatch above). No frontend (client/admin/flutter)
runtime testing was done — only builds/analyze.

## RESOLVED (this session, 2026-09-13)

- **Sensitive file exposure**: Aadhaar image removed from working tree (see OPEN item
  above — history purge still pending, not done).
- **loopo-backend**: 4 TS2349 errors in `test/analytics.e2e-spec.ts` (wrong supertest
  import style vs. every other e2e spec). Fixed. `tsc --noEmit` now 0 errors.
- **loopo-admin**: 115 TypeScript build errors, root-caused to MUI v6 legacy `Grid` vs
  `Grid2` API mismatch across 14 pages, plus 3 unrelated real bugs (KYC status-filter
  dead-code branches causing admins to miss UNDER_REVIEW submissions when filtering by
  "Pending"; missing `Shield` icon import in complaints detail page; duplicate
  `borderRadius` key in `EmailTemplateSidebar.tsx`). All fixed; `next build` passes with
  `typescript.ignoreBuildErrors` removed (it had been silently masking all of the above).
- **loopo-client**: `next build` and `tsc --noEmit` both clean as-is (including current
  WIP: mockData removal, new `src/types/`).
- **loopo-flutter**: `flutter analyze` clean (4 info-level style notes only, no errors).
- **loopo-backend, JWT auth bypass (P0)**: `jwt.strategy.ts`, `jwt-refresh.strategy.ts`,
  `ws-jwt.guard.ts`, `chat.gateway.ts` all verified tokens with
  `configService.get('JWT_ACCESS_SECRET') || 'fallback_secret'`. If that env var is
  ever unset in a real deployment, every one of these silently accepts any JWT signed
  with the known literal `'fallback_secret'` — full REST + WebSocket auth bypass, no
  signing access needed. Token *signing* never had this fallback (would throw
  instead), so this was purely on the verification side. Fixed: all four now throw /
  disconnect immediately if the secret isn't configured, instead of degrading to a
  known value.
- **loopo-backend, payment forgery (P0)**: `RazorpayProvider` fell back to a hardcoded
  `'secret_placeholder'` for `RAZORPAY_KEY_SECRET` with no mock-mode guard — and that
  secret is the HMAC key `verifyPayment()` uses to check a client-supplied signature on
  the authenticated `POST /payments/verify` endpoint. Neither `RAZORPAY_KEY_ID` nor
  `RAZORPAY_KEY_SECRET` are set anywhere in `.env`/`.env.example`, so this fallback is
  **live in this repo's own dev environment right now**: any authenticated user with
  `payments.manage` could self-sign a fake success signature and get a purchase
  fulfilled without paying. Fixed by extending Stripe's existing `isMock` pattern to
  Razorpay (throws in production if unconfigured; simulates cleanly otherwise). Also
  hardened both providers: `BYPASS_WEBHOOK_SIGNATURE_FOR_TESTING` (both) and
  `BYPASS_GATEWAY_API` (Stripe) now require `NODE_ENV !== 'production'`, and
  `verifyWebhookSignature` rejects rather than HMAC'ing against an empty secret.
- **loopo-backend, chat authorization (P1)**: `toggleReaction()` let any authenticated
  user react to any message by ID, with no check they're a participant in that
  message's conversation (every other chat mutation — edit/delete/getMessages —
  correctly scoped by participant/sender). Fixed: added the same participant check.
- **loopo-flutter**: `DebugConfig.isBypassAuth`'s comment claimed it was overridable
  via `--dart-define=BYPASS_AUTH=true`; the field is a plain `const bool = false`,
  never wired to `bool.fromEnvironment`. Currently inert either way. Comment corrected
  to state it's hardcoded and explain why it's deliberately not wired to a runtime
  override (an auth-bypass flag shouldn't be flippable via a build flag/CI mistake).

All of the above were spot-checked via manual code review of the auth/payments/chat
modules specifically (guard construction, secret handling, ownership scoping) — not
found by a tool or exhaustive scan. Treat this as evidence the pattern *can* occur in
this codebase, not proof no other instance exists elsewhere.

### e2e test suite + real bugs it surfaced (Docker started mid-session)
Getting the full e2e suite from 61 failed/9 passed to 0 failed/69 passed/2 skipped
surfaced several genuine app bugs alongside pure test-fixture issues:

- **Real bugs fixed:**
  - `AuditLogInterceptor` crashed (`TypeError`) on any `@LogAudit`-decorated
    POST/PUT/PATCH route that received no body (e.g. `PATCH .../approve`) —
    every such action's audit log entry was silently never written.
  - `AdminProductsController.findPending()` never actually filtered by PENDING —
    `ProductsService.findPublicListings()` hardcoded `status: APPROVED`
    regardless of the caller's intent, so the admin moderation "pending" queue
    always returned approved-or-nothing. Fixed via an explicit
    `statusOverride` param for trusted admin callers, and — importantly —
    `query.status` (bindable from the public `GET /products` query params) is
    now never read at all, closing a latent IDOR the naive fix would have
    reopened (anyone could otherwise pass `?status=PENDING`/`REJECTED` to the
    anonymous endpoint).
  - `chat.module.ts` and `products.module.ts` both registered BullMQ queues
    named `image-compression`/`thumbnail-generation` with unrelated, mutually
    incompatible processors — a genuine cross-feature job-misrouting bug, not
    hypothetical (both had live producers). Renamed products' side to
    `product-image-compression`/`product-thumbnail-generation`.
  - `analytics.controller.ts`'s 5 controllers double-prefixed their routes
    (`/api/v1/v1/...`) — confirmed against the live running server, not just
    the decorator. Fixed (see the separate admin-analytics-contract item above
    for why this still doesn't make the admin analytics page work).
  - Removed unused default NestJS scaffold (`AppController`/`AppService` +
    their specs) — never wired into `AppModule`, confirmed via a bare
    `AppModule` boot returning `Cannot GET /`.
- **Test-only fixture bugs fixed** (no production impact): `auth.e2e-spec.ts`
  truncating the shared `roles` table in its own `afterAll`, breaking every
  suite that ran after it alphabetically; `roles: ['CUSTOMER']`/`['MODERATOR']`
  hardcoded into manually-signed JWTs in 4 spec files even though neither role
  exists (only `SUPER_ADMIN`/`ADMIN`/`USER` are seeded); two specs reading
  `register()`'s response as if it returned the created user (it deliberately
  doesn't — see `authSlice.ts`'s `registerUserThunk`, which already knows this
  and follows up with a real `login()` call); two specs mocking BullMQ queue
  tokens with no matching processor override, which breaks Worker registration
  for that queue entirely (`"Worker requires a connection"`) — removed the
  unmatched mocks rather than adding more overrides, since a real Redis is
  reachable and letting those run for real is simpler.

Local Postgres/Redis/MinIO (`loopo-postgres`, `loopo-redis`, `loopo-minio`
containers) needed Docker Desktop started mid-session; the DB also needed a
migration baseline (see decisions.md) since it had been provisioned via
`db push` rather than tracked migrations — same risk exists for staging/prod if
provisioned the same way, but per explicit user instruction this was kept
local-only; no remote/staging DB was touched.
