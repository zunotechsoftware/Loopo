---
last_verified: 2026-09-13
---

# Known Issues

## OPEN

### RESOLVED — P0: loopo-admin login had no role check at all - any registered customer/seller account could sign into the admin portal
User request: "check if the app behaves for admin, super admin and user logins correctly in all the apps." `(auth)/login/page.tsx` called the same `/auth/login` endpoint used by every client app and, on any successful login, unconditionally stored the token and navigated to `/dashboard` - it never looked at the returned `roles` array. `AuthGuard.tsx` only checked `isAuthenticated`, never role. Confirmed live: a real freshly-registered customer account (`roles: ["USER"]`) would have passed straight through both checks into the full admin UI shell (every guarded backend call would still 403, degrading gracefully per the earlier dashboard fix, but the navigation/layout/page structure were fully reachable).

**Fixed:** added `isAdminRole(roles)` (types/auth.ts) checked at login (rejects with "This account doesn't have access to the admin portal." before ever storing a token) and again in `AuthGuard` as defense-in-depth (forces logout if a live session's role is ever downgraded below ADMIN/SUPER_ADMIN). Also fixed `User.role: string` → `roles: string[]`, matching what the API actually returns (the old field was never populated by a real response). Verified live: a real registered customer's login response (`roles: ["USER"]`) correctly fails `isAdminRole`. `tsc --noEmit` clean, `next build` succeeds.

### RESOLVED — P0: loopo-client's own duplicate admin panel (`/admin`) had zero authentication - reachable by anyone, logged in or not
Found in the same audit pass. `routes/AdminRoute.tsx` (wrapping every page under `loopo-client/src/app/admin/*`) was a complete no-op: `return <>{children}</>;` with no auth or role check whatsoever. Compounded by two more bugs in the same area: `Header.tsx`'s `isAdmin` check (which shows/hides the Admin nav link) matched `user.role === 'ADMIN'` - a field that was always `undefined` since the real API returns `roles: string[]`, never a singular `role` (so the real link never showed for actual admins) - AND it separately matched `user.email?.includes('admin')`, meaning any unprivileged account that simply chose an email containing the substring "admin" (e.g. `myadmin123@gmail.com`) would see the Admin link, though the underlying panel itself was reachable by literal URL regardless of this UI check anyway.

**Fixed:** `AdminRoute` now requires a real authenticated session with an ADMIN/SUPER_ADMIN role (redirects home otherwise), mirroring `loopo-admin`'s own guard. Fixed `UserProfile.role` → `roles: string[]` (authSlice.ts's `buildProfile`, all fallback literals) and `Header.tsx`'s check to use the corrected field via a shared `isAdminRole()` helper, removing the email-substring/hardcoded-email heuristic entirely. `tsc --noEmit` clean, `next build` succeeds (all pages).

**Still open, not fixed this pass (separate, larger scope):** the pages inside this panel (`admin/users`, etc.) are still 100% hardcoded mock data with no real API calls - same class of gap `loopo-admin` already had fixed page-by-page. Now that the panel is at least properly gated behind real admin auth, wiring its pages to real data is a legitimate follow-up matching the existing P2 backlog note about this duplicate panel needing "the same audit loopo-admin already got."

### RESOLVED — P0: Flutter phone-login OTP was a hardcoded universal bypass code, not real verification
Found while auditing "user" login across all apps. `otp_screen.dart`'s verify step checked `_enteredOtp != '123456'` - a single, fixed code that worked for every phone number, every time, with the code openly announced in the UI itself (`login_mobile.dart`'s send-otp snackbar literally said "Verification code sent! Use code 123456 to verify."). No real OTP was ever generated or sent - `_handleSendOtp` just faked an 800ms delay. On "verification," the app called `AuthService.loginOrRegisterPhone`, which logged in (or silently auto-registered) the account at a **deterministic email+password derived purely from the phone number** (`$phone@loopo.com` / a hardcoded shared password `LoopoPhone@123`). Net effect: anyone who knew (or guessed) a target's phone number could log into or create their account with zero real verification - a genuine account-takeover vector, not a subtle bug, and self-advertised in the app's own UI.

The backend's existing `send-phone-otp`/`verify-phone-otp` endpoints could not be reused as-is: both require `@UseGuards(JwtAuthGuard)` - they let an *already-logged-in* user confirm their own phone number, a different feature from pre-authentication phone login. Checked the SMS delivery path while at it: `SmsProcessor` only logs the OTP (`this.logger.log(...)`) - no real SMS gateway (Twilio/MSG91/etc.) is integrated anywhere in this codebase, so an OTP still only appears in server logs, not an actual text message, until someone wires up a real provider (a separate infra/business decision, not something this pass could complete without real gateway credentials).

**Fixed:** added a genuine pre-auth phone-login pair reusing the same secure OTP pattern (`POST /auth/phone/send-otp`, `POST /auth/phone/verify-otp`, both `@Public()`): a real 6-digit code, bcrypt-hashed at rest, 10-minute expiry, one-time use (replay-blocked - verified live), auto-registers a phone-only account on first use else logs into the existing one, issues real session tokens on success. Rewrote the Flutter client (`auth_service.dart`, `otp_screen.dart`, `login_mobile.dart`) to call these for real - removed the hardcoded `123456` check, the deterministic email/password shortcut, and the fake network-delay simulation entirely.

**Verified live, full round trip, not simulated:** sent a real OTP for a fresh phone number, read the real generated code from the backend log (`[SMS SEND] OTP Code [358027]...`), confirmed the *old* universal code `123456` is now correctly rejected as invalid, confirmed the real code succeeds and returns real tokens with `roles: ["USER"]`, and confirmed the same code cannot be replayed a second time (400, "No active OTP found"). Backend: `tsc --noEmit` clean, 83/83 tests pass. Flutter: `flutter analyze` clean (pre-existing info-level notes only), `flutter build web` succeeds.

**Not done, real infra/business decision, out of scope for a code fix:** actual SMS delivery still requires wiring `SmsProcessor` to a real gateway (Twilio, MSG91, etc.) with real account credentials - until then, the OTP is genuinely secure (real, hashed, expiring, one-time) but only visible in backend logs, not delivered to the user's phone. This matches the existing pattern elsewhere in the app (Stripe/Razorpay providers fail closed when unconfigured rather than faking success) - flagging clearly here rather than pretending SMS delivery already works.

### RESOLVED — P0: any ADMIN could self-promote to SUPER_ADMIN (and grant it to anyone else)
Found while auditing role-assignment endpoints for the same login/role audit. `SUPER_ADMIN` bypasses every permission check in the app outright (`PermissionsGuard`: `if (user.roles.includes('SUPER_ADMIN')) return true;`), so granting it is not an ordinary role edit - it's handing out unrestricted root access. None of the three endpoints that can set a user's roles (`POST /admin/users` create, `PATCH /admin/users/:id` update-details, `PATCH /admin/users/:id/roles`) ever checked what role was being requested against who was requesting it - only the ordinary `users.create`/`users.update`/`roles.update` permissions gated them, all three of which a plain seeded `ADMIN` role already holds.

**Confirmed live, not just by reading code:** created a real `ADMIN`-role test account, logged in as it, and successfully called `PATCH /admin/users/:id/roles` on its own account with `{"roles": ["SUPER_ADMIN"]}` - the request succeeded (200) and the account became a real Super Admin. The generic `PATCH /admin/users/:id` (with `roles` in the body, gated only by `users.update`) allowed the identical escalation via a second path.

**Fixed:** added `AdminUsersService.assertCanAssignRoles(requestedRoles, callerRoles)` - throws 403 if `SUPER_ADMIN` is requested by a caller who isn't already a real Super Admin - and wired it into all three entry points (`createUser`, `updateUserDetails`, `updateUserRoles`), threading the caller's real roles through from the JWT (`@CurrentUser('roles')`) rather than trusting anything client-supplied. Deliberately scoped to the `SUPER_ADMIN` name specifically (the one role that bypasses permission checks entirely) rather than also restricting `ADMIN` self-assignment, which is already an intentionally broad, permission-scoped operator tier throughout this codebase.

**Verified live after the fix:** the identical self-promotion request via both endpoints now returns 403 ("Only a Super Admin can grant the Super Admin role."), while a real Super Admin performing the exact same grant still succeeds (200). Backend: `tsc --noEmit` clean, 83/83 unit tests pass.

### RESOLVED — loopo-admin: KYC document images 404'd for some applications (broken by an earlier session fix, not a new bug)
User-reported: "images are not showing" on the KYC detail page. Root cause
was in `KycService.signMediaTriplet` (backend): every KYC image response
gets a fresh presigned S3/MinIO GET URL generated from `MediaFile.fileName`,
treated unconditionally as a real S3 object key. This is correct for every
real upload (`getUploadUrl` always produces a key shaped
`<category>/<userId>/<uuid>.<ext>`), but two pre-existing seed/demo
`KycDocument` rows ("Venkatesh Sekar", `prisma/seed.ts`) predate that signing
logic entirely - their `MediaFile.fileName` is a bare local filename
(`aadhaar_front.jpg`, `pan_front.jpg`, ...) whose matching `fileUrl`
(`/images/aadhaar_front.jpg`) was always meant to be served directly by
`loopo-admin`'s own `public/images/` folder, never uploaded to S3 at all.
Signing blindly overwrote that working relative URL with a syntactically
valid but meaningless presigned URL for an object that doesn't exist in the
bucket - confirmed via direct fetch: 404. The old `try/catch` around the
signing call never caught this, because `getSignedUrl()` only computes a
signature locally and never checks the object exists, so it can't throw for
a bad key.

