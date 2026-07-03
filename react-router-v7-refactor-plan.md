# React Router v7 Refactor Base Plan

## Executive summary

This should be treated as a controlled rewrite with code reuse, not as a router swap.

The current codebase is tightly coupled to Next.js in four critical areas:

- routing and layouts in the `app/` directory
- authentication via `next-auth@beta`
- internationalization via `next-intl` middleware and locale segments
- server-side data access through App Router server actions and an Oracle-specific database service

Because the app is still under development and you do not need backward compatibility, the cleanest path is:

1. build a fresh React Router v7 application in Framework Mode
2. move the reusable UI and domain logic over in vertical slices
3. replace the auth stack instead of trying to preserve NextAuth behavior
4. replace Oracle with local PostgreSQL plus Prisma as the new source of truth
5. delete Next.js completely after the React Router app reaches feature parity

Rendering requirement:

- use React Router v7 built-in SSR solutions as a first-class requirement from the start

The migration should happen on a dedicated long-lived branch. Do not try to keep the Next.js runtime and the React Router runtime both "first class" for long.

## Current Status (2026-06-29)

**Migration is NOT complete — reference-path milestone is done; product parity is ~40% complete.**

### Verified working (new React Router v7 app)

New app health: `tsc` clean, 89 tests passing, RR7 7.13.2 + Mantine 9.4.1 + Prisma 7.6.0 + React 19.2.4. Located in `/react-router-v7-app/` as its own nested git repo. SSR baseline verified. Docker Compose Postgres local dev verified.

**Phase 0–1 (Bootstrap)**: ✅ Complete
- Fresh RR7 app boots without Next.js
- SSR working, Mantine configured, Zustand present
- Root error/not-found boundaries, public/protected/admin layouts

**Phase 4 (i18n)**: ✅ Complete  
- Locale-prefixed routes (`/en`, `/hu`) via remix-i18next + middleware
- Translation lookup working, locale switcher ported
- `messages/*.json` reused

**Phase 5 (Route tree)**: ✅ Complete  
- Structural shape recreated; protected dashboard, public shell working
- Auth guards on tenancy layout; smoke tested

**Phase 6 (Feature slices — partial)**
- ✅ Admin entities: specialty, subject, teacher, classroom, class, frame (real Prisma-backed CRUD, tested)
- ✅ Timeslots: single + template creation/edit/delete (tested)
- ✅ Schedules list/new/edit: real loader→service→repository layering, form validation, persistence
- ✅ Signup + tenancy onboarding: two-step signup → onboarding → tenancy switcher, auto-slug generation, guards updated
- ✅ Schedule planner UI: WeeklyPlannerGrid (Mon–Sun, 6am–10pm absolute-positioned cards, 15-min click-to-add), AddLessonDrawer (inline lesson creation), LessonCard (progressive disclosure, trash action)
- ✅ Conflict engine / availability checks: `/api/planner-availability` resource route, booked teacher/classroom IDs surfaced in drawer dropdowns
- ✅ Schedules read-view: real planner loader + add/remove entry actions, WeeklyPlannerGrid wired
- ✅ Syllabus management: filterable list + create/edit drawer + delete, Prisma-backed, 10 service tests

**Database**: ✅ Prisma schema foundation complete (all core entities: User, Tenancy, TenancyMember, Session, Specialty, Subject, Classroom, Teacher, Class, Frame, Timeslot, Schedule, ScheduleEntry, SyllabusItem). Initial migration applied. Local Postgres ready via docker-compose.

**Auth**: ✅ Cookie-session login/logout working. Route guards for authenticated + tenancy-required. bcryptjs password hashing. Session contains userId, email, tenancyId, role.

### Still in the old app (NOT migrated — blocks Phase 7 cleanup)

