# App Evaluation — Core Functionality Status & Roadmap

*Evaluated 2026-07-03, branch `chore/react-router-v7-migration-bootstrap`*

## Verdict

The migration is **functionally complete but not finished**. Phases 0–6 of the refactor plan are done; **Phase 7 (cleanup) has not started**. The new React Router v7 app lives at the repo root and works: `tsc` is clean for the new app, all **89 Jest tests pass** (16 suites), and the three core areas below are implemented end-to-end. The old Next.js app is archived in `oldapp/` and is now the main source of noise and risk.

---

## 1. Auth with tenancies — ✅ working, with security gaps

**What works:** cookie-session login/logout, bcrypt hashing, signup → onboarding → tenancy switcher flow, route guards (`requireUserSession`, `requireTenancyUser`, `requireOnboardingUser`), tenancy switch validates membership server-side before committing.

**What to fix:**

| Priority | Issue | Detail |
|---|---|---|
| 🔴 High | Stale session authority | `tenancyId` + `role` are baked into a 7-day cookie (`session.server.ts`). Revoking a membership or demoting a role does **nothing** until the cookie expires — the guards never re-check the DB. |
| 🔴 High | Unused `Session` model | The Prisma `Session` table exists but nothing writes to it. Either implement DB-backed sessions (fixes the point above + enables logout-everywhere) or delete the model. |
| 🔴 High | Insecure secret fallback | `SESSION_SECRET ?? "dev-insecure-session-secret"` — should **throw at startup in production** instead of silently signing cookies with a known string. |
| 🟠 Medium | No role enforcement (RBAC) | `role` (OWNER/ADMIN/MEMBER) is carried in the session but no guard checks it — a MEMBER can reach every admin route. Add `requireRole(...)` guard once roles matter. |
| 🟡 Low | Login error leakage | `login.server.ts` returns `Authentication failed: ${error.message}` to the client — internal errors (e.g. DB connection strings in messages) can leak. Log server-side, return a generic message. |
| 🟡 Low | Bootstrap defaults | Dev bootstrap user (`admin@example.com` / `admin1234`) is correctly disabled in production, but keep an eye on `AUTH_BOOTSTRAP_ENABLED` semantics (`!== "false"` means it's on by default). |

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
3. **Auth hardening** (the 🔴 items above): fail-fast `SESSION_SECRET`, then decide cookie-only vs DB-backed sessions — this decision gates the stale-role fix and the unused-model cleanup with one stone.
4. **RBAC guard** — add `requireRole` before building any owner/admin-only features.
5. **Then** feature work: planner polish, seed script, service worker (explicitly deferred post-migration).

## What NOT to do

- Don't start a Mantine migration — you're already on 9.4.1.
- Don't chase the `oldapp/` type errors — delete the directory instead.
- Don't add a service worker yet (plan already defers it, correctly).