**Fixed:** `sign()` now skips signing (leaves the stored `fileUrl` untouched)
whenever `MediaFile.fileName` doesn't contain a `/` - a reliable signal since
every real key this app's own upload pipeline ever generates always has the
category as a `/`-separated prefix; a bare filename was never a real S3 key
to begin with. Verified live: both broken seed KYC records (`documentType`
AADHAAR and PAN for Venkatesh Sekar) now return their real
`/images/...jpg` relative URL again (confirmed the admin dev server serves
it, 200), while a real S3-backed submission's front/selfie images still get
correctly signed (confirmed presigned URL with a valid signature, unchanged
behavior). Backend: `tsc --noEmit` clean, 83/83 unit tests pass; rebuilt and
restarted the compiled backend process to pick up the fix (it runs
`node dist/src/main`, not `--watch`).

### RESOLVED — loopo-admin: dashboard showed "Is the backend reachable?" for any non-super-admin missing even one permission
User-reported: "When a non-super admin logged into admin panel I am getting
'Could not load dashboard data. Is the backend reachable?'". The backend was
never actually down - `dashboard/page.tsx` fires 7 parallel calls
(`Promise.all`) to separately-permissioned admin endpoints (analytics
summary/users need role ADMIN/SUPER_ADMIN; products stats need
`admin.products.manage`; sellers need `users.view`; categories/complaints/kyc
have their own gates). Any real admin role that has *some* but not *all* of
these - which is the entire point of the Roles & Permissions feature - got
exactly one 403 among the seven, `Promise.all` rejected the whole batch, and
the page showed a generic "is the backend reachable?" message that had
nothing to do with the real cause.

Reproduced live, not just by reading code: created a real custom role via
`POST /admin/roles` with only `kyc.review` granted, assigned it to a real
test user via `PATCH /admin/users/:id/roles`, logged in as that user, and
confirmed 6 of the 7 dashboard sub-endpoints returned real 403s (only
`admin/complaints/stats`, which has no permission gate, returned 200).

**Fixed:** switched to `Promise.allSettled` so one denied section no longer
blocks the rest - the page now renders every widget it has data for. Denied
(403) vs. other failures are counted separately; a partial-denial banner
("N dashboard sections are hidden because your role lacks permission to view
them") replaces the misleading connectivity message, and the full-page error
only fires when literally everything failed (with an honest
permission-vs-connectivity distinction there too). Verified against the live
repro above; `tsc --noEmit` clean, `next build` succeeds (30/30 pages). Test
role/user cleaned up afterward.

### RESOLVED — P0, user-reported: "Publish Listing Now" silently failed for a real user - description was under the backend's minimum length, with no client-side warning until the very last step
User's own live test: typed a title ("aksjka") and a short description
("sjajsjah", 8 characters), clicked through to Preview, clicked "Publish
Listing Now", and the listing never appeared anywhere - not in their own
My Listings, not in admin. Confirmed via a direct database query: no such
product was ever created.

Root cause: the backend's `CreateProductDto.description` requires
`@MinLength(10)` (and is `@IsNotEmpty()`), but `sell/details/page.tsx`'s
`handleSubmit` only validated `title`/`price`, never `description` length
- and the label read "Description" with no `*`, implying (incorrectly)
that it was optional. A user could sail through all 5 steps and only
discover the problem at the very last one, as a raw backend validation
message in a toast that's easy to miss entirely (which is exactly what
happened here).

**Fixed:** `handleSubmit` now validates title (3-100 chars) and
description (10-2000 chars) client-side, matching the backend exactly;
marked the label required (`Description *`); added a live character
counter that turns red below the 10-character minimum. A user now gets a
clear, immediate, un-missable block at the step where the problem
actually is, instead of a silent failure three steps later.

**Verified live:** re-ran the user's exact input ("aksjka" / "sjajsjah")
- clicking Next now correctly stays on the Details step with the counter
showing "8/10" in red; fixing the description correctly proceeds. The
underlying create → admin-pending → approve → public-visible pipeline
itself was already confirmed fully working in a separate full wizard
walkthrough (see the city/state/negotiable fix entry above) - this was
purely a missing-validation gap that made a bad input look like a broken
integration.

