---
last_verified: 2026-09-13
---

# Decision Log

Format: Decision / Reason / Alternatives Considered / Impact / Date

---

**Decision:** Did not build the full `agents/00-master` + `02-domain` … `08-ops`
scaffold (~150 files) specified in the originating instructions this session. Only
`agents/01-context/` (this compressed memory) was created.
**Reason:** The instructions themselves (rule 67 in the original directive) warn
against spending the majority of an autonomous run on documentation/polish while
core things might be broken. Generating ~150 mostly-generic role/process files before
touching the actual codebase would have been exactly that — high token cost, low
verified value, and risked producing content not grounded in the real repo (which
the same instructions explicitly forbid — "do not fabricate repository findings").
**Alternatives considered:** Build the full scaffold literally as specified;
build nothing and go straight to bug-fixing with no persistent memory at all.
**Impact:** `01-context/` exists and is accurate. The deeper domain-specific agent
files (messaging.md, kyc.md, websocket.md, etc.) do not exist yet — if a future task
needs that layered-context structure, build the specific files that task needs, not
the whole tree speculatively.
**Date:** 2026-09-13

---

**Decision:** Removed `aadhaar_front_1788186479093.jpg` from the working tree /
current branch tip only; did **not** purge it from git history or force-push.
**Reason:** User explicitly chose "just remove going forward" when asked, over the
recommended full history purge. History rewrite + force-push on a shared branch
(`origin/development`) is destructive to every collaborator's clone and was correctly
treated as requiring explicit user sign-off rather than autonomous action.
**Alternatives considered:** `git filter-repo` + coordinated force-push (recommended,
declined); leaving the file in place untouched (rejected — unnecessary ongoing
exposure with zero cost to remove going forward).
**Impact:** The image is still recoverable by anyone with read access to
`origin/development`'s history. Tracked as an open item in
[known-issues.md](known-issues.md). Also added a `.gitignore` guard
(`/*.jpg`, `/*.jpeg`, `/*.png`, `/*.pdf` at repo root only) so a repeat can't happen
by accident.
**Date:** 2026-09-13

---

**Decision:** Fixed 14 `loopo-admin` pages by aliasing `Grid2 as Grid` in their imports
rather than rewriting their JSX back to the legacy Grid API, and rather than renaming
`Grid` to `Grid2` everywhere (including the ~20 pages that correctly use the legacy API).
**Reason:** Root cause was purely an import mismatch — every affected page already used
the new `size={{...}}` API consistently in its JSX; only the import pointed at the wrong
component. Aliasing is a 1-line-per-file fix with zero JSX churn, vs. hundreds of lines
touched for either alternative, and doesn't disturb pages that are already correct.
**Alternatives considered:** Rename all `Grid` usages to `Grid2` (larger diff, no
benefit); revert `size={{}}` back to legacy `item xs=` syntax (larger diff, moves away
from the newer API other pages will presumably keep using).
**Impact:** 115 TS errors → 0, no behavioral change to any page.
**Date:** 2026-09-13

---

**Decision:** Removed `typescript.ignoreBuildErrors: true` from `loopo-admin/next.config.ts`
after fixing the underlying errors, rather than leaving it in place "just in case."
**Reason:** That flag is how 115 real errors — including an actual logic bug in the KYC
admin filter — shipped silently. Leaving it in place after the fix would just reset the
trap for the next regression. Verified `next build` still passes with it removed
(real type-checking now runs and takes ~7s, acceptable).
**Alternatives considered:** Leave the flag in place for build-speed reasons (rejected —
7s is negligible; masking type errors in an admin panel with moderation/KYC/payments
surface area is not an acceptable tradeoff).
**Impact:** Future admin PRs will now actually fail the build on type errors instead of
shipping them silently.
**Date:** 2026-09-13

---

