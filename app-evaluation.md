# App Evaluation — Core Functionality Status & Roadmap

*Evaluated 2026-07-03, branch `chore/react-router-v7-migration-bootstrap`*

## Verdict

The migration is **functionally complete but not finished**. Phases 0–6 of the refactor plan are done; **Phase 7 (cleanup) has not started**. The new React Router v7 app lives at the repo root and works: `tsc` is clean for the new app, all **89 Jest tests pass** (16 suites), and the three core areas below are implemented end-to-end. The old Next.js app is archived in `oldapp/` and is now the main source of noise and risk.

---

## 1. Auth with tenancies — ✅ working, with security gaps

**What works:** cookie-session login/logout, bcrypt hashing, signup → onboarding → tenancy switcher flow, route guards (`requireUserSession`, `requireTenancyUser`, `requireOnboardingUser`), tenancy switch validates membership server-side before committing.

**Hardening applied 2026-07-03:**

| Status | Issue | Resolution |
|---|---|---|
| ✅ Fixed | Stale session authority | `requireTenancyUser` now re-validates the membership against the DB on **every request**: revoked/inactive membership → redirect to `/switch-tenancy`; the returned `role` always comes fresh from the DB, so demotions apply immediately. The cookie is now only a claim. |
| ✅ Fixed | Insecure secret fallback | `session.server.ts` **throws at startup in production** unless `SESSION_SECRET` is set and ≥ 32 chars. Dev fallback remains for local work. |
| ✅ Fixed | No role enforcement (RBAC) | New `requireTenancyRole({ ..., allowedRoles })` guard — throws 403 for disallowed roles. Not yet applied to any route (no owner/admin-only features exist yet); use it when they do. |
| ✅ Fixed | Login error leakage | Internal errors are logged server-side; the client gets a generic "Authentication failed. Please try again." |
| ⏳ Deferred | Unused `Session` model | Per-request re-validation made DB-backed sessions unnecessary for revocation. The unused Prisma `Session` model should be **deleted in a future migration** (or kept only if logout-everywhere/audit is wanted later). |
| 🟡 Low | Bootstrap defaults | Dev bootstrap user (`admin@example.com` / `admin1234`) is correctly disabled in production, but keep an eye on `AUTH_BOOTSTRAP_ENABLED` semantics (`!== "false"` means it's on by default). |

Cost note: the re-validation adds one indexed `TenancyMember` lookup per protected request — negligible at this scale.

## 2. Database (Oracle → Postgres) — ✅ migration done

**What works:** Prisma 7 + `@prisma/adapter-pg`, local Postgres via `docker-compose.postgres.yml`, migrations applied, all 14 core entities modeled. Tenancy scoping is done **defense-in-depth style** — spot-checked `plannerRepository` and `manageAdminEntities`: every query filters by `tenancyId`, including ownership re-checks before deletes. Oracle data was ruled discardable (Phase 0 decision), so nothing is lost.

**What to fix:**

- **Oracle isn't gone yet** — `oracledb`, the wallet, and the old DB service still live in `oldapp/`. Deleting `oldapp/` (Phase 7) is the real completion of this migration.
- **No seed script** — onboarding a new dev machine means clicking through signup manually. Add `prisma/seed.ts`.
- **Unused `Session` model** (see auth section) — decide its fate before more migrations pile on top.

## 3. Schedule making + Mantine — ✅ built, Mantine v9 already done

**Good news: the Mantine migration you listed as pending is already complete.** All three packages (`@mantine/core`, `form`, `hooks`) are installed at **9.4.1** — verified in `node_modules`, not just `package.json`. No work needed beyond tracking 9.x patch releases.

**What works:** schedules CRUD, weekly planner grid (Mon–Sun, 6:00–22:00, click-to-add), lesson drawer with live availability via `/api/planner-availability`, conflict engine (the overlap query in `plannerRepository.server.ts` uses the correct `start < newEnd AND end > newStart` interval logic), timeslots single + template CRUD, syllabus management.

**What to fix:**

- **Old validation rules not ported** — `oldapp/lib/scheduleValidation/*` domain rules never made it into the new service layer. Review them before deleting `oldapp/`; port anything still relevant into `app/lib/domain/`.
- **Planner hardcodes 6:00–22:00** display window (`DISPLAY_START_MINUTE=360`) — fine for now, flag as config later.
- **Polish backlog** (post-cleanup): card color-coding by subject/class, print-friendly view.

---

## What to do next, in order

1. **Commit the pending work.** The improved multi-stage `Dockerfile` (with `prisma migrate deploy` on start), the `switch-tenancy.tsx` unused-import cleanup, and `build-docker.sh` are sitting uncommitted. Verify the Docker image actually boots once (`prisma migrate deploy` must find the CLI and `prisma.config.ts` in the runner stage), then commit.
2. **Phase 7 cleanup — the single highest-value task:**
   - Salvage first: review `oldapp/lib/scheduleValidation/*` for rules worth porting.
   - Move secrets out (`oldapp/app/wallet/`, `oldapp/githubActionSshKey`) if still needed anywhere, then delete `oldapp/` entirely.
   - Until deletion, add `"exclude": ["oldapp"]` to `tsconfig.json` — right now `npm run typecheck` reports dozens of errors that are all from the archived app, which masks real regressions.
   - Update `README.md` + document required env vars (`DATABASE_URL`, `SESSION_SECRET`, `AUTH_BOOTSTRAP_*`).
3. ~~**Auth hardening**~~ ✅ Done 2026-07-03 (see table above). Remaining follow-ups: set a real `SESSION_SECRET` in production env, drop the unused `Session` model in a future migration, apply `requireTenancyRole` when admin-only features arrive.
4. **Then** feature work: planner polish, seed script, service worker (explicitly deferred post-migration).

## What NOT to do

- Don't start a Mantine migration — you're already on 9.4.1.
- Don't chase the `oldapp/` type errors — delete the directory instead.
- Don't add a service worker yet (plan already defers it, correctly).
