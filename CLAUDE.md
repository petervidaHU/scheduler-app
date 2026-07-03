# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a React Router v7 full-stack application for managing class schedules. The project is in an active migration from Next.js to React Router v7, with two applications coexisting: the old Next.js app at the root and the new React Router app as a nested git repository (at `/react-router-v7-app/`). Phase 6 (feature slices) is mostly complete; Phase 7 cleanup (removing old Next.js app) is not yet started.

The new app is located in the primary working directory and is a self-contained React Router application.

## Development Setup

### Initial Setup
```bash
npm install
npm run db:start
npm run db:migrate
```

### Common Commands

**Development & Building:**
- `npm run dev` — Start development server with HMR (http://localhost:5173)
- `npm run build` — Create production build
- `npm run start` — Run built application
- `npm run typecheck` — Run TypeScript type checking with `tsc` and generate types

**Testing:**
- `npm test` — Run all Jest tests
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage:components` — Run coverage on specific admin/UI components (80% thresholds defined)
- Run single test file: `npm test -- path/to/file.test.ts`

**Database:**
- `npm run db:start` — Start PostgreSQL in Docker (uses `docker-compose.postgres.yml`)
- `npm run db:stop` — Stop PostgreSQL
- `npm run db:migrate` — Create or apply pending Prisma migrations
- `npm run db:generate` — Regenerate Prisma client (auto-run on schema changes)
- `npm run db:studio` — Open Prisma Studio GUI (http://localhost:5555)

**Configuration:**
- TypeScript path alias `~/*` maps to `./app/*` (defined in `tsconfig.json`)
- Jest configured to run tests from `app/` and `tests/` directories
- Testing environment is Node.js; component tests use `@testing-library/react` and `jest-environment-jsdom`

## Architecture

### Layered Backend Pattern (Inside React Router Routes)

All backend logic uses a strict four-layer architecture within route loaders/actions:

1. **Route layer** (`app/routes/*.tsx`): Thin request handlers; import loaders/actions
2. **Service layer** (`app/lib/services/{domain}/*.server.ts`): Use-case orchestration; calls repositories and domain logic
3. **Domain layer** (`app/lib/domain/{domain}/*.ts`): Pure business calculations (no I/O); stateless utilities
4. **Repository layer** (`app/lib/repositories/*.server.ts`): Prisma queries; data persistence

**Example flow:**
- Route loader: `app/routes/home.tsx` calls `getTenancyOverview()`
- Service: `app/lib/services/tenancy/getTenancyOverview.server.ts` orchestrates the retrieval
- Domain: `app/lib/domain/tenancy/calculateTenancyOverview.ts` performs calculations
- Repository: `app/lib/repositories/tenancyRepository.server.ts` queries via Prisma

This layering is designed for future extraction to a standalone Express/Fastify API backend.

### Directory Structure

- **`app/routes/`** — React Router route modules (loaders, actions, components). Routes use locale prefix (`/en`, `/hu`) via `remix-i18next` middleware.
- **`app/lib/services/{domain}/`** — Service layer; domain-specific use cases (auth, tenancy, schedules, syllabus, timeslots).
- **`app/lib/domain/{domain}/`** — Pure business logic; state-free calculations.
- **`app/lib/repositories/`** — Data access layer; Prisma-based queries.
- **`app/lib/auth/`** — Authentication helpers: session management, guards, bootstrap logic.
- **`app/lib/db/`** — Database connection and Prisma client initialization.
- **`app/components/`** — React components (layouts, forms, admin, planner, locale/color switcher).
- **`app/middleware/`** — i18n middleware and auth guards (called from root loader).
- **`app/store/`** — Zustand stores for client-side UI state.
- **`app/locales/`** — i18n translation files (JSON per language).
- **`prisma/`** — Database schema and migrations.

### Authentication & Authorization

- **Session-based**: Cookie-based sessions (custom, not next-auth). Session contains `userId`, `email`, `tenancyId`, `role`.
- **Guards**: `getOptionalUserSession()` and `requireUserSession()` helpers in `app/lib/auth/session.server.ts`.
- **Tenancy scoping**: Routes check `tenancyId` from session to enforce multi-tenancy isolation.
- **Bootstrap**: If `AUTH_BOOTSTRAP_ENABLED=true` and users table is empty, a bootstrap owner user is auto-created on first login (credentials from `.env`).

### Internationalization

- **i18n framework**: `remix-i18next` + `i18next` + client-side language detection
- **Locale routes**: Prefix routes with locale (`/en/home`, `/hu/home`); middleware handles detection and fallback
- **Translation files**: JSON files in `app/locales/{locale}/` (currently `en`, `hu`)
- **Usage in components**: `useTranslation()` hook from `react-i18next`

### Database & Prisma

- **Provider**: PostgreSQL via Docker Compose for local development
- **Schema location**: `prisma/schema.prisma`
- **Prisma client**: Generated to `generated/prisma/` (gitignored)
- **Key models**: User, Tenancy, TenancyMember, Specialty, Subject, Classroom, Teacher, Class, Frame, Timeslot, Schedule, ScheduleEntry, SyllabusItem, Session
- **Migrations**: Apply with `npm run db:migrate`; schema is source of truth

### UI Framework & Styling

- **Component library**: Mantine v9.4.1 for UI components (buttons, forms, modals, etc.)
- **Styling**: TailwindCSS v4 for utility-first CSS
- **Client state**: Zustand stores for UI state (e.g., `uiStore` for demo clicks)

### Rendering

- **SSR enabled**: React Router v7 Framework Mode with server-side rendering by default
- **Entry points**: `app/entry.server.tsx` (server), `app/entry.client.tsx` (browser)
- **Root**: `app/root.tsx` contains global HTML structure and middleware orchestration
- **Layouts**: Nested layout routes (`locale-layout`, `protected-dashboard`, `my-tenancy-layout`, etc.)

## Key Patterns & Conventions

### Naming

- **Server-only files**: Use `.server.ts` suffix (e.g., `session.server.ts`) to enforce server-only execution
- **Locale files**: Internationalized route names follow pattern `route.locale.tsx` or `locale-layout.tsx`
- **Protected routes**: Require auth guard checks in loaders using `requireUserSession()`
- **API resource routes**: Named `api.{resource}.ts` (e.g., `api.planner-availability.ts`) for data endpoints

### Loader/Action Pattern

- **Loaders**: Fetch data on server; return typed data via `Route.LoaderArgs` and `loaderData`
- **Actions**: Handle form submissions (POST/PUT/DELETE); return redirect or form errors
- **Type safety**: Use `Route` type from `./+types/{routeName}` (auto-generated by React Router)

### Testing

- **Test location**: Co-locate tests near source files using `.test.ts` suffix (e.g., `AdminEntityCard.test.tsx`)
- **Coverage thresholds**: Enforced on admin components and UI utilities (80% branches/functions/lines/statements)
- **Test setup**: `jest.setup.ts` configures test environment; `tsconfig.jest.json` for test TypeScript
- **Testing library**: Use `@testing-library/react` for component tests

### Form Handling

- **Mantine forms**: Use `@mantine/form` hook for form state and validation
- **Server-side validation**: Validate in action handlers; return errors to form
- **Type safety**: Extend form types with TypeScript interfaces

## Environment Variables

See `.env.example`. Key variables:

- `DATABASE_URL` — PostgreSQL connection string (local default: `postgresql://postgres:prisma@localhost:5432/scheduler_app?schema=public`)
- `SESSION_SECRET` — Random string for session signing; replace in production
- `AUTH_BOOTSTRAP_ENABLED` — Enable auto-creation of bootstrap user on first login
- `AUTH_BOOTSTRAP_EMAIL`, `AUTH_BOOTSTRAP_PASSWORD` — Bootstrap user credentials
- `AUTH_BOOTSTRAP_TENANCY_NAME`, `AUTH_BOOTSTRAP_TENANCY_SLUG` — Default tenancy created with bootstrap user

## Migration Status

**Phase 6 (Features)**: ~90% complete
- ✅ Admin entities CRUD (specialty, subject, teacher, classroom, class, frame)
- ✅ Timeslots (single + template)
- ✅ Schedules (list/new/edit/view with planner UI)
- ✅ Signup & tenancy onboarding
- ✅ Schedule planner (WeeklyPlannerGrid, conflict checking, availability API)
- ✅ Syllabus management

**Phase 7 (Cleanup)**: Not started
- Remove old Next.js app
- Promote React Router app to root
- Finalize documentation

## Docker Deployment

The app includes a `Dockerfile` for containerized deployment:

```bash
docker build -t scheduler-app .
docker run -p 3000:3000 -e DATABASE_URL=... scheduler-app
```

Can be deployed to AWS ECS, Google Cloud Run, Azure Container Apps, Fly.io, or Railway.

## Important Notes

- **Two codebases coexist**: Old Next.js app at `/oldapp/` and new React Router app in primary directory. Do not mix them; focus on React Router app.
- **Server-only secrets**: `.env` contains secrets (wallet paths, API keys); gitignored. Do not commit.
- **i18n middleware**: Applied at root level; all routes inherit locale context.
- **Tenancy isolation**: All queries and mutations must respect `tenancyId` from session to enforce multi-tenant safety.
- **Future backend extraction**: Current service/domain/repository split is intentional for eventual separation into standalone API.

## Useful Commands for Development

```bash
# Full local setup
npm install && npm run db:start && npm run db:migrate && npm run dev

# Check for TypeScript errors
npm run typecheck

# Run tests with coverage for a specific component
npm run test:coverage:components

# See database schema in GUI
npm run db:studio

# Rebuild schema types after modifying schema.prisma
npm run db:generate
```

## References

- [React Router v7 Docs](https://reactrouter.com/)
- [Mantine Component Library](https://mantine.dev/)
- [Prisma ORM Docs](https://www.prisma.io/docs/)
- [i18next Documentation](https://www.i18next.com/)