**Decision:** Baselined the local dev database's Prisma migration history
(`prisma migrate resolve --applied` for both existing migrations) rather than
running `prisma migrate reset` or `migrate dev`.
**Reason:** The local DB's schema (112 tables) already exactly matched
`schema.prisma` (confirmed via `prisma migrate diff` — zero drift), it just had no
`_prisma_migrations` table, meaning it was originally provisioned via `db push`
rather than tracked migrations. `migrate deploy` correctly refused to run
(`P3005`) rather than risk altering an already-correct schema. Baselining marks
the two existing migrations as applied without re-running their SQL — safe given
the confirmed zero-diff, and non-destructive.
**Alternatives considered:** `migrate reset` (rejected — destroys data
unnecessarily for a problem that's purely bookkeeping); ignoring the P3005 and
using `db push` going forward (rejected — leaves migration history permanently
unusable).
**Impact:** Local dev DB can now run `prisma migrate deploy` normally. This is
**local-only** per explicit user instruction ("for now keep it local") — if
staging/production was provisioned the same way (via `db push`, no migration
history), it will hit the identical `P3005` error on a real deploy and needs the
same baselining treatment there, deliberately not done as part of this session.
**Date:** 2026-09-13

---

**Decision:** When `chat.module.ts` and `products.module.ts` were found to both
register BullMQ queues named `image-compression`/`thumbnail-generation` with
incompatible processors, renamed **products'** side
(`product-image-compression`/`product-thumbnail-generation`) rather than chat's.
**Reason:** Chat's implementation is the fully real one (downloads via URL,
compresses with `sharp`, uploads to S3); products' is an explicit stub
("Simulate high-performance WebP image compression" — doesn't actually compress
anything, just fakes a DB update). Renaming the incomplete/stub side is lower risk
and doesn't touch the feature that's actually depended upon in its current form.
**Alternatives considered:** Rename chat's side instead (rejected — same
mechanical cost, but touches the more mature implementation for no added
benefit); leave both sharing the queue name and add `job.name` branching inside
each processor to safely ignore jobs not meant for it (rejected — more invasive
change to both processors' logic, whereas a name change is a pure rename with no
behavioral risk to either processor's internals).
**Impact:** `products.module.ts`, `products.processor.ts`, `products.service.ts`
(2 `@InjectQueue` sites), `queues.module.ts`, and `products.service.spec.ts` (mock
token names) all updated consistently. Chat's queues/processors untouched.
**Date:** 2026-09-13

---

**Decision:** Fixed `SellFlowView.tsx` (the edit-listing flow) enough to compile
and submit a real `categoryId` (fetches real categories, tracks a real id), but
did not fix its deeper problem — it never reads the Redux state the edit page
populates, so editing any listing shows a blank form regardless of which listing
was opened.
**Reason:** That's a materially bigger, separate task: the component would need
either to actually consume `state.sell.formData` throughout instead of its own
disconnected local state, or be refactored to receive the product as a prop, and
the edit page itself needs to fetch the listing by id from the API when it isn't
already in the Redux store (currently only works if the listing happens to already
be loaded). Attempting a full fix in the same pass as the create-flow fix risked
either scope creep or a rushed, undertested change to a second, differently-broken
flow. The minimal fix keeps the create-flow contract change (categoryId, not a
name) from breaking this component's compile/runtime, without pretending edit is
now functional.
**Alternatives considered:** Leave it fully broken (type error on build — rejected,
worse than a partial fix); attempt the full edit-flow fix in this pass (rejected —
see reason above; documented in known-issues.md as a properly scoped follow-up
instead).
**Impact:** `loopo-client` builds and type-checks clean. The edit-listing flow
remains non-functional, same as before this session, just no longer via a category
crash — via a form that ignores the listing being edited entirely.
**Date:** 2026-09-13

---

**Decision:** Did the full edit-listing fix deferred above, per explicit user
priority ("storage fix, the edit-listing flow in this order"): `SellFlowView`
now takes `listingId`/`initialProduct` props, prefills from the real listing,
and calls a new `updateProductThunk` (`PUT /products/:id`) instead of
`createProductThunk` when editing; the edit page fetches the listing by id
when it isn't already in the store.
**Reason:** This was next in the user's stated priority order, right after the
storage/signed-URL fix (see known-issues.md's RESOLVED entries for both, with
full live-verification detail). Verifying the round trip surfaced two more
real bugs on the page an edit-save redirects to (`ProductDetailView.tsx`
calling `useRouter()` after an early return — a Rules-of-Hooks violation; and
`navigationSlice.ts`'s `selectedProductId: 'p1'` placeholder default firing a
guaranteed-failing request on every fresh listing view) — both fixed in the
same pass since they were direct, contained blockers to confirming the edit
flow actually works end to end, not scope creep.
**Alternatives considered:** Route the edit flow through the existing
multi-page `/sell/*` create flow (which already uses `sellSlice` correctly)
instead of fixing the standalone `SellFlowView` component — rejected as a
larger, riskier refactor (that flow's `sell/preview` page is hardwired to
`createProductThunk` and its own navigation/success page) for no clear benefit
over fixing the component actually used at this route.
**Impact:** Editing a listing now genuinely prefills and updates the existing
record (verified live: real PUT, 200, persisted change, correct render after
redirect) instead of silently no-opping or duplicating. Not done: listing
images still aren't wired into create/update at all (pre-existing, separate
gap); a hydration-mismatch warning on the listing detail page self-heals via
Next's client re-render and wasn't root-caused.
**Date:** 2026-09-13
