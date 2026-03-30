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

As of 2026-03-30, the latest stable Mantine release line is 8.3.x, with 8.3.18 marked as the latest release. Mantine 9 is still alpha and should not be adopted as part of this migration.

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

## Phase 4: Replace i18n and route conventions

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

- localized routing working
- translation lookup working in both route components and shared UI

## Phase 5: Port route tree and page shells

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

- core navigation tree recreated
- protected and public layouts separated cleanly

## Phase 6: Feature slice migration

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

### 3. Do not chase Mantine 9 during this migration

Mantine 9 is still alpha as of 2026-03-30. This migration already changes router, auth, and database layers. Keep Mantine on the latest stable 8.3.x line and re-evaluate 9.x later.

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

1. SSR with React Router v7 built-in solutions: required
2. Auth approach: custom cookie/session auth
3. Data retention: Oracle data can be dropped (no migration/import required)
4. Service worker initial scope: static assets only

Phase impact:

- Phase 0 decision lock is complete.
- Implementation should proceed directly to Phase 1 bootstrap.

## Recommended first implementation milestone

The first real milestone should not be feature parity. It should be a thin but complete reference path:

1. fresh React Router v7 app booting
2. Mantine 8.3.x aligned and rendering
3. PostgreSQL + Prisma initialized
4. login/logout implemented
5. locale-prefixed routing working
6. one protected CRUD slice working end-to-end

Once that exists, the rest of the migration becomes repetitive engineering instead of architecture discovery.

## Suggested next deep-dive topics

- target Prisma schema design for the scheduling domain
- concrete auth/session design for tenancy-aware credentials login
- mapping the current Next route tree to React Router route modules
- replacing server actions with loader/action/fetcher patterns in forms
- defining which data should stay in Zustand and which should move to loaders