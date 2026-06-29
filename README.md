# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Database (Phase 2 foundation)

This app now includes a local PostgreSQL + Prisma baseline.

### Local Postgres via Docker Compose

Start database:

```bash
npm run db:start
```

Stop database:

```bash
npm run db:stop
```

Connection string is read from `.env`:

```bash
DATABASE_URL="postgresql://postgres:prisma@localhost:5432/scheduler_app?schema=public"
```

### Prisma commands

Generate Prisma client:

```bash
npm run db:generate
```

Create/apply migrations:

```bash
npm run db:migrate -- --name init_foundation
```

Open Prisma Studio:

```bash
npm run db:studio
```

## Integrated backend architecture

This app intentionally uses an integrated backend pattern inside the React Router project:

- route modules (`loader`/`action`): thin request handlers
- service layer: use-case orchestration
- domain layer: pure business calculations
- repository layer: Prisma queries

Current example flow:

- [home route loader](app/routes/home.tsx)
- [tenancy service](app/lib/services/tenancy/getTenancyOverview.server.ts)
- [tenancy domain calculator](app/lib/domain/tenancy/calculateTenancyOverview.ts)
- [tenancy repository](app/lib/repositories/tenancyRepository.server.ts)

This keeps backend logic modular now and makes future extraction to a standalone Fastify/Express API straightforward.

## Authentication (Phase 3)

Phase 3 introduces custom cookie/session authentication with bcrypt password verification.

Auth routes:

- [login](app/routes/login.tsx)
- [logout](app/routes/logout.tsx)
- [protected dashboard](app/routes/protected-dashboard.tsx)

Auth backend layering example:

- [session cookie helpers](app/lib/auth/session.server.ts)
- [auth service](app/lib/services/auth/login.server.ts)
- [auth guard service](app/lib/services/auth/guards.server.ts)
- [auth domain helper](app/lib/domain/auth/selectActiveMembership.ts)
- [auth repository](app/lib/repositories/userAuthRepository.server.ts)

Development bootstrap behavior:

- if `AUTH_BOOTSTRAP_ENABLED=true` and the user table is empty, the app auto-creates a bootstrap owner user on first login attempt
- default bootstrap credentials are configured in `.env` and should be changed for real environments

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
