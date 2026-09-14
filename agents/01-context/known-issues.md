---
last_verified: 2026-09-13
---

# Known Issues

## OPEN

### RESOLVED — P0: /admin/notifications had zero auth guards, fully open to unauthenticated read/write/delete
Found while sweeping loopo-client's Notifications page for a 404
(`GET /notifications` doesn't exist for regular users - see the separate open
item below) and noticing there are three different notification-related
controllers. `src/modules/notifications/controllers/notifications.controller.ts`
(`NotificationsController`, mapped to `admin/notifications` - confirmed this
is the real, reachable, currently-in-use path per the duplicate-controller
audit above) had **no `@UseGuards` at all**, unlike every other admin
controller in this codebase. There is no global auth-by-default in this app
(`app.module.ts` only registers a global `ThrottlerGuard` for rate limiting;
every controller must opt in to `JwtAuthGuard` explicitly) - so this
controller's full CRUD (list/get/create/update/delete on the system-wide
notification broadcast list) was reachable by anyone, no token required.

**Confirmed live and exploited before fixing, not just by reading code:**
`curl -X POST http://localhost:5000/api/v1/admin/notifications` with no
`Authorization` header and a valid body returned **201** and created a real
notification row. Fixed by adding the standard
`@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)` +
`@Permissions('admin.notifications.manage')` (class-level, matching every
sibling admin controller) - re-verified live: the same unauthenticated GET
and POST now both return 401, while an authenticated superadmin request
still succeeds (200) with no behavior change for real users. The
test-injected row from the exploit attempt was deleted afterward. All 17
backend unit suites / 83 tests still pass.

### OPEN — loopo-client: no user-facing "my notifications" endpoint exists at all
`notificationsApi.ts` calls `GET /notifications?page=&limit=`, which 404s -
there is no controller anywhere registered at a plain `/notifications` path.
The only notification-related backend surfaces are `/notification-settings`
(preferences, a different resource) and `/admin/notifications` (the
system-wide broadcast list audited above, admin-only, not scoped to "my"
notifications and not the right shape for an inbox anyway). This is a real,
previously-undocumented feature gap - the client's Notifications screen can
never load anything but a permanent 404, for every user. Not fixed this
pass: needs a new user-scoped endpoint (list a user's own delivered
notifications, mark-read, mark-all-read - the client already expects exactly
this shape), which is backend feature work, not a wiring fix.

