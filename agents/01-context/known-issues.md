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

### Local dev environment: no DB/Redis reachable
Docker Desktop's daemon isn't running in this environment (`docker ps` fails to
connect). Couldn't run `prisma migrate status` (needs a live DB), e2e tests, or any
integration test this session. Migration-drift and runtime behavior remain
**unverified** — only static analysis (tsc, build, analyze, unit tests with mocks)
was possible. Start Docker Desktop (or point `DATABASE_URL`/`REDIS_HOST` at a
reachable instance) before the next session that needs this.

### Not yet audited
Everything not explicitly listed under RESOLVED below is simply **not yet checked**:
full runtime behavior of auth/chat/search/moderation flows (only static/code-review
checks were done, see RESOLVED for what that covered), cross-platform API-contract
consistency (client/admin/flutter vs actual backend DTOs), Prisma migration drift,
seed data, CI workflows, mobile builds (analyzed only, not built). The auth/payments/
chat code review this session was targeted (guard/secret/ownership patterns), not
an exhaustive pass over all 30 backend modules — most modules haven't been read yet.

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