### RESOLVED — Admin KYC review page fabricated a person's date of birth, gender, and home address, and ran a fake "auto-verification" that always passed every check
Found while re-verifying the KYC flow end to end (user request: "check
... kyc"). Two related, serious issues on `kyc/[id]/page.tsx`, both
pre-existing (not introduced this session):

1. **Fabricated identity fields.** The "Identity Information" panel fell
   back to a specific, detailed fake person whenever a field was missing
   from the real profile (which is always, currently - nothing in this
   app collects date of birth, gender, or a home address yet):
   `dateOfBirth` → hardcoded `"15 Aug 1995"`, `gender` → hardcoded
   `"Male"`, `address` → hardcoded `"1/23, South Street, Hosur,
   Krishnagiri, Tamil Nadu - 635109"` (with an extra special case
   appending that exact street address whenever a real profile's city
   happened to be "Hosur"). An admin reviewing a real person's real
   Aadhaar/PAN submission was shown someone else's fabricated personal
   details right next to it, with no visual distinction from real data.
2. **Fake automated verification.** For any PENDING/SUBMITTED
   application, the page ran a ~3-second timer that animated through
   "Scanning uploaded documents and running facial matching checks..."
   and always ended with every check (name match, DOB match, document
   readable, selfie match, duplicate KYC) marked green "Matched" /
   "Passed" - regardless of the actual document contents. There is no
   real document-verification integration anywhere in this codebase; this
   was pure animation. An admin could reasonably (and wrongly) treat a
   wall of green checkmarks as a real signal.

**Fixed:** the three identity fields now show `"Not provided"` when the
real profile field is genuinely empty, instead of a fabricated value.
Removed the trigger that started the fake auto-scan timer for
PENDING/SUBMITTED applications - `scannedItems` now stays at its real
`'pending'` default, and the existing (already-built, just previously
pre-empted by the fake timer) `toggleChecklistItem` mechanism is the only
way any check becomes "Matched"/"Passed" now: an admin manually marking
it after actually looking at the documents shown right next to it. This
is the only real verification available without integrating a document-
verification vendor.

**Verified live end to end, not simulated:** a real client submission
(real document number, real front/selfie image upload) reviewed on the
real admin KYC detail page shows "Not provided" for DOB/gender/address
(previously always a fabricated Aug-1995/Male/Hosur record) and every
verification check honestly at "Pending" (previously all green after
~3s, every time) - confirmed via screenshot after waiting well past where
the old fake timer would have completed. The full submit → admin-approve
(via the real Approve button + confirmation dialog, not the API directly)
→ client-reflects-APPROVED chain still works correctly (verified
separately, two real browser sessions, zero console errors on either
side).

**Update - the "flagged for a future pass" items above turned out to be
far more serious than cosmetic, and are now fully fixed too.** Revisiting
this file for cleanup found the document-preview panel itself was still
actively fabricating evidence: it special-cased any real applicant whose
first name plainly matched "Kumar" or "Venkatesh" (a string compare, not
an id check) and substituted a fully fake CSS-rendered passport mockup
(invented parents' names, a fake address, a fake passport number) and a
swapped-in stock selfie/PAN-card image in place of their real uploaded
documents - while the rest of the page still looked like it was showing
that real person's real submission. Every other applicant's missing
front/back/selfie image silently fell back to the same static demo
Aadhaar/selfie files instead of an honest "no image uploaded" state, and
a failed download on the fake-passport path generated a text file with a
hardcoded fake DOB/passport number. Approved/rejected applications also
always displayed a synthesized all-"passed" (or a fixed pass/fail
pattern) per-check verification breakdown that no real check had ever
produced. **Fixed:** removed all name-based branching and every
fake/mock document, avatar, and text fallback (document previews now
show only the real uploaded image or an honest "No image uploaded"
placeholder); the Verification History timeline is now built entirely
from the record's real `submittedAt`/`approvedAt`/`rejectedAt` fields
(which already existed and were simply never used); the per-check
checklist stays honestly 'pending' unless an admin manually marks it via
the pre-existing `toggleChecklistItem`. Also deleted the now-fully-dead
`MOCK_KYC_DETAILS`/`MOCK_PAN_DOC`/`PassportFrontPreview`/
`PassportBackPreview` code and the unreachable auto-verification scan
timer/banner that backed all of this. Verified: `tsc --noEmit` clean,
`next build` succeeds (30/30 pages); cross-checked the real shape of
`GET /admin/kyc/:id` against a live submitted application (real name,
real signed image URLs, real timestamps) to confirm the new logic
matches what the backend actually returns.

### RESOLVED — Sell wizard: every listing's city/state were silently swapped/wrong, and the negotiable checkbox never reached the backend
Found while re-verifying the full sell flow end to end (user request: "check
seller flow works properly"). Two real bugs, confirmed live:

1. **`negotiable` was never sent at all.** `sell/preview/page.tsx` built the
   `createProductThunk` payload without a `negotiable` field, even though
   the Details step's "Price is Negotiable" checkbox (bound to real state,
   defaulting to `true`) implied it would be. `CreateProductPayload`/
   `productsApi.createProduct` didn't have the field either, despite the
   backend already fully supporting it. Every listing silently published as
   non-negotiable regardless of what the seller chose.
2. **City/state were being swapped for every listing published through the
   wizard.** The wizard has real, separate `city`/`area`/`pincode` fields
   from its Location step, but `preview/page.tsx` collapsed them into a
   single opaque string `"${area}, ${city}"` (e.g. "Indiranagar,
   Bangalore") and `productsApi.ts`'s `parseLocationString` assumed a
   *different* convention (`"City, State"`) when splitting it back apart -
   so `city` ended up storing the area ("Indiranagar") and `state` ended up
   storing the city name ("Bangalore"); the listing's real state
   (Karnataka) was never captured anywhere. Confirmed via a captured
   network request body. This would have broken any real city/state-based
   search or filtering, and shown wrong location data to buyers.

**Fixed:** added a `negotiable` field to `CreateProductPayload`, threaded
through to the DTO. Added a `locationDetails` structured field to
`CreateProductPayload` (`{city, area, state?, zipCode?}`) that
`productsApi.createProduct` uses directly when a caller already has the
real fields separately - no more encode-then-guess-how-to-decode. The sell
wizard's preview page now passes this instead of concatenating a string.
Also rewrote `parseLocationString` (still used by `SellFlowView.tsx`'s
free-text edit-listing field, which has no separate fields and must parse
a string) to correctly handle 1/2/3-comma-separated-part input by actual
part count, plus a `CITY_STATE_MAP` (matching the location step's fixed
city dropdown) to fill in a real state whenever only a city is known,
instead of hardcoding `'Karnataka'`/`'Bangalore'` regardless of what the
seller actually picked.

**Verified live, full wizard walkthrough (category → details → photos →
location → preview → publish), not simulated:** real photo upload and
registration (`imageCount: 1` on the created listing), `negotiable: true`
correctly persisted without touching the checkbox (its real default),
switching the Location step's city to Mumbai correctly produced
`{city: "Mumbai", state: "Maharashtra"}` on the real created record (was
previously always wrong regardless of city chosen) - confirmed both via
direct API read and visually in the real admin Pending Approval list,
zero console errors. Client: `tsc --noEmit` clean, `next build` succeeds.

### RESOLVED — P0: real-time chat never worked at all, in either app - Socket.IO was never actually attached to the real HTTP server
User-reported: "when a user sends a message, the message is saved but
does not appear immediately. It only appears after refreshing the page."

The true root cause was infrastructural, not a frontend bug:
**`RedisIoAdapter` (`shared/redis/redis-io.adapter.ts`) called `super()`
with no arguments**, so `AbstractWsAdapter` never got the Nest application
reference it needs to find the app's real, already-listening HTTP server.
`IoAdapter.createIOServer` falls back to `new Server(port, options)` - a
brand-new, fully disconnected Socket.IO instance, never routed to by the
actual server answering every REST request on port 5000. Confirmed with a
raw `curl` handshake: `GET /socket.io/?EIO=4&transport=polling` returned a
plain Express **404** (with Helmet's security headers on it, proving it
came from Nest's own router, not a network-level failure) - nothing was
ever listening on that path at all, on any port a browser could reach.
**Every** socket.io connection attempt from any client, in either app, has
always silently failed - this predates this session entirely.

**Fixed:** pass the Nest `app` through: `new RedisIoAdapter(app,
configService)` in `main.ts`, `constructor(app: INestApplicationContext,
...) { super(app); }` in the adapter. Verified: the same curl handshake
now returns `200 OK`.

**Compounding, now-moot-but-still-fixed frontend bugs found on top of this:**
- `loopo-admin`'s `useChatSocket.ts` read the token from `localStorage
  'token'`, a key nothing in the app ever sets (`AuthProvider.tsx` uses
  `'accessToken'`) - the socket's auth handshake never even had a token to
  send, so it would have failed regardless of the backend bug.
- `loopo-client` had **no Socket.IO integration at all** (not even the
  package installed) - real-time delivery there was never attempted, and
  separately, `sendMessage` was a **local-only synchronous Redux reducer
  that never called the send-message API at all** (a message "sent" from
  the client only ever existed in that tab's memory; a refresh made it
  vanish rather than reappear). `chatApi.ts`'s methods also didn't match
  the real backend contract (`{conversationId, text}` instead of
  `{conversationId, content, type}`; no `getMessages` method existed at
  all, so a conversation's full history was never loadable - only ever the
  single latest-message preview the conversation-list endpoint returns).

**Rebuilt for real:** added `socket.io-client` + a `useChatSocket` hook to
loopo-client (mirrors the admin one); fixed `chatApi.sendMessage`/added
`chatApi.getMessages`; rewrote `chatSlice.ts` with `fetchMessagesThunk`
(full history, loaded once per conversation), `sendMessageThunk` +
`addOptimisticMessage` (append immediately, reconcile with the real
response, drop the optimistic copy without duplicating if the socket echo
already arrived first), `receiveMessage`/`applyConversationUpdate`
(live-update from the socket, with unread-count bumped only for
conversations not currently open); fixed message `sender` derivation to
compare the message's real `senderId` against the current user's id
(previously compared against a `m.sender` string field the backend never
sends - every message silently rendered as "sent by me" regardless of who
sent it). Also had the backend controller additionally broadcast
`conversation_updated` to the recipient's personal `user:${id}` room (every
client already joins this on connect) so a brand-new conversation, or one
the recipient currently has closed, still live-updates their inbox instead
of only conversations they've actively opened before.

**Verified live, two real separate browser sessions (seller + buyer), not
simulated:** a message sent by one appears on the other's screen with zero
page reload; confirmed no duplicate rendering of the sender's own message
(optimistic-vs-socket-echo reconciliation works); replies flow back the
same way. Backend: 83/83 unit tests pass, `tsc --noEmit` clean. Both apps:
`tsc --noEmit` clean, builds succeed.

### RESOLVED — Block / Unblock / Report were unreachable from inside the messaging UI itself
`MessagesView.tsx` had a "Report" button but no way to block a user at all
from within a chat - `blocked-users/page.tsx` and the seller-profile page
already had real block/unblock (fixed earlier this session), but nothing
inside the actual chat screen. Added a Block/Unblock button to the chat
header with a real confirmation dialog (loading spinner, real
success/error toast), a red banner when the open conversation's other
party is blocked, and disabled message input/attach/send while blocked
(the backend already 403s a blocked send; this adds the same rule
client-side for immediate feedback). A failed send now shows inline with a
tap-to-retry action instead of silently vanishing.

**Verified live:** blocking via the chat header persists for real (`GET
/users/blocked` reflects it immediately), the input visibly disables with
"Unblock to send a message...", and unblocking via the dedicated
`/blocked-users` page correctly clears it. Reports already flow into the
real admin `/reports` workflow (fixed earlier this session) - the chat's
Report button reuses the same real modal, now scoped to `targetType:
'USER'` with the real `otherPartyId`.

### RESOLVED — Admin KYC review page: a failed approve/reject silently pretended to succeed, and a failed fetch loaded fabricated data for a different (mock) applicant
Found while verifying KYC admin→client sync. `kyc/[id]/page.tsx` had two
dangerous fallback-on-error blocks, both pre-existing (not introduced this
session):
- `handleApproveConfirm`/`handleRejectConfirm`'s `catch` blocks showed a
  fake **"...successfully (Local Simulation)"** toast and flipped the
  local `kyc.status` to APPROVED/REJECTED **even though the real API call
  had just failed** - the actual database record was never touched, but
  the admin had no way to tell their action hadn't worked.
- `fetchKycDetail`'s `catch` block (and even a branch of its success path,
  if `resData` was falsy) substituted a hardcoded `MOCK_KYC_DETAILS` record
  for a **different, fictional applicant** ("Venkatesh") - an admin could
  end up reviewing and then "approving" fabricated content while believing
  it belonged to the real application they'd opened, since the approve
  button would then fire against that fake `id`.

**Fixed:** both catch blocks now show a real error toast and change
nothing locally; approve/reject now re-fetch the real record via
`fetchKycDetail()` on success instead of hand-editing local state, so
what's displayed always matches the database. The fetch failure path (and
the missing-`resData` branch) now sets `kyc: null` with a real error
message, and a proper "not found / couldn't load, Retry" screen was added
(previously nothing guarded `!kyc` outside the initial loading spinner, so
this path would have thrown reaching into a null `kyc` deeper in the
render). Left as dead code rather than risk touching more of this ~1500-
line file under time pressure: the now-fully-unused `MOCK_KYC_DETAILS`
constant, and a still-present but no-longer-reachable-via-fallback
"auto-verification simulator" (`scannedItems`/`autoState`) that, when a
*real* record loads via the normal success path, still runs a purely
decorative ~2.7s timer that always ends in every check "passed" - it
doesn't inspect the actual document images at all and isn't wired to
anything the admin's approve/reject decision depends on. Flagging clearly
here rather than leaving it looking like real automated verification: **it
is not**, and should either be removed or connected to a real
document-verification vendor in a future pass.

**Verified live end to end:** client submits KYC (SUBMITTED) → admin
approves via the real `PATCH /admin/kyc/:id/approve` → client's next
`GET /kyc/me` immediately reflects APPROVED. Admin KYC list page renders
real applications with real stats (5 total, 4 pending, 1 approved, 1
rejected in the verification run) with zero console errors.

### RESOLVED — Rejected listings never showed the seller *why* - the data existed, nothing displayed it
Part of verifying the selling-lifecycle sync ("Admin rejects → seller sees
rejection/reason"). The real `rejectionReason` field was already being set
by the backend on rejection and was already present in every
`GET /products/my` response (the repository uses `include`, which returns
all scalar fields) - `myAdsSlice.ts`'s `normaliseDbItem` just never copied
it onto the frontend `MyAdItem`, and `my-listings/rejected/page.tsx` never
rendered it. Added `rejectionReason` to the `MyAdItem` type, the
normalizer, and the rejected-listings page (shown as a real reason chip
under each rejected listing). The admin-side reject dialog already
correctly required and sent a real reason - only the client display side
was missing.

### Verified, no change needed — sold-product and moderation-status sync
Checked as part of the same sync pass: the public listings endpoint only
ever returns `APPROVED` products (a `SOLD` item is never publicly
browsable once marked sold - by construction, not a special case), the
admin listings page already has a real "Sold" filter and a real
`productsService.getStats()`-driven sold count, and the client's Mark Sold
flow (fixed earlier this session) persists a real status change all three
surfaces read from the same table. No gap found here.

### RESOLVED — loopo-admin (user-reported priority #3): Notifications and Email Templates were largely fake/incomplete
1. **Notifications**: the main list/create/edit/stats flow was already real (`admin.service.ts`'s `notificationsService` correctly hitting `/admin/notifications`), but:
   - The Create/Edit dialog had no way to set the real `type` field (Promotion/Order Update/Engagement/Security/Cart Reminder/Update/Onboarding) - every notification silently defaulted to PROMOTION. Added a real Type selector.
   - `NotificationTable.tsx` read `row.delivery`, but the real model field is `deliveryRate` - every row's Delivery column was blank. Fixed the field name and formatted it as a percentage.
   - `NotificationSidebar.tsx` was **100% hardcoded fake**: a "last 7 days" performance chart with the same made-up numbers for every account, a "Notification Types" pie chart with fabricated counts, a "Top Performing Notifications" list citing notifications that were never actually sent ("Flash Sale is Live! ⚡" at a fictional 62.45% open rate), and 3 of its 4 "Quick Actions" had no `onClick` at all. Added a new `GET /admin/notifications/analytics` endpoint (real per-type counts, a real 7-day sent/delivered/opened trend - no fabricated "clicked" line, since there's no real per-notification click tracking) and rewrote the sidebar against it; replaced "Top Performing" with a real "Recent Notifications" list; kept only the one real Quick Action (wired "Send New Notification" to actually open the compose dialog).
2. **Email Templates**: `EmailTemplate` had **no field to store the actual email content** - `name`/`subject`/`category`/`language`/`status` only, so a "template" could never actually contain an email body anywhere in the system. Added a real `body String @default("") @db.Text` column via `prisma db push` (a plain additive column with a default - not a destructive change; `prisma migrate dev` was tried first but aborted itself asking to reset the whole dev DB due to pre-existing schema/migration drift unrelated to this change, so `db push` was used instead, exactly matching how this dev DB was already being managed. No data was lost - verified via a live query straight after.) Added `body` to `CreateEmailTemplateDto`, and to `EmailTemplateDialog.tsx` as a real "Email Body (HTML)" field. `EmailTemplateSidebar.tsx`'s "Preview" tab used to render one hardcoded fake "Welcome to Loopo!" mockup for every single template regardless of its actual name/subject - now renders the real subject + body. Also made `emailTemplatesService.getStats()`'s `usedThisMonth` a real `SUM(used)` aggregate instead of a hardcoded `4892`.

**Still fake, left as an honestly-labeled limitation (not silently hidden, but not built out this pass given scope):** `NotificationsService.getStats()`'s `clicked` count (`35% of opened`, pre-existing, commented as intentional) and `EmailTemplateSidebar.tsx`'s "Template Performance (Last 30 Days)" block (sent/opened/clicked/bounced) - neither notifications nor email templates have a real per-recipient send/open/click event log in the schema, only aggregate/per-row fields. Building that out is a real feature (a `NotificationDelivery`/`EmailSend` fact table plus instrumentation on the client apps), not a wiring fix - flagged here rather than fabricated further.

Backend: `tsc --noEmit` clean, 83/83 tests pass. Frontend: `tsc --noEmit` clean, `next build` succeeds.

### RESOLVED — loopo-admin (user-reported priorities #1 & #2): fake admin-identity blocks in page headers; Settings page was 100% mock data; custom roles were unassignable to users
Three separate findings, all under "not properly aligned with our system":

1. **Fake admin-identity block, duplicated in two page headers.** `ads/components/PageHeader.tsx` and `coupons/components/PageHeader.tsx` each hardcoded a "Admin User / Super Admin" block with a random `pravatar.cc` avatar - not tied to the real logged-in admin at all, and redundant with the real one already in the sidebar (`layouts/Sidebar.tsx`, which correctly reads `user.email`). Removed both blocks per user request ("that section need to remove").

2. **`settings/page.tsx` was entirely `MOCK_AUDIT_LOGS`/`MOCK_BANNERS`/`FEATURE_FLAGS`/`GENERAL_SETTINGS` hardcoded arrays**, with `handleSaveSettings` literally commented `// Call settingsService.update() ... in production` and never calling it - despite the real backend (`AdminSettingsModule`, `AdminFeatureFlagsModule`, both already registered in `admin.module.ts`) and a matching real `admin.service.ts` client (`settingsService`) already existing and working, just never wired to this page. The "Banners" tab was a pure duplicate of the already-real, already-linked-in-the-sidebar `/banners` page. Audit Logs had no backend endpoint at all - `audit-logs` module (`AuditLogsService.getLogs()`) existed and was already being written to by the global `@LogAudit` interceptor on `POST`/`PUT`/`PATCH` routes, but nothing ever exposed it over HTTP, even though `admin.service.ts` already had an `auditLogsService` expecting `GET /admin/audit-logs`.
   **Fixed:** rewrote the page against real data - General (real `GET/PUT /admin/settings`), Feature Flags (real `GET/PUT /admin/feature-flags`, toggles apply immediately), Audit Logs (new `GET /admin/audit-logs` + `/export` CSV, paginated). Removed the duplicate Banners tab. Seeded 6 real `SystemSetting` rows and 6 real `FeatureFlag` rows (reusing the mock data's realistic values as actual seed data, not fake frontend state) since both tables were completely empty - added `admin.audit-logs.view` to the seeded permission list.
   **Verified live:** General/Feature Flags tabs show and persist real values; Audit Logs shows 31 real historical entries spanning this whole session's actual actions (CREATE_PRODUCT, APPROVE_PRODUCT, MARK_SOLD_PRODUCT, ADD_FAVORITE, etc.) with real admin names/timestamps/IPs - not mock rows. Cleaned up 2 stray test rows (`test_setting`, `test_flag`) left over from this session's own earlier backend verification.

3. **A custom role created in Roles & Permissions could never actually be assigned to a user.** `users/UserDialog.tsx`'s role dropdown was hardcoded to exactly `USER`/`ADMIN`/`SUPER_ADMIN` - a role like the pre-existing "CUSTOMER" role, or any new one created via the (real, working) Roles & Permissions page, was invisible here even though the backend's `PATCH /admin/users/:id/roles` already accepts any real role name.
   **Fixed:** the dropdown now fetches the real role list (`rolesService.getAll()`) and renders every role that actually exists.
   **Verified live:** editing a user now shows SUPER ADMIN / ADMIN / USER / CUSTOMER (the real list) in the dropdown.

Backend: `tsc --noEmit` clean, 83/83 unit tests pass. Frontend: `tsc --noEmit` clean, `next build` succeeds (all pages).

### RESOLVED — P0 (user-reported): loopo-admin chat showed "Unknown User" and mis-flagged message senders after starting/sending a new conversation
User-reported priority: "when I choose a user and message it is sending
but it is showing as unknown user."

Root cause was entirely in the shared backend chat module, not the admin
frontend: `chat.service.ts`'s `getConversations()`/`getConversationDetails()`
populate each participant row's `.user` field from the conversation's
`buyer`/`seller` relations (Prisma never nests a `.user` object onto
`ConversationParticipant` by default), and sort participants so the
current caller is always index 0. **`createConversation()` never did
either of those two things** - it returned the raw Prisma
`participants: true` rows (bare `{userId, conversationId, ...}`, no name/
email/avatar at all) straight from the repository, for both the
newly-created-conversation path and the find-existing-duplicate path.

`loopo-admin`'s `ChatArea.tsx`/`ConversationsSidebar.tsx` both do
`conv.participants[1].user` to get "the other party" (correct **only**
if participants are sorted and populated the way `getConversations`
does it) - so the conversation object handed back immediately after
`POST /chat/conversations` (used to render the just-selected chat and to
optimistically show the just-sent message) had `participants[1].user ===
undefined`, and the `|| 'Unknown User'` fallback fired. The same
`recipient.id` being `undefined` also broke `isSentByMe = msg.senderId
!== recipient.id` - since `undefined` never equals a real sender id, every
message (including ones from the other user) evaluated as "sent by me".
This affected `loopo-client`'s real buyer/seller chat too in principle
(same endpoint), but happened not to surface there because that flow
always does a full `GET /chat/conversations` refetch before rendering
(see the buyer/seller mislabel fix earlier this session) rather than
trusting the raw creation response directly.

**Fixed:** extracted a `mapConversationParticipants(conv, currentUserId)`
private helper in `chat.service.ts` (identical logic was already
duplicated verbatim between `getConversations`/`getConversationDetails` -
now a single source of truth) and applied it to **both** branches of
`createConversation()` (the existing-conversation-found early return, and
the newly-created-conversation return). Also added the missing
`buyer`/`seller` `include`s to `chat.repository.ts`'s `findConversation`
and `createConversation` (they only selected `participants: true` before,
so the service had nothing to map from even if it tried).

**Verified live end to end:** admin creates a conversation with a
brand-new user via the real `POST /chat/conversations` - confirmed via
direct API call that `participants[0]` is the admin and `participants[1]`
is the real target user, both with real `firstName`/`lastName`; browser
test clicking a fresh, never-before-messaged user in the admin panel's
"Users" tab and sending a message showed the correct name in the chat
header throughout (never "Unknown User"), and the sent message rendered
correctly right-aligned/blue as sent-by-me. Backend: 83/83 unit tests
pass, `tsc --noEmit` clean.

### RESOLVED — loopo-client: Favourites never persisted server-side; a fully-fake standalone /report page existed alongside the real ReportModal
Same silent-revert bug class as the earlier My Listings Mark Sold/Delete
fix: `toggleFavorite` was a plain synchronous Redux reducer that never
called the real, already-existing `GET/POST/DELETE /favorites` backend -
toggling a heart looked instant but was pure in-memory state, gone on the
next real fetch or page reload, and never synced across devices/sessions.

**Fixed:** added `interactionsApi.getFavorites/addFavorite/removeFavorite`;
added `fetchFavoritesThunk` (populates both the favorited ids and the full
product objects, so the Favourites page has real data) and
`toggleFavoriteThunk` (calls the real API first, flips local state only on
success) to `productsSlice.ts`; updated both heart-button call sites
(`ProductCard.tsx`, `ProductDetailView.tsx`); `MainLayout.tsx` now loads
real favorites once authenticated, so heart icons are correct everywhere
in the app, not just on a page that happens to re-fetch them.

**Verified live:** real product favorited via the actual heart button,
confirmed via `GET /favorites` (real row), then a **full fresh page load**
of `/favourites` (not just Redux memory) correctly showed the item with
the sidebar badge - the same persistence check that caught the Mark Sold
bug.

**Also deleted:** `app/report/page.tsx`, a second, fully independent,
100%-fake report page (`?targetType=&targetId=` query params, hardcoded
reason codes that didn't even match the seeded `ReportReason` codes, a
submit handler that just flipped `submitted=true` with no API call) -
confirmed unreachable from anywhere in the UI (nothing ever linked to
`ROUTES.REPORT`) and fully superseded by `ReportModal.tsx`, fixed for real
earlier this session.

### RESOLVED — loopo-client: seller profile page, "Contact Seller"/report/block, and a buyer↔seller chat mislabeling bug (found in the pre-demo sweep)
Found while investigating the fake "Block Seller" button. This turned into
five compounding bugs, all in the same neighbourhood:

1. **`seller/[userId]/page.tsx` was 100% fake** and never called any real
   API: the "seller name" was `userId.replace(/-/g, ' ')` (a UUID with
   dashes turned into spaces - genuinely nonsensical for a real user id), a
   hardcoded stock photo, hardcoded "Bangalore, Karnataka" / "Member since
   2023" / "4.9 (48 reviews)", and **"Listings by this seller" rendered
   `state.products.items` unfiltered** - i.e. whatever products happened to
   already be loaded in Redux from browsing elsewhere, not this seller's
   actual listings. Also unreachable from anywhere in the UI (no page ever
   linked to it).
2. **Backend `getPublicProfile()` had hardcoded mock stats**
   (`sellerRating: 4.8`, `totalListings: 12`, `completedSales: 5`,
   `averageResponseTime: 'Within 1 hour'` - all fake, for every seller).
3. **`ReportModal.tsx` never called `POST /reports`** - `handleSubmit` just
   closed the modal and showed a hard-coded-success toast. Its 3 openers
   (`ProductDetailView`, `MessagesView`, seller profile) also didn't tell it
   *what* was being reported - it derived a "product" from whatever
   `selectedProductId` happened to be, which doesn't apply to reporting a
   seller or a chat at all. Separately, `interactionsApi.ts`'s
   `ReportPayload` shape (`{targetId, reason, details?}`) didn't match the
   real `CreateReportDto` (`targetType`, `targetId`, `reasonCode`,
   `details` required) - it had never actually been exercised through a
   real UI component.
4. **"Block Seller" was `dispatch(showToast('Blocked ...'))`** with no API
   call, on both the seller profile and `blocked-users/page.tsx` (which
   showed two permanently-hardcoded fake blocked users - "Spam Seller 99",
   "Fake Buyer" - for every account, including a brand-new one). The
   `BlockedUser` Prisma model existed but had zero list endpoint anywhere -
   though a working `POST/DELETE /chat/block/:userId` already existed
   (Redis-cached, actually consulted when starting/sending chats).
5. **"Contact Seller"/"Chat with Seller" from a product page always opened
   a hardcoded fake conversation id (`'conv-buy-1'`)**, not a real
   conversation about that specific product/seller - this is likely the
   single most demo-visible bug found this session (any "message the
   seller" click was fake).
6. **Found while verifying fix #5**: every conversation's "other party" was
   computed as `c.buyer || c.seller || c.otherUser` - always preferring the
   buyer object regardless of who the current user actually is. For a
   buyer's own conversation, this showed **their own name/avatar as if it
   were the seller's**. Compounded by `type: c.type === 'selling' ? ... :
   'buying'` - the backend never sets `c.type` at all, so every
   conversation was permanently tagged "buying" and the "Selling" chat tab
   was always empty even for a real seller with real buyer messages.

**Fixed, all six:**
- Added `sellerId` to `ListingSearchQueryDto`/`findPublicListings` (public,
  safe - "other listings by this seller").
- `getPublicProfile()` now computes real aggregates: `totalListings`
  (`COUNT WHERE status=APPROVED`), `completedSales` (`COUNT WHERE
  status=SOLD`), `sellerRating`/`reviewCount` (`AVG`/`COUNT` over
  `ReviewRating.overall` for reviews targeting that user). Dropped
  `averageResponseTime` outright rather than inventing another fake number
  - no real data source exists for it.
- Rewrote `seller/[userId]/page.tsx`: fetches the real profile, dispatches
  `fetchProductsThunk({sellerId})` and filters `state.products.items` by
  `seller.id === userId` for the listings grid, initial-letter avatar
  fallback, real "No reviews yet" state, wired Block/Report to the real
  endpoints below.
- Rewrote `ReportModal.tsx` to call the real `POST /reports` with the
  correct DTO shape; added a `reportTarget: {targetType, targetId, label}`
  slice of `uiSlice` (new `openReportModal` action) so its three openers
  can say what's actually being reported instead of guessing a product.
- **Block/unblock: did not duplicate the existing `/chat/block/:userId`.**
  Added only the genuinely-missing list endpoint (`GET /users/blocked`,
  registered before `GET /users/:id` - same route-order lesson as
  elsewhere this session), and pointed the frontend's block/unblock calls
  at the real `/chat/block/:userId`. (A first pass had added a competing
  `POST/DELETE /users/:id/block` on the same `BlockedUser` table before
  this was noticed - removed before it shipped.) Rewrote
  `blocked-users/page.tsx` to list/unblock for real.
- `handleStartChat` now calls a new `chatApi.startConversationForProduct`
  (`POST /chat/conversations {productId}`), which the backend already
  supported (derives the seller, dedupes, blocks blocked users) but nothing
  called correctly before.
- Added `otherPartyId` to the `Conversation` type; `normaliseConversation`
  now takes `currentUserId` (read from `state.auth.user.id` inside the
  thunk) and compares it against the conversation's real `buyerId`/
  `sellerId` to pick the correct "other party" and compute a real
  `type`/`otherPartyRole`, instead of guessing.
- Also fixed two small adjacent fakes noticed along the way:
  `ProductDetailView`'s "Share" button now actually copies the link
  (`navigator.clipboard.writeText`) instead of just claiming to; the chat
  header's "Call" button no longer fabricates a phone number
  (`+91 98765 43210`, the same fake number reused in `ProfileView.tsx`'s
  hardcoded addresses) - it now says calling isn't available yet, since no
  real phone number is available in the conversation data.

**Verified live, full round trip:** real seller + real buyer accounts,
real approved listing, `GET /users/public/:id` returning real aggregates,
`GET /products?sellerId=X` returning only that seller's listing,
`POST /chat/conversations {productId}` creating a real conversation,
`POST /reports` with `targetType: USER`, `POST/DELETE /chat/block/:userId`
+ `GET /users/blocked` all round-tripping correctly. Browser: seller
profile page renders the real name/avatar/stats/listing (screenshot
confirmed - no more UUID-as-name); clicking "Chat with Seller" on a real
listing landed on `/chats` showing the correct conversation with the
correct other-party name and message-input placeholder (screenshot
confirmed before/after the buyer↔seller mislabel fix). Zero console
errors throughout. Backend: 83/83 unit tests pass, `tsc --noEmit` clean.
Frontend: `tsc --noEmit` clean, `next build` succeeds.

Noted but not fixed (separate, deferred): `ProfileView.tsx`'s
`savedAddresses` array and "4.9 (48 rating)" are still hardcoded (flagged
earlier this session); the "Make Offer" flow (`PATCH /chat/offers`) has no
matching backend route and is downstream of the already-documented
missing-Offers-schema gap - not touched.

### RESOLVED — loopo-client: "Mark Sold" / "Delete" on My Listings never actually persisted server-side, and 5 backend listing-lifecycle endpoints were silent no-ops
Found while doing the pre-demo loopo-client sweep. Two independent bugs
stacked on top of each other:

**Frontend (`myAdsSlice.ts`):** `updateAdStatus`/`deleteAd` were plain
synchronous Redux reducers that mutated local state + `localStorage` only -
neither ever called an API. `productsApi.ts` already had real
`markAsSold`/`deleteAd` methods, but nothing called them. Clicking "Mark
Sold" looked like it worked (badge turned blue) but on the next
`fetchMyAdsThunk()` (e.g. any page refresh), the `fulfilled` merge logic
let the freshly-fetched backend value win over the stale local one, so the
change silently reverted - the exact bug this session already fixed once
for the KYC flow, recurring in a different feature.

**Backend (`products.service.ts::updateProduct`):** even after wiring the
frontend to the real `productsApi.markAsSold`, the call would have been a
no-op anyway - `updateProduct` builds its Prisma update payload from a
fixed field list that never reads `dto.status`. This silently broke *five*
existing controller endpoints that all rely on passing `{ status } as any`
internally: `:id/publish`, `:id/archive`, `:id/pause`, `:id/resume`,
`:id/renew`. None of them ever actually changed a listing's status; they
returned 200 and quietly did nothing beyond whatever the unrelated
"editing an approved listing reverts it to Pending" side-effect did. There
was also no `:id/sold` route at all - `ProductStatus.SOLD` existed in the
schema but nothing could ever reach it via the API.

**Fixed:**
- `updateProduct` now honors an explicit `dto.status` override (safe: it's
  not part of the public `UpdateProductDto` shape, so the global
  `ValidationPipe` strips it from any real client `PUT :id` request before
  this method ever runs - only the five internal lifecycle actions can set
  it), recording a status-history row same as the existing revert case.
  This fixes publish/archive/pause/resume/renew as a side effect.
- Added `PATCH /products/:id/sold` (mirrors the other five).
- `productsApi.ts`'s `markAsSold` now calls the real route (was guessing
  at a nonexistent `/products/:id/status`).
- `myAdsSlice.ts`: replaced the local-only reducers with `markAsSoldThunk`/
  `deleteAdThunk`, which call the real API first and only touch local
  state on success; pages show a real error toast on failure instead of a
  guaranteed-success fake one.
- `MyAdItem` gained a `rawStatus` field (the real backend `ProductStatus`
  enum) alongside the existing coarse `status` bucket, because
  Active/Pending/Draft/Rejected were all being collapsed into one
  "Active"-or-not label. Rewired `my-listings/{active,drafts,pending,
  rejected}` to filter on `rawStatus` instead - previously `drafts`,
  `pending`, and `rejected` were **100% hardcoded static "No X found"**
  placeholders that never checked real data at all (a Draft/Pending/
  Rejected listing would never appear on its own tab), and `active`
  wrongly included Draft/Pending listings alongside truly-live ones.
  Moved the ads fetch into the shared `my-listings/layout.tsx` so landing
  directly on any sub-tab still has real data.
- Deleted dead `components/views/MyAdsView.tsx` (unused, same broken
  local-only-mutation pattern, zero importers).

**Verified live end to end, not simulated:** created a real product via
the API, approved it, clicked "Mark Sold" in an actual browser - watched
the real `PATCH /products/:id/sold` (200, `status: "SOLD"` in the
response), a real success toast, the item leaving the Active tab. Then did
a **hard page reload** (fresh `fetchMyAdsThunk`, not just Redux memory) and
confirmed the item correctly stayed under Sold and correctly stopped
appearing under Active - the exact scenario that silently reverted before
this fix. Backend: `tsc --noEmit` clean, all 83 unit tests still pass.
Frontend: `tsc --noEmit` clean, `next build` succeeds (51/51 pages).

Note: the currently-running backend process turned out to be a stale
`node dist/src/main` build, not `--watch` mode, so it had to be manually
rebuilt (`npm run build`) and restarted before the new `:id/sold` route
took effect - worth knowing if a backend change ever "doesn't seem to
work" locally.

### RESOLVED — loopo-client: the entire Seller Verification (KYC) flow was fake UI hitting endpoints that don't exist
Same class of bug as the Flutter KYC screen fixed earlier this session, on
the web client. All three pages were disconnected from any real backend:
- `verification/page.tsx`: `verificationState` was a hardcoded literal
  `'UNDER_REVIEW'` - **every user, including one who has never submitted
  anything, saw "Your verification documents have been received and are
  currently under review."**
- `verification/documents/page.tsx`: no real file inputs at all (the
  "Upload Front & Back Image" dropzone was decorative, not clickable), no
  selfie step, and the submit handler was a `setTimeout` fake delay that
  just showed a toast and navigated away - nothing was ever uploaded or
  submitted anywhere.
- `verification/review/page.tsx`: fully hardcoded submission date
  ("August 23, 2026") and document number ("XXXX XXXX 9821").
- `userApi.ts` already had `submitKyc`/`getKycStatus` methods, but calling
  `/kyc/submit`/`/kyc/status` - endpoints that don't exist (the real ones,
  built earlier this session, are `POST`/`PUT /kyc`, `GET /kyc/me`,
  `POST /kyc/upload-url`). Confirmed zero callers of either before this fix
  - dead code with a wrong contract, same as several other services found
  this session.

**Fixed:** rewired `userApi.ts`'s KYC methods to the real contract
(`uploadKycImage(slot, file)` does the presign-PUT-register dance per slot,
mirroring `productsApi.uploadProductImage`'s pattern but with a native
`File` instead of a data URL; `submitKyc`/`getMyKyc` call the real routes).
Rewrote all three pages: the documents page now has three real file inputs
(front + selfie required, back optional) and does the full real upload +
submit flow; the dashboard page fetches real status via `getMyKyc()` and
branches UI correctly across not-started/draft/submitted/under-review/
approved/rejected (showing the real rejection reason when present); the
review page shows the real submitted document type, a properly masked
document number, and the real submission date and status.

**Verified live, full round trip, not simulated:** fresh test account
correctly showed "NOT STARTED" (not a fake "under review"); drove the
actual upload form in a browser with two real image files, watched the
real `POST /kyc/upload-url` calls (201 x2) and `POST /kyc` (201, with real
`frontImageId`/`selfieImageId`/`documentNumber`), landed on the review page
showing the real submitted data (`AADHAAR`, masked number, today's date,
`SUBMITTED` status) with a real toast notification. `tsc --noEmit` clean;
all 17 backend unit suites / 83 tests still pass (no backend changes
needed - the contract was already correct from this session's storage
fix).

**Follow-up (same sweep, found via the `/settings` page screenshot):** two
more spots had the exact same hardcoded-fake-KYC-status bug, independent of
the three pages above and inconsistent with them:
- `components/views/SettingsView.tsx`: "KYC & Identity Verification" row
  had a permanently hardcoded green "Verified" badge, and clicking it
  opened a fully decorative `KycModal` (non-functional file dropzone, a
  submit handler that just closed the modal and showed a fake toast -
  never called any API).
- `components/views/ProfileView.tsx`: same - a hardcoded "Seller KYC
  Identity Status: Verified" banner, with an "Update KYC Docs" button that
  opened the same fake `KycModal`.

**Fixed:** both views now call `userApi.getMyKyc()` and branch their
badge/copy across the real status (mirroring `verification/page.tsx`'s
`STATUS_COPY` pattern); both now navigate to the real `/verification`
flow (`ROUTES.VERIFICATION` / `VERIFICATION_DOCUMENTS` / `VERIFICATION_REVIEW`
depending on status) instead of opening a modal. Deleted the dead
`components/ui/KycModal.tsx` entirely and removed its now-unused
`isKycModalOpen`/`setKycModalOpen` state from `uiSlice.ts` (confirmed zero
remaining references via grep).

**Verified live:** fresh test account shows "Not Started" on `/settings`
(was a hardcoded "Verified") and "Seller KYC Identity Status: NOT STARTED"
with a "Start KYC" button on `/profile` (was a hardcoded "Verified" with
"Update KYC Docs"). `tsc --noEmit` clean.

**Noted but not fixed (out of scope for this fix, flagged for the broader
loopo-client sweep):** `ProfileView.tsx` also has a hardcoded
`savedAddresses` array (fake "Venkatesh" / Indiranagar / Domlur addresses,
not from `GET /addresses`), a hardcoded "4.9 (48 rating score & buyer
reviews)", a hardcoded "Bangalore, KA" primary city, and an "Edit Profile"
button that only shows a toast instead of navigating to `/profile/edit`.

### OPEN — loopo-client: "Offers" and "Saved Searches" pages are fully fake, and neither has a real backend concept to wire to
Found in the same sweep as the KYC fix above. Both are 100% hardcoded
(`offersMade`/`offersReceived` arrays with names like "Rahul Verma" and
"MacBook Air M2 16GB"; saved searches like `"iPhone 15 Pro" ... Saved 2
days ago` for a brand-new account that has never searched for anything),
with zero fetch calls. Unlike every other fake page resolved this session,
**there is no real backend model for either concept to wire to**:
- No "Offer"/"Bargain" model or controller exists anywhere in the schema -
  a buyer proposing a different price than the listed one, and a seller
  accepting/rejecting it, is a real feature gap, not a wiring gap.
- The closest thing to "Saved Searches" is `RecentSearch` (`userId`,
  `query`, `createdAt` - a plain search-string history log), which has none
  of what the UI depicts: no category/location filter storage, no
  "alerts on/off" toggle, no notification hook. A real saved-search feature
  needs its own model.

Not fixed this pass - both need real product/schema design (what fields an
Offer needs, whether accepting one should integrate with the payment flow,
what "alert me" should actually trigger for a saved search) rather than a
guessed-at schema addition. Flagging both clearly as fake so they don't get
mistaken for working features, and so the schema work has a clear starting
point if picked up.

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
- ~~**Roles & Permissions**~~ **RESOLVED**: was `MOCK_ROLES`, no fetch, and
  `/admin/roles`/`/admin/permissions` didn't exist on the backend at all.
  Built a real `AdminRolesModule` (`admin/roles` + `admin/permissions`, both
  guarded like every other admin controller) over the existing
  `roles`/`permissions`/`role_permissions` tables: list roles with their real
  permission names and assigned-user counts, list all permissions, create/
  update/delete a role. `SUPER_ADMIN`/`ADMIN`/`USER` are hardcoded-protected
  in the service (can't be renamed, can't have their permissions edited, and
  can't be deleted) since `SUPER_ADMIN` bypasses every permission check
  outright and the other two are referenced by name elsewhere in the app -
  editing them through this API risked a self-lockout or breaking role
  resolution generally, not just a UX nicety. Delete also refuses if any
  non-deleted user still holds the role.

  **Found and fixed a real, independent bug while building this:** seeded
  permissions had drifted from what the code actually checks -
  `admin.dashboard.view`, `admin.notifications.manage`,
  `admin.payments.manage`, `admin.products.manage`, `admin.settings.manage`
  were required by real `@Permissions(...)` guards on 5 different admin
  controllers, but **none of them existed in `prisma/seed.ts`'s permission
  list**. Since a role can never hold a permission that doesn't exist in the
  `permissions` table, this meant the `ADMIN` role (a real, seeded role that
  - unlike `SUPER_ADMIN` - does NOT bypass permission checks) was silently
  locked out of the dashboard, notifications, payments, products-admin, and
  settings-management endpoints with a 403, for as long as this repo has
  existed. Added the 5 missing permissions (plus `roles.view`, which
  `roles.create`/`update`/`delete` existed for but listing roles had no
  permission of its own) to the seed list and re-ran `npx prisma db seed`
  locally (idempotent upserts - safe, no data loss, no remote DB touched).

  Rewrote the Roles page to match: real role cards (protected roles show a
  lock icon and a disabled delete button), a create/edit dialog with
  permissions grouped by module from the *real* fetched permission list
  (replacing the hardcoded `PERMISSIONS` array), and working create/update/
  delete wired to the real endpoints.

  **Verified live, full round trip, not simulated:** direct API calls
  confirmed list/create/update/delete and the `SUPER_ADMIN`-delete
  protection (403); confirmed the 5 previously-missing permissions are now
  real DB rows and that `ADMIN` holds them. Then drove the actual browser
  UI end to end - opened Create Role, filled name/description, toggled a
  real permission switch, clicked Save, watched the real `POST /admin/roles`
  return 201 with exactly the toggled permission, and saw the new role card
  render correctly (then deleted it via the UI's own delete button to clean
  up). `tsc --noEmit` clean on both apps; all 17 backend unit suites / 83
  tests still pass.
- ~~**Payments**~~ **RESOLVED**: was hardcoded transactions (`John Doe`,
  `PayPal` - a provider this backend doesn't even integrate) with a
  double-`api/v1/`-prefix bug on the controller (fixed in the earlier
  route-prefix pass) and a path/contract mismatch on top of that
  (`paymentsService` called `/transactions`, `/subscriptions`, `/refunds` as
  separate GETs; the real controller only had `GET /admin/payments`,
  `GET /admin/payments/:id`, `POST /admin/payments/refunds`). Also corrected
  a wrong assumption from earlier in this file: **there is a real
  subscriptions concept** (`SubscriptionPlan`/`Subscription` models, a real
  self-service `subscriptions` module for sellers to subscribe/cancel/check
  their plan) - it just had no admin-facing list endpoint at all, same gap
  as refunds (only `POST .../refunds` existed to create one, no `GET` to
  list them). Fixed by adding `GET /admin/payments/subscriptions` and
  `GET /admin/payments/refunds` to `AdminPaymentsService`/`AdminPaymentsController`
  (registered before the `:id` route to avoid it swallowing the literal
  segments), fixing `admin.service.ts`'s `paymentsService` to the real
  contract, and rewriting the page to fetch and render all three tabs for
  real (Payments/Subscriptions/Refunds), including a real client-side CSV
  export of whatever's currently loaded (was a decorative button before).
  Verified live: seeded one real payment/subscription/refund via Prisma,
  confirmed all three tabs and all four stat cards render the real rows and
  correct counts, then cleaned the test rows up. `tsc --noEmit` clean; all
  17 backend unit suites / 83 tests still pass.
- ~~**Reports**~~ **RESOLVED, by repurposing the page rather than building the
  fake concept:** this page used to depict a "report library" (58 generated
  reports, download counts, scheduled reports) - a PDF/CSV report-generation
  module that genuinely doesn't exist and would be new infrastructure to
  build. Separately, the *other* "reports" concept (user-filed abuse/
  moderation reports about a listing or seller - see the double-prefix-bug
  entry below) has a real, fairly sophisticated backend (reports grouped
  into moderation cases, evidence attachments, an AI-moderation queue that
  auto-triages priority/status, assignment, escalation) with **zero admin
  UI anywhere**. Replaced the fake report-library page with a real
  moderation-reports page at the same `/reports` route - same reasoning as
  the Notifications/Announcements split earlier: this is what "Reports"
  conventionally means in a marketplace admin panel anyway, and there was
  nothing salvageable in the fake concept to preserve. New page: stat cards
  (Open/In Progress/Escalated/Closed, computed from the loaded list),
  status/target-type/priority filters, a detail dialog (reporter, target,
  reason, details, evidence links, case), and working actions (assign to a
  moderator, escalate with a note, resolve, reject). Verified live, not
  simulated: filed a real report through the actual user-facing
  `POST /reports` endpoint, confirmed it appeared on the page (and that the
  AI-moderation queue had already auto-escalated it to CRITICAL/UNDER_REVIEW
  by the time it loaded - the pipeline is real, not a stub), opened the
  detail dialog, and executed a real "Mark resolved" action that returned
  200 and updated the row's status and the stat cards live. `tsc --noEmit`
  clean; all 17 backend unit suites / 83 tests still pass (no backend
  changes were needed for this one - the contract was already correct from
  the earlier duplicate-controller cleanup).
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

### RESOLVED — loopo-backend: the analytics double-prefix bug existed on 9 controllers, not 1
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

**The remaining 3 (reviews, reports, notifications) - now resolved:**
- **Reviews**: `admin/reviews/admin-reviews.controller.ts`
  (`AdminReviewsService`-backed: pagination, type filter, get-by-id, hard
  delete - unreachable dead code) vs. `reviews/controllers/admin-reviews.controller.ts`
  (`ReviewsService`-backed: list/hide/restore/soft-delete - already correctly
  live on `/admin/reviews`, what the frontend's `reviewsService` points at).
  **Resolution: merged forward, then deleted the dead side.** Ported the
  unreachable controller's genuinely valuable bits - pagination and a
  `reviewType` filter on the list query (the working side's `findAllReviews()`
  had neither, an unbounded `findMany()` with no limit at all - a real
  scalability concern on its own) and a `GET :id` detail route - into
  `ReviewsRepository.findAllReviews()` / `ReviewsService.adminGetAllReviews()`
  + new `adminGetReviewById()` / `AdminReviewsController` (the real one).
  Kept the working side's `restore` action and its delete's
  rating-recalculation queue trigger, which the dead side's DTO-based
  hide/hard-delete had no equivalent for. Deleted
  `src/modules/admin/reviews/` (controller, service, DTO, module) entirely
  and its registration in `admin.module.ts`. Also fixed `admin.service.ts`'s
  `reviewsService`, which had its own independent contract drift (`publish`
  and a hard `DELETE` that neither controller ever had) - now
  `getAll(skip/take/type)`, `getById`, `hide`, `restore`, `delete` (the real
  soft-delete `PATCH :id/delete`).
- **Reports**: `admin/reports/admin-reports.controller.ts`
  (`AdminReportsService`-backed - unreachable) vs.
  `reports/controllers/admin-reports.controller.ts` (`ReportsService`-backed,
  already correctly on `/admin/reports`). This is the **user-filed
  abuse/moderation reports** feature (reports about a listing or seller), a
  completely different concept from the fake admin "Reports" *page*
  documented above (a PDF/CSV report-generation library with no backend at
  all under either name) - don't confuse the two. **Resolution: deleted the
  dead side outright** - the working controller was already a strict
  superset (get-all with filters, get-by-id, assign, status update, escalate,
  resolve, reject vs. the dead side's smaller get-all/get-by-id/resolve/
  status-update), nothing worth porting forward. Also fixed two independent
  contract bugs in `admin.service.ts`'s `reportsService` found while
  comparing it against the real controller: `assign()` sent `{adminId}` but
  the controller reads `@Body('moderatorId')` (assignment would have
  silently no-opped with `moderatorId: undefined` on every call), and
  `escalate()` never sent a body at all despite the controller expecting
  `@Body('note')`. `resolve()` also lost its `notes` param - the real
  endpoint has no field for it at all (`PATCH :id/resolve` takes no body);
  flagged rather than invented a backend field for it. **Still true and
  unchanged:** `reportsService` is now fully contract-correct but still has
  **zero admin page calling it** - a real, working moderation feature with no
  UI, a separate piece of work from this cleanup.
- **Notifications**: `admin/notifications/admin-notifications.controller.ts`
  (broadcast + system announcements) vs.
  `notifications/controllers/notifications.controller.ts` (the `Notification`-
  model CRUD list, already correctly on `/admin/notifications`, guards fixed
  earlier this session). **Not actually the same resource** - unlike the
  other two, this isn't really a duplicate, it manages a different model
  (`SystemAnnouncement` broadcasts vs. individual `Notification` rows) that
  happened to share a path due to the prefix bug. Naively fixing the prefix
  to `admin/notifications` would have made `GET .../announcements` collide
  with (and always lose to, per Express/Nest's route-registration-order
  matching) the other controller's `GET .../:id`. **Resolution: gave it its
  own top-level path**, `admin/announcements` (`POST`/`GET`, no sub-path
  needed once it's not nested under notifications) rather than either
  deleting real functionality or risking a silent route shadow. Verified
  live: `GET /admin/announcements` and `POST /admin/announcements` both
  return 200 with real data (previously 404 via the double prefix, for every
  caller, forever). No frontend service or admin page calls this yet either
  - same "real backend, no UI" situation as reports above.

**Verified for all three:** live route dump shows every path unique with no
collisions; a live round trip against `/admin/reviews` (pagination + type
filter), `/admin/reports`, and `/admin/announcements` all returned correct
200s; `tsc --noEmit` clean on both apps; all 17 backend unit suites / 83
tests still pass.

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

### RESOLVED — 8 duplicate Swagger DTO class names (6 original + 2 this session introduced)
Was: `Duplicate DTO detected` boot warnings for `GetUploadUrlDto`,
`UpdateProductDto`, `RejectProductDto`, `FeatureProductDto`, `BoostProductDto`,
`CreateCouponDto` — each defined with a different shape in more than one
module. Building the Roles & Permissions API this session added two more
(`CreateRoleDto`/`UpdateRoleDto` clashing with a **pre-existing, already-
registered RBAC module** at `src/modules/rbac/` - see below). Nest's own
message says this will throw an error in the next `@nestjs/swagger` major
version, not just warn - fixed all 8 rather than leaving the two new ones
alongside the six already-documented ones.

Resolved each pair on its merits, not a blind rename:
- `GetUploadUrlDto` (chat vs. users): both real/reachable, different
  validation (chat's had no `@IsNotEmpty`/MIME check). Renamed chat's to
  `ChatUploadUrlDto`.
- `RejectProductDto`/`FeatureProductDto`/`BoostProductDto` (admin/products vs.
  products): **deleted**, not renamed - these three, and the `approve`
  handler alongside them, were dead code. `ProductsModule` registers before
  `AdminModule` in `app.module.ts`, so `products/controllers/
  admin-products.controller.ts`'s identically-pathed `PATCH :id/approve|
  reject|feature|boost` always won the route match; `admin/products/
  admin-products.controller.ts`'s versions (and the
  `updateProductStatus`/`featureProduct`/`boostProduct` service methods
  backing them) could never actually execute. Removed all of it; the real,
  reachable implementations are `ProductsService.approveProduct`/
  `rejectProduct`/`promoteFeatured`/`promoteBoost`.
- `UpdateProductDto` (admin/products vs. products): both real - the admin
  side is a generic `PATCH /admin/products/:id`, the other is the
  seller-facing `PUT /products/:id` this session's edit-listing-flow fix
  uses. Renamed the admin side to `AdminUpdateProductDto`.
- `CreateCouponDto` (admin/coupons vs. payments): both real, different
  paths. Renamed the admin side to `AdminCreateCouponDto`.
- `CreateRoleDto`/`UpdateRoleDto` (new admin/roles vs. pre-existing
  `rbac.module.ts`): **discovered a second, independent duplicate-
  implementation situation** while fixing this - see the dedicated entry
  below. Renamed the newer (`admin/roles`) side to
  `AdminCreateRoleDto`/`AdminUpdateRoleDto` since it's this session's own
  addition and the RBAC module is pre-existing.

Verified live: zero `Duplicate DTO detected` warnings on boot (previously
8); re-verified `GET /admin/products`, `GET /admin/roles`,
`GET /admin/permissions` all still return real data after the renames;
confirmed the live route table still has no collisions on
`admin/products/:id/approve|reject|feature|boost` (only the real,
`ProductsModule`-owned ones remain - the dead duplicates are gone, not just
unreachable). `tsc --noEmit` clean; all 17 backend unit suites / 83 tests
still pass.

### OPEN — Two independent role/permission management systems now exist (`/roles`+`/permissions` and `/admin/roles`+`/admin/permissions`)
Discovered while fixing the `CreateRoleDto`/`UpdateRoleDto` Swagger clash
above: `src/modules/rbac/` is a **complete, pre-existing, already-registered**
RBAC system (`RolesController` at `/roles`, `PermissionsController` at
`/permissions`, `UserRolesController` at `/users/:userId/roles`) that this
session didn't know existed when it built the new `AdminRolesModule` for the
Roles & Permissions admin page (see that RESOLVED entry above). No route
collision (different base paths), but real functional overlap: both can
create/update/delete a `Role`, both can list `Permission`s.

They are **not** simply duplicates, though - each has something the other
lacks entirely:
- The pre-existing `rbac` module can create/update/delete individual
  `Permission` **definitions** (new permission types) and assign/revoke a
  **role to a user** (`POST`/`DELETE /users/:userId/roles`) - neither of
  which the new `admin/roles` module does at all.
- The new `admin/roles` module can **attach/detach permissions to/from a
  role** (`RolePermission` management) - which, surprisingly, the
  pre-existing `rbac` module never could: its `createRole`/`updateRole` only
  ever touch `name`/`description`, never `RolePermission` rows. Before this
  session, **there was no way at all**, anywhere in this codebase, to assign
  a permission to a role via API (only via the seed script / a raw DB write).

Confirmed via a full frontend grep that nothing calls `/roles`, `/permissions`,
or `/users/:userId/roles` today - the admin frontend's `rolesService` was
already written against `/admin/roles`/`/admin/permissions` (this session's
new paths) before either existed, and role-to-user assignment goes through a
**third**, separate path that does exist and register cleanly,
`PATCH /admin/users/:id/roles` (`usersService.updateRoles`, in
`admin-users` module - pre-existing, not investigated further as part of
this pass beyond confirming the route is live).

Not resolved this pass - unlike the other duplicate-controller cases this
session, this isn't a "delete the redundant one" situation since both sides
have real, non-overlapping capability. Needs a deliberate decision: merge
`rbac`'s permission-definition CRUD and user-role-assignment into
`admin/roles` (making one module authoritative) or keep both but document
the split clearly and wire `PATCH /admin/users/:id/roles` to actually call
into one of them consistently. Flagging so it doesn't get rediscovered from
scratch or accidentally duplicated a third time.

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

### RESOLVED — Backend CORS: `origin: true` + `credentials: true`
`main.ts` reflected any request Origin back as allowed, with credentials
enabled. Verified there is **no cookie-based auth anywhere in the backend**
(no `cookie-parser`, no `res.cookie`, no `Set-Cookie` — auth is pure
Bearer-token), so the classic CSRF/credential-theft exploitation of this
pattern doesn't apply here — this was never an active vulnerability, just
broader than necessary.

Fixed without guessing at production domains this session has no way to
verify (hardcoding a wrong or incomplete allowlist would have silently
broken the real deployed frontend the next time this ships): added a
`CORS_ALLOWED_ORIGINS` env var (comma-separated) that, when set, restricts
CORS to exactly those origins; left the default unchanged (`origin: true`)
when it's unset, so nothing breaks for anyone until whoever manages the
real deployment opts in by setting the env var — no further code change
needed on their end. Documented in `.env.example`.

Verified live: confirmed default behavior is byte-for-byte unchanged
(reflects any Origin) when the env var is unset; then booted a second,
throwaway instance on a separate port with
`CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001` set and
confirmed a listed origin gets reflected in `Access-Control-Allow-Origin`
while an unlisted one (`http://evil.example.com`) gets no CORS header at
all (blocked) - the allowlist branch actually works, not just compiles.
`tsc --noEmit` clean; all 17 backend unit suites / 83 tests still pass.

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