### P1 — loopo-admin: several pages are still 100% hardcoded fake data despite a working real endpoint existing
Found via a full visual sweep of all 21 admin pages (screenshot + console/network
check per page, real superadmin login). Dashboard, the Listings-page item list,
and the Complaints stats/category-breakdown widgets were the same class of bug
and are now fixed (see the RESOLVED entry above this one). Still fake, not fixed
this pass:
- **Reviews** (`(admin)/reviews/page.tsx`): entirely a ~1000-line hardcoded
  `INITIAL_REVIEWS` array with no fetch at all, despite `reviewsService` in
  `admin.service.ts` already pointing at a real, working `GET /admin/reviews`
  (confirmed live: returns real `Review` rows, currently empty since none are
  seeded). Not fixed because the mock data's shape (`ratingBreakdown` with
  quality/value/delivery/customerService, a seller `response`/reply feature, a
  `moderationHistory` timeline) has **no equivalent in the real `Review` /
  `ReviewRating` Prisma models** (real rating sub-scores are named differently -
  communication/responseTime/productAccuracy/deliveryExperience/behaviour/
  valueForMoney - and there's no reply or moderation-log concept at all).
  Wiring this properly means either a real frontend simplification to match
  what the backend actually has, or backend additions - a bigger, deliberate
  piece of work, not a drop-in fetch call.
- **Roles & Permissions** (`(admin)/roles/page.tsx`): `MOCK_ROLES`, no fetch.
  `rolesService.getAll()`/`getPermissions()` in `admin.service.ts` call
  `/admin/roles` and `/admin/permissions`, **neither of which exist on the
  backend at all** (confirmed against the live route dump - no controller
  registers either path). This needs real backend work (a Role/Permission CRUD
  API over the existing `roles`/`permissions`/`role_permissions` tables), not
  just a frontend fetch.
- **Payments** (`(admin)/payments/page.tsx`): hardcoded transactions
  (`John Doe`, `PayPal` - a provider this backend doesn't even integrate).
  `paymentsService` calls `/admin/payments/transactions`, `/subscriptions`,
  `/refunds` as separate GETs, but the real controller (found via the live
  route dump) only exposes `GET /admin/payments`, `GET /admin/payments/:id`,
  `POST /admin/payments/refunds` - a genuine path/contract mismatch, **and**
  that controller has the exact same double-`api/v1/`-prefix bug documented
  below for reviews, so none of its routes are even reachable at their
  intended paths right now. There's also no "subscriptions" concept anywhere
  in the schema (this is a per-listing marketplace, not a SaaS product) - the
  Subscriptions tab has nothing real to wire to at all. Needs: fix the prefix
  bug, reconcile the frontend's expected paths with the controller's actual
  ones, and either drop the Subscriptions tab or clarify what it should show.
- **Reports** (`(admin)/reports/page.tsx`): a full fake "report library" (58
  generated reports, download counts, scheduled reports) with no fetch and no
  real backend equivalent - a PDF/CSV report-generation module genuinely
  doesn't exist. Don't confuse this with the *other* "reports" concept
  (user-filed abuse/moderation reports about a listing or seller), which does
  have a real, working backend with no admin page at all - see the
  double-prefix-bug entry below for details.
- ~~**Pending Approval**~~ **RESOLVED**: was a separate, fully hardcoded
  duplicate of what the main Listings page already does correctly with a
  `status=PENDING` filter and working Approve/Reject actions. Fixed:
  `Sidebar.tsx`'s "Pending Approval" link now points at
  `/listings?status=PENDING`; the Listings page reads `?status=` via
  `useSearchParams` (wrapped in `Suspense`, required by Next's App Router)
  both on initial load and on subsequent navigation (the page doesn't
  remount when switching between `/listings` and `/listings?status=...` since
  both resolve to the same route - a plain `useState(initialValue)` would
  have gone stale, so this needed a `useEffect` re-syncing off
  `searchParams`). The old `/listings/pending` route itself now just redirects
  to the real page instead of 404ing for anyone with it bookmarked. Also fixed
  a sidebar highlighting bug this surfaced: comparing only `pathname` (no
  query string) made "All Listings" and "Pending Approval" both show active
  at once, since they now share a pathname - `Sidebar.tsx` compares the full
  path (pathname + query string) instead. Verified live: sidebar nav,
  direct old-URL visits, and switching back and forth between the two filters
  all behave correctly (screenshots taken, real seeded listings shown,
  exactly one sidebar item highlighted at a time).
- **Settings** (`(admin)/settings/page.tsx`): `MOCK_AUDIT_LOGS` and
  `MOCK_BANNERS` - `auditLogsService.getAll()` calls `/admin/audit-logs`,
  which (like roles/permissions above) doesn't exist on the backend at all.

### RESOLVED (partially) — loopo-backend: the analytics double-prefix bug existed on 9 controllers, not 1
A full grep for the pattern (`@Controller('api/v1/...')` stacking on top of the
global `api/v1` prefix, producing a dead `/api/v1/api/v1/...` route - the same
bug already found and fixed on the 5 analytics controllers earlier this
session) turned up **9 total occurrences** under `src/modules/admin/*`, all
confirmed against the live route dump. Checked each for a competing
controller already correctly registered at the intended path (the
products/reviews duplicate-controller pattern found earlier this session)
before touching anything - 6 had none and were safe to fix outright; 3 are
genuine duplicates needing a judgment call, not a blind prefix strip.

**Fixed (6, zero collision risk, now live and reachable for the first time):**
`admin/cms` (→ `admin/pages`), `admin/dashboard`, `admin/feature-flags`,
`admin/payments`, `admin/settings`, `admin/system`. Verified live with a real
admin token: `GET /admin/dashboard` now returns real aggregate stats,
`GET /admin/system/health` returns real DB/Redis/storage status,
`PUT /admin/feature-flags` and `PUT /admin/settings` both create real rows -
all were flatly unreachable (404, wrong prefix) before this fix, for every
caller, forever.

While fixing `admin/settings`/`admin/feature-flags`, found the frontend
(`admin.service.ts`'s `settingsService`) also had a contract mismatch
independent of the prefix bug: it called `PATCH /admin/settings/:key` and
`GET`/`PATCH /admin/settings/feature-flags[/:key]`, but the real controllers
are bulk-only (`PUT /admin/settings` with `{settings: [...]}`,
`PUT /admin/feature-flags` with `{flags: [...]}`) and feature flags are their
own top-level resource, not nested under settings. Fixed `settingsService` to
match the real contract; verified live (`PUT` calls to both now return 200
with real created rows). The Settings *page* itself is still `MOCK_...` data
with no fetch calls at all (unchanged, not in scope for this pass) - this
fix means the service layer is now correct and ready whenever that page
gets wired for real.

**Still broken, genuine duplicate controllers - needs a "pick a winner" call,
not a blind rename (same treatment as the products-queue-name duplication
found earlier this session):**
- **Reviews**: `admin/reviews/admin-reviews.controller.ts`
  (`AdminReviewsService`-backed: pagination, type filter, get-by-id, hard
  delete) vs. `reviews/controllers/admin-reviews.controller.ts`
  (`ReviewsService`-backed: list/hide/restore/soft-delete) - the second
  already correctly owns `/admin/reviews` and is what the frontend's
  `reviewsService` points at; the first is fully unreachable dead code with a
  richer feature set.
- **Reports**: `admin/reports/admin-reports.controller.ts`
  (`AdminReportsService`-backed) vs. `reports/controllers/admin-reports.controller.ts`
  (`ReportsService`-backed, already correctly on `/admin/reports`). Note this
  is the **user-filed abuse/moderation reports** feature (reports about a
  listing or seller), a completely different concept from the fake admin
  "Reports" *page* documented above (which depicts a PDF/CSV report-generation
  library that has no backend at all, under either name) - don't confuse the
  two when picking this up. Also newly noticed: `reportsService` in
  `admin.service.ts` already points at the correct, working controller, but
  **no admin page anywhere calls it** - there's a real, functioning backend
  feature for reviewing user-filed reports with zero admin UI for it.
- **Notifications**: `admin/notifications/admin-notifications.controller.ts`
  vs. `notifications/controllers/notifications.controller.ts` (already
  correctly on `/admin/notifications`, and already what the working
  Notifications admin page uses - confirmed live/wired in the sweep above).
  Same shape as the other two; not investigated further since the working
  side is already confirmed fine.

Not fixed this pass - each needs reading both implementations and deciding
whether to rename one aside, merge, or delete, not a mechanical prefix edit.

### RESOLVED — Storage/signed-URL architecture: private bucket + no read-side signing + KYC upload endpoint didn't exist at all
Originally found while auditing KYC document handling for exposure risk (the
opposite problem turned up instead — see history below). Fixed in full this
session, category-by-category, verified live against the running backend + MinIO
(not just by reading code).

**What was actually wrong (two separate bugs):**
1. `S3Service.generatePresignedUploadUrl`/`uploadBuffer` were the only places
   `getSignedUrl`/`GetObjectCommand` appeared anywhere in the backend, both
   exclusively for the upload (PUT) side. The `fileUrl` stored on `MediaFile` and
   returned to every client was a plain, unsigned, permanent URL with no
   corresponding read-side signing — and a freshly-created bucket (no explicit
   ACL/policy) is private by default on both MinIO and real AWS S3.
2. While designing the fix, discovered there was **no backend endpoint anywhere**
   that generates a presigned upload URL for a KYC category or registers a
   `MediaFile` with a KYC category — `CreateKycDto` expects pre-existing
   `frontImageId`/`backImageId`/`selfieImageId` UUIDs that no real client could
   ever obtain. KYC submission was completely non-functional, independent of the
   storage/signing bug.

**The fix, by category** (public vs. private is now a real, enforced split, not
a single bucket-wide policy):
- `PUBLIC_MEDIA_CATEGORIES` in `s3.service.ts` = `PROFILE_IMAGE`, `COVER_IMAGE`,
  `listing_images`, `listing_videos`. `S3Service.onModuleInit` now applies a
  `PutBucketPolicyCommand` granting `s3:GetObject` scoped ONLY to those
  categories' key prefixes (object keys are already `${category}/${userId}/...`,
  so prefix-scoping lines up exactly with category). Everything else — `KYC_FRONT`,
  `KYC_BACK`, `KYC_SELFIE`, `chat-attachments` — gets no policy at all and stays
  private by MinIO/S3's own default.
- `S3Service.getSignedReadUrl(fileKey, expiresIn=900)` (new) generates a
  short-lived signed GET URL, never persisted — regenerated fresh on every read.
  `resolveReadUrl`/`resolveUrlForDisplay`/`extractKeyFromUrl` (new) pick direct-URL
  vs. signed-URL automatically based on category.
- New KYC upload endpoint: `POST /kyc/upload-url` (`KycUploadUrlDto`: `slot`
  FRONT|BACK|SELFIE + fileName/fileType/fileSize) → `KycService.getUploadUrl`
  generates the presigned PUT and creates the `PENDING` `MediaFile` row, mirroring
  `UsersService.getUploadUrl`'s existing pattern. Without this, `submitKyc` could
  never have been reached by a real client, so the read-side signing fix below
  wasn't even testable until this existed.
- `KycService.signKyc`/`signMediaTriplet` (new, private helpers) intercept every
  response path that includes `frontImage`/`backImage`/`selfieImage`
  (`submitKyc`, `updateKyc`, `getMyKyc`, `getKycById`, `listKycApplications`,
  `approveKyc`, `rejectKyc`) and replace the stored `fileUrl` with a freshly-signed
  GET URL computed from `MediaFile.fileName` (which holds the S3 key). Fails safe
  (falls back to the — still-private — stored value) rather than crashing the
  response if signing itself errors.
- Chat attachments are keyed by stored URL rather than a `MediaFile` row, so
  `ChatService.signAttachments`/`signMessagesAttachments` (new) re-resolve
  `originalUrl`/`thumbnailUrl` via `s3Service.resolveUrlForDisplay` on `sendMessage`
  and `getMessages` — same private-by-default treatment as KYC, without needing a
  MediaFile migration.
- Found and fixed one more bug blocking the round-trip test: `kyc.repository.ts`'s
  `create()` mixed a raw `userId` scalar with nested `frontImage`/`selfieImage`
  `connect` relations, which forces Prisma's "checked" input type and rejects the
  scalar — Prisma threw `PrismaClientValidationError` on every real KYC submission.
  Changed to `user: { connect: { id: userId } }`. This was a pre-existing,
  independent bug that nothing had ever exercised before, since no client could
  reach `submitKyc` without the upload endpoint above existing first.

**Verified live, full round trip, real backend + MinIO, not simulated:**
register → login → `POST /kyc/upload-url` (FRONT, SELFIE) → real presigned PUT
upload (200) → `POST /kyc` submit (201, previously 500) → `GET /kyc/me` returns
`frontImage.fileUrl` containing `X-Amz-Signature` (i.e., freshly signed, not the
stored permanent URL) → fetching that signed URL directly returns 200 → fetching
the *same object's raw, unsigned key* directly (bypassing the signed URL) returns
**403 Access Denied** — confirms KYC documents stay private even with the new
bucket policy in place. Separately verified the public side: uploaded a
`PROFILE_IMAGE` and fetched its raw stored URL with zero credentials — **200 OK**,
confirming product/profile/cover images are now actually displayable in
production-equivalent conditions (fixing the original "likely undisplayable
everywhere" finding for every public category). `tsc --noEmit` clean; all 17
existing backend unit suites / 83 tests still pass.

**Deliberately not done in this pass** (scope boundary, not an oversight):
`MessageAttachment` isn't backed by a `MediaFile` row, so its signing is
best-effort key extraction from the stored URL rather than the cleaner
MediaFile-based approach used for KYC/profile/cover — fine functionally, but a
future refactor could unify attachment storage onto `MediaFile` for consistency.
Product listing image/video upload and confirm flows were not touched beyond
being covered by the new public bucket policy (they already worked once that
policy existed; no code change was needed there). This never touched
remote/staging infrastructure — the bucket policy is applied by `S3Service`
itself against whichever bucket it's configured against (local MinIO in dev),
consistent with the "keep it local" constraint.

### RESOLVED — Edit-listing flow (loopo-client) was non-functional; also created duplicates instead of updating
Originally: `SellFlowView.tsx` (rendered at `/listing/[listingId]/edit`) never
read `state.sell.formData` at all — it had its own fully independent local
`useState` for every field. The edit page's `useEffect` dispatched
`updateSellForm({...})` to prefill the form, but since `SellFlowView` never
consumed that state, editing any listing always showed a blank "create new"
form. Worse, and not previously documented: `SellFlowView`'s submit handler
unconditionally called `createProductThunk` — there was no update path at
all, so even a manually-refilled "edit" would have silently created a brand
new duplicate listing rather than changing the existing one. Separately, the
edit page only ever looked for the listing in already-loaded Redux state
(`products.find(p => p.id === listingId)`) — on a fresh page load / direct
link, `product` was `undefined` and nothing happened.

**Fixed, this session:**
- `SellFlowView` now takes `listingId`/`initialProduct` props; in edit mode it
  prefills all local state from `initialProduct` once loaded (including
  resolving `Product.category`'s display name back to a real categoryId via
  `useCategories()`), shows a loading/not-found state while the listing isn't
  available yet, and on submit dispatches the new `updateProductThunk` (→
  `PUT /products/:id`) instead of `createProductThunk` when editing.
- New `productsApi.updateProduct`/`updateProductThunk` and
  `productsApi.getProductById`-backed `fetchProductByIdThunk` (new thunks in
  `productsSlice.ts`).
- The edit page (`listing/[listingId]/edit/page.tsx`) now fetches the listing
  by id via `fetchProductByIdThunk` when it isn't already in the store,
  tracks a tri-state (loading/not-found/loaded) instead of assuming presence,
  and passes it down to `SellFlowView`. Removed the dead `updateSellForm`
  dispatch (that Redux slice belongs to the separate, working multi-page
  create flow at `/sell/*` — `SellFlowView` never read from it).
- Found and fixed two more bugs while verifying the round trip end to end:
  (1) `ProductDetailView.tsx` called `useRouter()` **after** a conditional
  early return, a Rules-of-Hooks violation that only manifested once a
  listing had to be fetched by id (the loading→loaded transition), throwing
  "Rendered more/fewer hooks than during previous render" and two hard
  request failures — this is exactly the page an edit save redirects to, so
  it had never been exercised this way before. Moved the hook above the
  early return. (2) `navigationSlice.ts`'s initial state hardcoded
  `selectedProductId: 'p1'` (a placeholder), so every fresh listing-detail
  page load fired one guaranteed-to-fail `GET /products/p1` (500, invalid
  UUID) before the real id dispatched a tick later. Changed the default to
  `null` (the field's own type was already `string | null`).

**Verified live, full round trip, not simulated:** created a real listing via
the API, opened `/listing/:id/edit` in a real browser session — title,
description, price, location, and category all correctly prefilled from the
existing listing (category correctly resolved from name back to UUID) —
changed the title, stepped through to Preview, clicked Save Changes, watched
the real `PUT /products/:id` return 200 with the new title persisted, got
redirected to the listing detail page, and confirmed the detail page renders
the updated title/price/description/category correctly with no console
errors or failed requests (screenshot on file). `tsc --noEmit` clean on both
this fix and the two adjacent bugs it surfaced.

**Not done in this pass** (pre-existing, out of scope for this fix): product
images still aren't sent by `createProduct`/`updateProduct` at all (a
separate gap — the create flow never wires up the presigned-upload pipeline
for listing photos — **now fixed, see the RESOLVED entry below**), and
there's a real hydration-mismatch warning on the listing detail page
(self-heals via Next's client re-render, not a crash; root cause not
investigated) plus cosmetic `<img src="">` console warnings when a listing
has zero images.

### RESOLVED — Listing photos were never actually uploaded anywhere; the upload endpoint itself was also broken for every caller
The sell flow (`sell/photos`) let a user pick photos, compressed/read them into
base64 data URLs in Redux, showed them in the UI right through to the preview
step - and then `productsApi.createProduct()` silently never sent `images` to
the backend at all. Nothing was ever uploaded; every real listing on this
platform had zero attached images.

While wiring the real fix, found the actual upload endpoint
(`POST /products/:id/images/upload-url`) was **also broken for every possible
caller**, independent of the client: `PresignedUrlRequestDto`/`AttachMediaDto`
in `product-media.controller.ts` had no `class-validator` decorators at all,
and the global `ValidationPipe` runs with `whitelist: true, forbidNonWhitelisted:
true` - a completely undecorated DTO class gets every property stripped
regardless of what's sent, so this endpoint 400'd
(`"property fileName should not exist"`) on every real request, forever. This
is the same bug class documented elsewhere in this file for category/search
params, just on a different endpoint no one had exercised yet.

**Fixed:**
- Added proper `@IsString()`/`@IsNotEmpty()`/`@IsOptional()` decorators to both
  DTOs so the upload-url and attach-image endpoints actually accept requests.
- `productsApi.uploadProductImage`/`uploadProductImages` (new): decodes a data
  URL back into a `Blob`, requests a presigned PUT, uploads directly to S3/MinIO
  (deliberately bypassing `apiClient` for this one call - it must not carry our
  Bearer token or a JSON content-type to a different origin), then registers
  the result via `POST /products/:id/images`. Sequential, not parallel (keeps
  a burst of <=10 uploads simple and isolates one bad photo from the rest).
- Wired into `sell/preview`'s publish handler: once `createProductThunk`
  returns a real listing id, every photo in `formData.images` is uploaded
  against it before navigating to the success screen. Best-effort - a failed
  photo shows a toast but doesn't block the listing itself from publishing.

**Verified live, full round trip, real backend + MinIO, not simulated:**
drove the actual multi-step sell flow in a browser (category → details → a
real file picked at the photos step → location → preview → publish), watched
the real `POST /products` (201), `POST /products/:id/images/upload-url`
(**201, was 400**), and `POST /products/:id/images` (201) network calls,
then confirmed via `GET /products/:id` that the listing's `images` array now
contains the real attached record, and fetched its `originalUrl` directly
with zero credentials - **200 OK** (public `listing_images` category, per the
storage-fix bucket policy above - this is the first real end-to-end proof
that a listing photo is actually visible after publishing). `tsc --noEmit`
clean on both apps; all 17 backend unit suites / 83 tests still pass.

**Not done in this pass:** the edit flow (`SellFlowView`) still doesn't let a
user add/remove photos on an existing listing - only the create flow
(`sell/preview`) was wired. Video uploads use the same endpoint (category
switches automatically by MIME type) but weren't separately exercised.

### RESOLVED — loopo-flutter: KYC screen was entirely fake UI hitting a nonexistent endpoint
`KycVerificationScreen`'s "Upload Front Photo"/"Take a Live Selfie" tiles never
opened a camera or file picker at all - tapping either just flipped a boolean
flag to show a green checkmark, with zero real image capture (`image_picker`
is a pubspec dependency and used correctly elsewhere in this app, e.g. the
sell flow's real photo step - just never wired in here). `KycService.verifyKyc`
then posted `{docType, docNumber}` (no photos at all, despite the params for
them existing but never being passed) to `POST /api/v1/kyc/verify`, which
**does not exist anywhere on the real backend** (the real routes are
`POST`/`PUT /kyc` and, as of this session, `POST /kyc/upload-url` - see the
storage-fix RESOLVED entry above, which is what made a real fix possible here
at all). This was a fully non-functional feature dressed up as a working one,
not a subtle bug.

**Fixed:** `KycService` rewritten against the real contract -
`uploadDocumentImage()` requests a presigned URL from `/kyc/upload-url`,
PUTs the file straight to S3/MinIO (bypassing the app's normal JSON request
helper on purpose - a different origin, no Bearer token, no JSON content-type),
and returns the resulting `mediaId`; `submitKyc()` then posts the real
`CreateKycDto` shape (`documentType`, `documentNumber`, `frontImageId`,
`selfieImageId`, `submit: true`) to `POST /kyc`. The screen now uses
`ImagePicker` for both the document photo (rear camera) and selfie (front
camera), shows the actual captured image as a preview, and the submit handler
awaits both real uploads before submitting. Display document type strings map
to the real `KycDocumentType` enum (`AADHAAR`/`PAN`/`PASSPORT`/
`DRIVING_LICENSE`/`NATIONAL_ID` - "Voter ID Card" has no dedicated backend
enum value, mapped to `NATIONAL_ID` as the closest fit).

**Verified:** `flutter analyze` clean (one pre-existing-style info note, same
class as the project's existing 4); `flutter build web` succeeds; the app
loads and reaches the login screen with zero console/page errors in a real
browser. The upload-url → PUT → submit contract itself was already proven
live end-to-end against the real backend earlier this session (see the
storage-fix entry's KYC round-trip) - this fix makes the Flutter client speak
that same, now-confirmed-working contract. **Not verified**: driving the
actual KYC screen through Playwright to a real 201 - Flutter web's
canvas-rendered UI requires blind pixel-coordinate taps with no accessible
DOM, and the specific tap sequence to reach this screen (behind a profile-tab
navigation not yet mapped out) wasn't worth the time given the contract
itself is already confirmed correct; same acceptance bar already used
earlier this session for the Flutter sell-flow publish.

### P2 — loopo-client has its own separate ~13-page admin panel, duplicating loopo-admin
`loopo-client/src/app/admin/` (categories, listings, reports, settings,
users, verifications — linked from `Header.tsx`/`AdminLayout.tsx`) is a
second, independent admin implementation alongside the real `loopo-admin`
app. Only `admin/categories/page.tsx` was touched this session (same
hardcoded-CATEGORIES fix as the rest of the client). Not clear whether this
is intentional (a lighter seller-facing moderation view?) or an abandoned
early admin implementation later superseded by `loopo-admin` — worth the
team clarifying, since if it's dead, it's carrying its own likely-stale/
hardcoded data throughout, and if it's live, it needs the same audit
`loopo-admin` already got.

### Local-only — loopo-client's `.env.local` points at production, not localhost
On this machine, `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (and
`.env.development`) is set to `https://loopo-api.zunotechsoftware.com`, so
running `next dev` normally talks to the live production API, not a local
backend — confirmed by intercepting the actual network requests a plain
`next dev` session made. None of these `.env*` files are tracked in git, so
this doesn't affect other developers, only whoever set up this machine.
Not changed (per not touching local config without being asked) — verification
of this session's client fixes was done by overriding
`NEXT_PUBLIC_API_BASE_URL` via a shell env var when starting `next dev`,
not by editing the file. Worth the user confirming whether pointing local
dev at prod is intentional — if not, `.env.local`/`.env.development` need
fixing, and if listing-creation was ever tested locally before this
session's fix, it may have written test data to the real production
database.

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

**Fixed the Dockerfile** to use `prisma migrate deploy` again (this session), and
**live-verified end to end**: built the actual image (`docker build`), ran it on
the same docker network as the local Postgres/Redis/MinIO with `NODE_ENV=production`,
and confirmed `migrate deploy` reports "No pending migrations to apply" and the
app starts cleanly (`Nest application successfully started`) — not just a code
read. That live run also surfaced a second, related bug (now also fixed — see the
payment-provider entry below): `StripeProvider`/`RazorpayProvider` used to `throw`
in their constructor when unconfigured, which crashed the *entire* app in
production, not just those two payment methods.

This Dockerfile fix alone will still crash-loop again on the next real deploy
unless the **real staging/production database** gets the same one-time baseline
treatment done locally (see decisions.md). This session deliberately did not
touch any remote/staging DB (explicit user instruction: "keep it local") —
someone with access to the actual Lightsail server / production `DATABASE_URL`
needs to run, **before or during** the next deploy with the updated image:

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

### RESOLVED — Payment providers crashed the whole app in production when unconfigured
`StripeProvider`/`RazorpayProvider` (see the P0 fixes earlier in RESOLVED, below)
originally `throw`'d in their constructor when unconfigured + `NODE_ENV=production`.
Found by live-running the built Docker image (see the Dockerfile entry above) — the
container failed to start with `STRIPE_SECRET_KEY is not configured` the instant
production mode was set with no Stripe key, which is the exact state this repo's
own `.env`/`.env.example` are already in for both Stripe and Razorpay. Since both
providers are eagerly constructed by Nest's DI regardless of whether a request
ever touches them, this took down the *entire* backend — auth, listings, chat,
search, everything — over one optional, unconfigured payment gateway.

Fixed: constructor now logs an ERROR instead of throwing; each of
create/verify/refund now explicitly fails closed (`{success:false}`) when
unconfigured in production, rather than crashing OR silently simulating success.
Also found and fixed, in the same pass: `verifyPayment`/`refundPayment` on both
providers additionally trusted a client-supplied ID's prefix
(`providerPaymentId.startsWith('pi_mock_')` / `providerOrderId.startsWith('order_mock_')`)
as sufficient alone to short-circuit into simulated success, **regardless of
whether the provider was actually configured** — since that ID comes straight
from the request body, this let anyone bypass real Stripe/Razorpay verification
just by sending a fake-prefixed id, even with real credentials set. Removed.

Live-reverified after the fix: rebuilt the image, re-ran the same container —
starts cleanly now with a visible ERROR log line instead of crashing.
independent of this repo's template file.

### P2 — 6 duplicate Swagger DTO class names, will break on next @nestjs/swagger major
Noticed in the live Docker boot log: `Duplicate DTO detected` warnings for
`GetUploadUrlDto`, `UpdateProductDto`, `RejectProductDto`, `FeatureProductDto`,
`BoostProductDto`, `CreateCouponDto` — each defined with different shapes in more
than one module. Currently just a warning (Swagger docs may show the wrong schema
for whichever one it picks), but Nest's own message says "this will throw an
error in the next major version" of `@nestjs/swagger`. Not fixed this session —
needs finding each pair and renaming one side, not a blind rename.

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

### PARTIALLY RESOLVED — Admin analytics page: Summary cards + Users tab now real, Revenue/Products/Moderation still demo data
Was: `analyticsService` called `/admin/analytics/summary`, `/users`, `/products`,
`/revenue`, `/moderation` — none of which matched any real backend route — while
the page component itself was 100% hardcoded arrays with no fetch call at all.

Fixed this session: added `GET /admin/analytics/summary` (live totals: user
count, approved-listing count, this-period revenue/avg-order-value from real
`Payment` rows, search log count, moderation approval rate from real
`Product.status` counts) and `GET /admin/analytics/users` (real per-day signups +
running total from `User.createdAt`) to the existing `AdminAnalyticsController`/
`AnalyticsQueryService`. Wired the Summary cards and the "Users" tab chart to
them, with loading/error states. Verified live in a browser against the actual
seeded DB: cards show 15 users / 4 listings / $0 revenue / 100% moderation,
matching `SELECT count(*)` exactly.

**Still open:** the Revenue, Products, and Moderation tabs are still the
original hardcoded demo arrays (now visibly labeled "Demo data — not yet
connected to live data" instead of silently looking real). `getProductMetrics`/
`getRevenueMetrics`/`getModerationMetrics` in `admin.service.ts` still call
routes that don't exist (`/admin/analytics/products`, `/revenue`, `/moderation`).
The closest real backend equivalent for revenue/payments is
`AdminAnalyticsController.getPaymentAnalytics` (`/admin/analytics/payments`),
which itself depends on the still-empty `DailyPaymentMetric` rollup table (see
the Dockerfile/migration entry above) — wiring those three tabs properly is a
separate follow-up, not a quick fix.

Also note: `getAdminSummary`/`getUserGrowth` compute live from raw tables
specifically to avoid depending on the empty rollup tables (see above) — if a
real scheduled aggregation job starts populating `DailyUserMetric`/etc. later,
these two methods should probably be revisited to use the cheaper pre-aggregated
data instead, at least for large date ranges.

### Not yet audited
Most of the ~30 backend modules haven't been read at all yet (this session's code
review was targeted: auth, payments, chat, products, the shared audit-log
interceptor). No cross-platform API-contract pass was done beyond what surfaced
incidentally (the analytics mismatch above). No frontend (client/admin/flutter)
runtime testing was done — only builds/analyze.

## RESOLVED (this session, 2026-09-13)

- **loopo-flutter, sell flow had the exact same 100%-broken category bug as web
  (P0)**: found by auditing flutter for the same bug class immediately after fixing
  it on web. Three independent hardcoded category sources (`step1_sell_home.dart`'s
  "Popular Categories" — including "Property"/"Services", which don't exist in the
  real taxonomy at all; `step2_category_selection.dart`'s subcategory picker; and
  `step8_review_listing.dart`'s hardcoded fallback categoryId, which was literally
  the Swagger example UUID from the backend's API docs). All now fetch the real
  category tree via `CategoryService` (already used correctly by
  `categories_screen.dart` — that screen was never actually broken, its "TODO:
  Backend Integration" comments were just stale). Verified live: built
  `flutter build web`, served it, drove it with Playwright against the real local
  backend — real categories render at both steps, a real photo upload succeeded.
  Did not get a full 201-confirmed publish through browser automation (canvas-based
  file upload timing was flaky in headless Chromium — unrelated to the fix itself);
  confidence rests on the live UI verification plus the code now matching the exact
  pattern already proven end-to-end on web.
- **loopo-client, sell flow completely broken (P0)**: creating a listing failed with
  404 "Category not found" for every category, every user, 100% of the time —
  `productsApi.ts` resolved a category name to id via a hardcoded map of UUIDs from
  an old seed run, guaranteed stale after any reseed. Fixed at the root: real
  categories fetched via a new `useCategories()` hook, `categoryId` threaded through
  `sellSlice` → `sell/category` → `sell/preview` → `productsApi.createProduct`.
  Verified end-to-end in a live browser (real login, full multi-step flow including
  actual file upload, real 201 response, real success screen) — not just code review.
  Same investigation also found and fixed: `getProducts()` sending `?category=name`
  and `?search=term` when the backend only accepts `categoryId` (UUID) and `keyword`
  (400 "property should not exist" on every category-filtered or keyword search);
  the category detail page relying on client-side name-matching against a `category`
  field that was always the literal string `"General"` for real products (see next
  item); and `categories`/`HomeView`/admin-categories all showing a hardcoded,
  always-zero item count. See known-issues.md OPEN section for what's still broken
  in this area (edit-listing flow, the duplicate client-side admin panel).
- **loopo-backend, listing list responses missing category/seller (P1)**: `findAll`
  (used by the public listings/search/category-browse endpoint) never joined
  `category` or `seller`, unlike the single-listing endpoint which already did —
  every list result's category client-side normalized to `"General"` and seller
  info was blank. Added both joins, matching the existing single-listing query.
- **loopo-backend, category item counts always zero**: `GET /categories` never
  computed a product count; added a real, APPROVED-only count per category.
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
