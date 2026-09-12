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