- Syllabus UI (syllabus-table/*): schema exists in Prisma, no routes or UI
- lib/scheduleValidation/* (domain validation rules, not yet ported to service layer)
- Old auth/session via next-auth
- Oracle database + oracledb driver

### Structural notes

- Two apps coexist: old Next.js at root; new RR7 in `react-router-v7-app/` (nested `.git` repo, not a submodule).
- Stale cruft removed: `components/forms/CreateClass.tsx.new` (empty), `react-router-v7-app/app/welcome/` (unused scaffold).
- Secrets (gitignored, not committed): `app/wallet/` (Oracle wallet), `githubActionSshKey`, `.env*`. Do not delete until old app is retired.

### Suggested next priority

1. **Phase 7 cleanup**: remove old Next.js app, finalize git cutover, update README + env docs
2. **Schedule read-view polish**: planner card colour coding by subject/class, print-friendly view (post-Phase 7)
3. **Service worker**: static asset caching only (post-Phase 7 optimization)

## Recommended target stack

- React Router v7 Framework Mode
- Vite-based React Router app scaffold
- React Router v7 built-in SSR enabled as default rendering strategy
- React 19
- Mantine 8.3.x stable line
- Zustand retained for client-side UI state
- PostgreSQL running locally, preferably via Docker Compose for consistent onboarding
- Prisma Client + Prisma Migrate for schema and data access
- custom cookie/session-based auth for credentials login

## Why React Router Framework Mode

React Router officially recommends Framework Mode for teams migrating from Next.js, and it is the closest fit for this repo because it gives you:

- nested route modules instead of Next layouts
- loaders and actions instead of server actions and API route glue
- fetcher-based forms and pending states
- built-in SSR support without forcing you into Next.js conventions
- a clean path for protected routes, error boundaries, code splitting, and route-level data loading

Declarative mode would push too much work back onto the app because this project already depends on server-oriented routing patterns. Data mode is viable, but Framework Mode is the better default unless you explicitly want to build your own server abstractions.

## Current repo findings

### Framework coupling

- The app uses App Router layouts, route groups, dynamic segments, and middleware.
- There are roughly 29 `"use server"` actions that currently handle both mutations and server-side reads.
- `next/navigation`, `next/link`, `next-auth`, and `next-intl` are spread across the route tree and shared components.

### Auth coupling

Current auth is not portable as-is.

Relevant files:

- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/[...nextauth]/getAuth.ts`
- `app/[locale]/SessionWrapper.tsx`
- `components/HeaderSearch.tsx`
- `components/CreateTenancyLogic.tsx`

Current auth behavior:

- credentials-based login
- JWT session strategy
- custom session payload with `userId`, `email`, `name`, and `tenancyId`
- tenancy-aware authorization checks in server code
- client components reading auth state via `useSession`

Important caveat:

- Auth.js is framework-agnostic at the core level, but there is no official React Router integration package. The current implementation uses the Next.js-specific surface of NextAuth. Trying to preserve this exact model inside React Router would add adapter work with little payoff.

### I18n coupling

Relevant files:

- `middleware.ts`
- `lib/i18n/routing.ts`
- `lib/i18n/navigation.ts`
- `lib/i18n/request.ts`
- `app/[locale]/layout.tsx`
- `components/LocaleSwitcher.tsx`
- `messages/en.json`
- `messages/hu.json`

Current i18n behavior:

- locale-prefixed URLs
- middleware-driven locale handling
- server and client translation helpers from `next-intl`
- JSON message catalogs that are reusable

### Database coupling

Relevant files:

- `lib/database/db.ts`
- `lib/database/db-instance.ts`
- `lib/getTenancyBasedData.ts`
- `lib/getUserRole.ts`
- many `app/**/_actions/*.ts` files

Current database behavior:

- Oracle-only driver via `oracledb`
- raw SQL concentrated inside `DatabaseService`
- the database layer imports auth directly and derives tenancy from session state
- business logic is partially hidden inside DB methods and partially spread across server actions

This is the highest-risk migration area. The Oracle replacement is not a connection-string change. It is a schema, query, and architecture rewrite.

### UI library status

Mantine is already in use and should remain.

Current package versions are mixed inside the 8.x line:

- `@mantine/core` 8.1.3
- `@mantine/form` 8.1.3
- `@mantine/hooks` 8.0.0

As of 2026-06-29, the app has been upgraded to Mantine 9.4.1 (the current latest stable). The upgrade was zero-breaking-change for the components in use.

## High-level migration strategy

### Core principle

Do not refactor the existing Next.js app in place.

Instead:

1. create a new React Router v7 app shell
2. migrate reusable components and domain logic into it
3. migrate one feature slice at a time
4. remove the old Next.js app only after the new app is complete

This reduces framework-crossed code, avoids half-Next half-React-Router abstractions, and keeps the end state clean.

### Recommended execution model

Use a vertical-slice migration rather than a layer-only migration.

That means each major slice should eventually include:

- route module
- loader and/or action
- UI component wiring
- auth guard behavior if needed
- Prisma-backed data access
- tests for the slice

## Target architecture

### Rendering strategy (required)

Target rendering model:

- use React Router v7 built-in SSR for initial page render and route transitions that require server data
- keep route `loader` functions as the main source of server data for SSR
- hydrate on the client and continue using loader/action/fetcher data flow after hydration

This is not optional in this migration. SSR should be part of the baseline architecture, not a later optimization.

### Web application

Suggested structure:

```text
app/
  root.tsx
  routes.ts
  routes/
    public-layout.tsx
    protected-layout.tsx
    auth.login.tsx
    auth.logout.tsx
    locale-layout.tsx
    dashboard.tsx
    tenancy.switch.tsx
    entities.*.tsx
    schedules.*.tsx

components/
  ...reused Mantine UI components...

lib/
  auth/
  db/
  i18n/
  services/
  validation/

prisma/
  schema.prisma
  migrations/

store/
  store.ts
```

### Data flow

- route `loader` functions become the primary source for server-backed page data
- route `action` functions replace server actions for form submissions and mutations
- `useFetcher` replaces most of the current non-navigation form/action interactions
- Zustand stays for transient client concerns, not as the authoritative source for server data

### Integrated backend pattern (mandatory)

Treat React Router server route modules as HTTP entry points (controller layer), not as business-logic containers.

- `loader`/`action`/resource route: request parsing, auth guard, response shaping
- service layer: use-case orchestration and tenancy-aware workflows
- domain layer: pure scheduling and tenancy business rules/calculations
- repository layer: Prisma data access and query composition

Rules:

- keep route modules thin
- keep heavy tenancy calculations in domain/services
- keep Node.js-only code in server modules (for example `*.server.ts`)
- design services and domain modules so they can be extracted to Fastify/Express later if needed

### Service worker and caching strategy

A service worker can be used, but it should be introduced carefully in an SSR app.

Recommended scope:

- cache only static assets first (js, css, fonts, images)
- use network-first for SSR HTML/navigation requests
- use stale-while-revalidate for public read-only API GET endpoints, if any are introduced
- never cache authenticated HTML responses or user-specific action responses blindly

Recommended rollout:

1. start with no service worker during core migration
2. enable service worker only after SSR + auth + tenancy flows are stable
3. add caching in small increments with explicit allowlists

Main caveats:

- aggressive document caching can serve stale tenancy/user content
- stale cached route payloads can conflict with server-side auth and role checks
- offline support for authenticated workflows is expensive and should be a separate project decision

Conclusion:

- yes, service worker caching is possible and useful
- in this project it should be treated as a post-migration optimization layer, not a foundation concern

### Auth model

Preferred target:

- credentials login handled by a route action
- password verification still uses `bcryptjs`
- signed cookie session with explicit session helpers
- session contains `userId`, `email`, and active tenancy context
- role/permission resolution happens in loader/action guards, not in client hooks

Important design correction:

- tenancy must no longer live inside a singleton database service instance
- tenancy context should be carried explicitly through session state or per-request service helpers

### Database model

Preferred target:

- PostgreSQL as the only database
- Prisma schema becomes the source of truth
- Prisma Migrate owns schema evolution from day one
- repository/service layer wraps Prisma queries where the scheduling domain gets complex

Do not aim for a 1:1 Oracle emulation unless there is hard data compatibility pressure.

Because the app is not in production, the better option is usually:

- redesign the schema around the real domain model
- keep useful naming and concepts
- drop Oracle-era technical baggage

## Migration phases

## Phase 0: Decision lock and branch setup

Goals:

- stop adding new Next.js-only features
- create a migration branch
- document the target architecture before any code move

Actions:

- confirm React Router v7 Framework Mode as the target
- confirm SSR is required and enabled using React Router v7 built-in solutions
- confirm local PostgreSQL setup method, preferably Docker Compose
- confirm auth approach: custom session auth preferred
- confirm whether any Oracle development data must be preserved
- confirm service worker scope (asset caching only at first)

Deliverables:

- migration branch
- agreed target stack
- data retention decision

## Phase 1: Bootstrap the new React Router application

Goals:

- create a clean application shell that does not depend on Next.js

Actions:

- scaffold a fresh React Router v7 Framework Mode app
- enable React Router SSR baseline and validate first paint from server-rendered HTML
- bring over TypeScript, ESLint, Prettier, Jest, and testing-library setup where still useful
- add Mantine and align all Mantine packages to the same 8.3.x version
- add Zustand unchanged initially
- create root route, error boundary, not-found route, and public/protected layouts
- port global CSS and Mantine provider setup

Deliverables:

- app boots without Next.js
- SSR baseline works in development and production build modes
- Mantine renders correctly
- base route tree exists

## Phase 2: Build the new database foundation

Goals:

- remove Oracle from the critical path
- establish Prisma + PostgreSQL as the backend foundation

Actions:

- add PostgreSQL local development setup
- add `prisma/schema.prisma`
- model the core entities first: users, tenancies, memberships/roles, specialties, subjects, classrooms, teachers, classes, frames, timeslots, schedules, syllabus-related tables
- generate the initial migration
- introduce a small DB access layer around Prisma for complex domain operations

Key caveat:

- Prisma does not support Oracle as an application connector, so there is no direct Oracle-to-Prisma migration path for the current runtime. Any schema carryover has to be manual, SQL-assisted, or ETL-based.

Decision branch:

- if no existing data matters, create a clean Postgres schema from domain rules
- if some development data matters, write one-off import scripts from Oracle exports into Postgres

Deliverables:

- local PostgreSQL database
- first Prisma migration applied
- Prisma Client usable in the new app

## Phase 3: Replace authentication and authorization

Goals:

- remove `next-auth` completely
- preserve the business behavior that matters: credentials login, active tenancy, protected routes, role-aware access

Actions:

- create auth service helpers for login, logout, session read, and route guards
- implement login action with `bcryptjs`
- implement cookie-backed session storage
- add route guard helpers for authenticated and tenancy-required routes
- rework components that currently depend on `useSession`
- re-model how `userRole` is resolved, preferably per request or with explicit caching instead of ad hoc DB access from auth helpers
- enforce thin route-module handlers that call service/domain modules for auth and tenancy logic

Recommended approach:

- do not port NextAuth behavior literally
- do not try to reproduce `SessionProvider` and `useSession` everywhere unless it clearly improves UX
- prefer loader-driven auth and route protection, with a thin client auth context only where necessary

Alternative path:

- if you strongly want to stay near Auth.js, use `@auth/core` behind custom integration glue
- this is not the preferred default for this repo because it adds framework plumbing without reducing migration scope meaningfully

Deliverables:

- login/logout working
- protected routes working
- tenancy-aware session model defined

Current implementation status (2026-03-30):

- implemented custom cookie session helpers in the React Router app
- implemented credentials login service using `bcryptjs`
- implemented route-level auth guards for authenticated and tenancy-required routes
- implemented locale-prefixed `login`, `logout`, and one protected route (`/:locale/app`)
- wired route handlers to service/domain/repository layering (no business logic embedded in route module)

## Phase 4: Replace i18n and route conventions ✅ COMPLETE

Goals:

- preserve localized URLs and message catalogs without Next.js middleware

Actions:

- replace `next-intl` with a framework-agnostic i18n setup
- keep `/en/...` and `/hu/...` URL prefixes
- load locale and message catalog in route loaders
- port locale switcher to React Router navigation APIs
- replace `next-intl` server helpers with route/module helpers

Recommended approach:

- reuse the existing `messages/*.json` files
- keep locale resolution simple and explicit
- do not rebuild middleware-style magic unless there is a strong requirement for automatic locale detection

Deliverables:

- localized routing working ✅
- translation lookup working in both route components and shared UI ✅

Implementation notes:

- packages: `remix-i18next@7.4.2`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-fetch-backend`
- `future.v8_middleware: true` enabled in `react-router.config.ts`
- `app/locales/en/translation.ts` and `app/locales/hu/translation.ts` — bundled translation catalogs
- `app/middleware/i18next.ts` — `createI18nextMiddleware` with URL-path-based locale detection
- `app/routes/api.locales.ts` — resource route at `/api/locales/:lng/:ns` serves translation JSON for client-side hydration
- `app/root.tsx` — exports middleware array, locale loader, and syncs `i18n.changeLanguage` on the client
- `app/entry.server.tsx` — wraps SSR tree with `I18nextProvider`
- `app/entry.client.tsx` — initialises i18next with Fetch backend + HTML-tag language detector
- TypeScript: `DeepString<T>` utility type in `hu/translation.ts` allows different string values while enforcing key parity with `en` catalog

## Phase 5: Port route tree and page shells ✅ COMPLETE

Goals:

- recreate the structural shape of the application inside React Router

Actions:

- map Next layouts to parent routes with `<Outlet />`
- map route groups to layout routes
- map dynamic segments to React Router params
- replace `next/link`, `next/navigation`, `redirect`, and `notFound` patterns
- replace `next/font/google` with a standard font loading strategy

Key caveat:

- this part is mechanical in some files, but not trivial in aggregate because the current layout tree contains auth, locale, and tenancy assumptions

Deliverables:

- core navigation tree recreated ✅
- protected and public layouts separated cleanly ✅

Implementation notes:

- `app/routes.ts` now uses explicit layout routes under `:locale`:
  - `layout("routes/public-shell.tsx", [...])` for public pages
  - `route("app", "routes/tenancy-layout.tsx", [...])` for protected tenancy area
- New public shell route: `app/routes/public-shell.tsx`
  - locale-aware nav links
  - login/logout links and locale switch links
  - shared `<Outlet />` host for home/login/pricing/documentation pages
- New protected shell route: `app/routes/tenancy-layout.tsx`
  - tenancy guard in parent loader using `requireTenancyUser`
  - shared protected header/nav
  - typed outlet context for child protected routes
- New route modules added:
  - `app/routes/pricing.tsx`
  - `app/routes/documentation.tsx`
  - `app/routes/docs.tsx` (alias redirect to `/documentation`)
- Protected dashboard updated to consume user/locale from protected layout outlet context (`app/routes/protected-dashboard.tsx`)
- Runtime smoke checks verified:
  - `/en`, `/hu`, `/en/pricing`, `/hu/pricing`, `/en/documentation` return 200
  - `/en/docs` redirects to `/en/documentation`
  - `/en/app` redirects to `/en/login` when not authenticated

## Phase 6: Feature slice migration

Current implementation status (2026-06-29):

**Completed slices (real Prisma-backed implementations, tested):**

- tenancy-based nested route structure under `/:locale/my-tenancy/*` with guarded access
- admin entities CRUD: specialty, subject, teacher, classroom, class, frame
  - Prisma repository + service layer at `app/lib/services/tenancy/manageAdminEntities.server.ts`
  - admin forms migrated to Mantine useForm patterns
  - tabbed entity table with row-level edit/delete actions
  - real entity counts from Prisma `findMany().count()` fallback included
- timeslots CRUD: single + template creation/edit/delete
  - Prisma-backed service at `app/lib/services/timeslots/manageTimeslots.server.ts`
  - form validation + error handling
  - time formatting helpers (minutes → HH:MM)
- schedules list/new/edit (full CRUD with validation + redirect on success)
  - Prisma schedule repository at `app/lib/repositories/scheduleRepository.server.ts`
  - schedule service + frame lookup at `app/lib/services/schedules/manageSchedules.server.ts`
  - loader-driven data flow for all three routes
  - form validation and session error tracking
- signup + tenancy onboarding slice
  - two-step flow: `/signup` (user account) → `/onboarding` (create school) → `/switch-tenancy`
  - `signupWithEmailPassword` service with uniqueness check + bcrypt hash
  - `createTenancyForUser` service: auto-slug from school name (`toSlug` + 4-char hex suffix on collision), Prisma transaction creates `Tenancy` + `TenancyMember(OWNER)`
  - `requireOnboardingUser` guard redirects tenancied users away from onboarding; `requireTenancyUser` redirects to `/onboarding` (was 403)
  - tenancy switcher shows all memberships with role badges, current indicator
  - nav updated: "My school" + "Switch school" links; login page links to signup
- schedule planner slice
  - `plannerRepository.server.ts`: `getScheduleWithPlannerData`, `getPlannerEntityOptions`, `getBookedResources` (overlap query), `createTimeslotAndEntry` and `removeScheduleEntry` (both in transactions)
  - `managePlannerEntries.server.ts`: `loadPlannerData`, `addPlannerEntry` (validates day/time), `removePlannerEntry`
  - `api/planner-availability` GET resource route: returns `{ bookedTeacherIds, bookedClassroomIds }` for a given frame/day/time window
  - `WeeklyPlannerGrid`: Mon–Sun sticky header, scrollable body (max 620px), 52px hour axis, absolute-positioned lesson cards, click empty space → open drawer with pre-filled time
  - `LessonCard`: `PX_PER_MIN=1.5`, `DISPLAY_START_MINUTE=360` (6am), progressive disclosure of class/teacher/classroom as card grows, trash `ActionIcon`
  - `AddLessonDrawer`: `useFetcher` for live availability, booked teacher/classroom options disabled+labeled, callback-based `onSubmit(FormData)` (no nested form element), time validation guard
  - `my-tenancy.schedules.view.tsx`: real loader + add/remove entry actions, `frameId` injected into FormData by grid before `addFetcher.submit()`

**Phase 6 complete.** All planned feature slices shipped.

Testing progress (2026-06-29):

- Jest suite: 79 tests passing across 15 test suites, all green
- Coverage: route loaders/actions, service layer, domain logic, components, auth/session, tenancy behavior
- No test failures in admin, schedules, or timeslot workflows

Suggested order:

1. auth screens + root shell + locale switcher
2. dashboard + tenancy selection
3. simple CRUD entities
4. schedule creation and planning flows
5. syllabus and reporting flows
6. static pages such as pricing and documentation

For each slice:

- move route component
- create loader/action pair
- replace Oracle access with Prisma services
- adapt Mantine forms and pending states to `useFetcher` or route actions
- update tests for the slice

## Phase 7: Test hardening and cleanup

Goals:

- remove the old framework and stabilize the new one

Actions:

- delete `next`, `next-auth`, `next-intl`, `oracledb`, `next.config.ts`, `middleware.ts`, `app/api/**`, and other dead framework files
- rewrite test mocks for React Router and the new auth/session layer
- update README and environment documentation
- validate route coverage and auth coverage
- validate schedule planner behavior carefully because it is likely the most stateful and regression-prone area
- validate SSR behavior across protected routes and locale-prefixed routes
- if service worker is enabled, validate cache invalidation and user/session isolation behavior

Deliverables:

- no Next.js dependencies remain
- no Oracle dependencies remain
- README and scripts reflect the new runtime

## Workstream complexity

| Workstream | Complexity | Why |
| --- | --- | --- |
| Router and layouts | High | App Router layouts, route groups, redirects, and dynamic segments are everywhere |
| Auth and authorization | High | NextAuth is Next-specific here and tenancy is embedded into auth flows |
| I18n | Medium | JSON catalogs are reusable, but locale middleware and navigation helpers are not |
| Mantine upgrade | Low to Medium | The app is already on Mantine 8, but packages should be aligned to latest stable 8.3.x |
| Oracle to Postgres + Prisma | Very high | This is a database and service-layer rewrite, not a driver swap |
| Scheduling features | Very high | Rich state, domain rules, and data dependencies make this the hardest feature area |

## Major caveats and traps

### 1. This is effectively a rewrite

If you approach this as a package replacement exercise, the migration will get stuck in framework glue. The right mental model is: new app shell, then controlled domain migration.

### 2. Do not keep tenancy in a singleton DB service

The current Oracle service pulls tenancy from auth and stores it in process state. That is fragile even now and should not survive into the new architecture.

### 3. Keep Mantine on the stable 9.x line

Mantine was upgraded to 9.4.1 (2026-06-29) with zero breaking changes. Track the 9.x stable releases; do not chase a major version bump during Phase 7 cleanup work.

### 4. Do not overuse Zustand for server-backed state

React Router loaders and actions are a better source of truth for data that originates from the database. Zustand should remain for client-side orchestration, UI preferences, and temporary interaction state.

### 5. The auth rewrite should simplify the system

The current app uses credentials auth and tenancy-aware sessions. That is straightforward enough to implement directly with Prisma and cookie sessions. Rebuilding a NextAuth-like abstraction is likely unnecessary complexity.

### 6. Database migration scope can dominate the project

If you do not decide early whether Oracle data must be preserved, the migration will drift. Lock this decision in Phase 0.

### 7. Schedule flows should not be the first slice

They are too coupled and stateful. Port a simpler authenticated CRUD slice first and use it as the template for the rest of the app.

## Decisions to lock early

- React Router Framework Mode: yes or no
- SSR with React Router built-in solutions: required yes/no
- local PostgreSQL setup: Docker Compose or local machine installation
- auth strategy: custom session auth or custom Auth.js core integration
- i18n strategy: lightweight custom dictionary layer or a new framework-agnostic i18n library
- Oracle data retention: discard, partially migrate, or fully migrate
- service worker scope: disable initially or enable for static assets only

## Decision lock outcomes (confirmed)

These decisions are now accepted and should be treated as fixed constraints for implementation:

1. SSR with React Router v7 built-in solutions: required ✅ implemented
2. Auth approach: custom cookie/session auth ✅ implemented
3. Data retention: Oracle data can be dropped (no migration/import required) ✅ accepted
4. Service worker initial scope: static assets only ✅ deferred to post-migration
5. Backend architecture: integrated backend with thin loaders/actions plus service/domain/repository layering ✅ implemented across admin/schedules/timeslots slices

Phase impact:

- Phase 0 decision lock: complete
- Phase 1–5 (bootstrap, i18n, routing, auth, core pages): complete
- Phase 6 (feature slices): ✅ Complete (admin, timeslots, schedules CRUD, signup/onboarding, planner + conflict engine, syllabus management — all shipped)
- Phase 7 (cleanup): not started

Phase 6 is done. Next priority: Phase 7 cleanup (remove old Next.js app, git cutover, README/env docs).

## Recommended first implementation milestone

The first real milestone should not be feature parity. It should be a thin but complete reference path:

1. fresh React Router v7 app booting
2. Mantine 8.3.x aligned and rendering
3. PostgreSQL + Prisma initialized
4. login/logout implemented
5. locale-prefixed routing working
6. one route proving loader -> service -> domain -> repository data flow
7. one protected CRUD slice working end-to-end

Once that exists, the rest of the migration becomes repetitive engineering instead of architecture discovery.

## Repository structure during migration

**Two apps coexist; the new app is a nested git repo:**

- **Root `/scheduler-app`**: old Next.js 15 app (tracked by root `.git`). Contains:
  - `app/` (Next.js route tree, still has old pages + layouts)
  - `components/` (Mantine UI components, mostly shared between old and new)
  - `lib/` (database service, i18n helpers, hooks, validation logic — partially migrated)
  - `store/` (Zustand store)
  - `.env.local`, `node_modules/`, `.next/build/` (runtime artifacts)
  - **Untracked secrets (gitignored)**: `app/wallet/` (Oracle wallet), `githubActionSshKey`, `.env*`

- **`/react-router-v7-app/`**: new React Router v7 app (its own `.git` repo, shows as `?? react-router-v7-app/` in root git status)
  - `app/` (RR7 route modules, entry.server.tsx, entry.client.tsx)
  - `app/lib/` (services, repositories, domain logic, auth helpers)
  - `app/routes/` (all route components)
  - `prisma/` (Prisma schema + migrations)
  - `tests/` (Jest test suite)
  - `Dockerfile` + `docker-compose.postgres.yml` (local Postgres setup)
  - `package.json` with RR7 7.13.2, Mantine 8.3.18, Prisma 7.6.0

**Important**: the nested repo structure is intentional for now (keeps git histories separate during development). The eventual cutover (move new app to root, retire old app, merge git history) is a future decision — do not restructure git without explicit direction.

**Stale items removed (2026-06-29)**:
- `components/forms/CreateClass.tsx.new` (empty 0-byte stray)
- `react-router-v7-app/app/welcome/` (default create-react-router scaffold, unused)

## Suggested next deep-dive topics

- Syllabus management UI: list/create/edit under `/:locale/my-tenancy/syllabus`, backed by `SyllabusItem` Prisma model
- Schedule read-view polish: colour coding by subject, print-friendly static view, export to PDF/image
- Phase 7 cleanup checklist: git cutover, old-app deletion, README/env docs, final validation
- Service worker caching strategy (post-migration optimization)