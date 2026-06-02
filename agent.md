# AGENT.md

> Onboarding guide for AI agents (and humans) working in `make-my-form-builder`.
> This document is generated from the codebase and reflects the **current** state on disk.

## Table of Contents

1. [Project Overview](#project-overview)
   - [Key Features](#key-features)
   - [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
   - [Core Architecture Patterns](#core-architecture-patterns)
3. [Project Structure](#project-structure)
4. [Key Concepts](#key-concepts)
5. [Common Tasks](#common-tasks)
6. [Code Structure](#code-structure)
7. [Code Consistency](#code-consistency)

---

## Project Overview

`make-my-form-builder` is a **form-building SaaS** monorepo. Users authenticate, build dynamic forms from a row/field JSON schema, publish them on a public or unlisted slug, and collect submissions. The repo contains a public marketing site, an authenticated dashboard, an Express+tRPC API, and a shared service layer that wraps Postgres via Drizzle ORM.

The product surface is small and well-bounded:
- Auth (email + password, email verification, forgot/reset password, logout)
- Form CRUD (title/description → draft → publish)
- Public form rendering by slug (public or unlisted)
- Submissions storage
- A growing template library (TSX code + JSON manifests) in `apps/web/public/templates/`

### Key Features

- **Turborepo + pnpm workspaces** with two deployable apps and five shared packages.
- **End-to-end type safety** via tRPC v11 — the server router type is consumed by the web client.
- **OpenAPI auto-generation** from tRPC routes using `trpc-to-openapi`, mounted at `/api`, with a Scalar reference UI at `/docs`.
- **Cookie-based auth** (`httpOnly`, `sameSite=strict`, `secure` in prod) with JWT signed by `JWT_SECRET`.
- **Drizzle ORM** with Postgres (Docker), schema-validated env (`zod`) on every package.
- **shadcn/ui (new-york)** + Tailwind v4 + Radix primitives + custom fonts (Geist, HelveticaNeue, PPEditorialNew, LaBelleAurore).
- **Server-rendered forms** storing `draft` and `published` JSON payloads with `FormPayload` typing.
- **Submissions** are stored separately in `submission_form` (FK-cascaded from the parent form).
- **96 pre-built templates** organised by category (business, e-commerce, education, event, feedback, healthcare, newsletter, notifications, real-estate, service, technical, travel, user-account, car-rental).
- **Rive animations** and **Motion (Framer Motion successor)** for marketing sections.

### Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2.7, pnpm 9 workspaces |
| Language | TypeScript 5.9 (Node ≥ 18) |
| Frontend | Next.js 16.1 (App Router), React 19.2, Tailwind v4, Radix UI, `@base-ui/react` |
| UI Kit | shadcn/ui (new-york), Lucide icons, cmdk, sonner, vaul, embla, recharts, react-day-picker |
| Forms (client) | react-hook-form + `@hookform/resolvers` + zod v4 |
| Animation | `motion`, `@rive-app/react-canvas` |
| API runtime | Node + Express 5, `tsup` for build, `tsx` for dev |
| RPC | tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) + TanStack Query v5 |
| API docs | `trpc-to-openapi` + `@scalar/express-api-reference` |
| Database | PostgreSQL 15 (Docker), Drizzle ORM 0.45, `drizzle-kit` 0.31 |
| Validation | Zod v4 (input/output models + env schemas) |
| Auth | JWT (`jsonwebtoken`), HMAC-SHA256 password hashing, httpOnly cookies |
| Email | Nodemailer (SMTP), Google OAuth client scaffolded (unused) |
| Logging | Winston (env-aware: dev = pretty, prod = JSON) |
| Lint/Format | ESLint 9 (per-package), Prettier 3 (`printWidth: 100`, double quotes, `trailingComma: "all"`) |

---

## Architecture Overview

The system is split into **three layers** with a clear dependency direction:

```
apps/web  ──►  @repo/trpc/client  ──►  @repo/trpc/server  ──►  @repo/services  ──►  @repo/database
   │                  │                       │                       │                     │
   │                  └─types──────────────┘  └─middleware (auth)     └─EmailService        └─drizzle-orm
   └─React UI, hooks, providers                                          │                     └─Postgres
                                                                         └─@repo/logger
```

- **Web** never touches the database directly; it calls the tRPC client, which goes over HTTP to the API.
- **API** mounts the same tRPC server router at `/trpc` (raw) **and** `/api` (OpenAPI-friendly) and `/docs` (Scalar).
- **Services** (`@repo/services`) own all business logic. Each is a class, instantiated once in `packages/trpc/server/services/index.ts` and re-exported as a singleton (e.g. `userService`, `formService`).
- **Database** exports a `db` Drizzle client plus a re-export of every `drizzle-orm` helper (`eq`, `and`, `or`, `ilike`, `sql`, …) so callers don't need a second import line.
- **Logger** is a single Winston instance; every package imports the same `logger`.

### Core Architecture Patterns

1. **tRPC-first contract.** Every route has:
   - `routes/<feature>/model.ts` → Zod input/output models + inferred types.
   - `routes/<feature>/route.ts` → A `router({...})` of procedures.
   - Each procedure calls `.meta({ openapi: { method, path, tags } })` so the OpenAPI doc is generated automatically.
   - Path strings are produced by `generatePath("/feature")(...)` in `utils/path-generator.ts` to keep names consistent.

2. **Auth middleware pattern.** `packages/trpc/server/trpc.ts` defines a single `isAuthed` middleware that:
   - reads the `authentication-token` cookie via `getAuthenticationCookie(ctx)`,
   - verifies the JWT through `userService.verifyAndDecoderUserToken(...)`,
   - injects `ctx.user` for downstream procedures.
   - Two procedures are exported: `publicProcedure` and `protectedProcedure`.

3. **Cookie context factory.** `createContext` builds three cookie helpers (`createCookie`, `getCookie`, `clearCookie`) from Express's `req`/`res` so procedures can manage cookies without importing Express types. The auth cookie name is centralised in `utils/cookie.ts` as `authentication-token`.

4. **Service layer with Zod re-validation.** Every public service method runs its payload through a Zod schema (`model.ts`) with `.parseAsync(payload)` — this is the second line of defence behind the tRPC input model. Don't skip it.

5. **Form payload schema.** A form is stored as a JSON tree:
   ```ts
   type FormPayload = {
     name: string;
     props?: Record<string, any>;
     rows: {
       id: string;
       props?: Record<string, any>;
       fields: { id: string; type: string; props: Record<string, any> }[];
     }[];
   };
   ```
   The same shape is used for `draft`, `published`, and submissions. Visibility is enum-typed (`public` | `unlisted`) and each form has two slugs (`publicSlug`, `unlistedSlug`) — exactly one is "active" depending on visibility.

6. **Web route groups.** Next.js App Router uses two route groups:
   - `(auth)` — login, registration, forgot-password, reset-password, verify. No session required.
   - `(protected)` — wrapped by `layout.tsx` with an `AuthGuard` client component that calls `useMe()` and redirects to `/login` if no user.
   - The dashboard lives at `app/(protected)/dashboard/page.tsx`.

7. **tRPC client setup.**
   - React tree uses `createTRPCReact<ServerRouter>()` in `apps/web/trpc/client.ts`, wrapped by `GlobalProviders` (TanStack Query + tRPC Provider + Toaster).
   - Server components use `api` / `apiStreaming` from `apps/web/trpc/server.ts` (proxy client).
   - Both share `createTRPCHttpBatchClientClient` which sends `credentials: "include"` so cookies cross origins.

8. **Env validation, every package.** Each package that touches the environment exports a Zod-validated `env` object (`packages/database/env.ts`, `packages/services/env.ts`, `apps/api/src/env.ts`, `apps/web/env.js` via `@t3-oss/env-nextjs`). Web uses `SKIP_ENV_VALIDATION` for Docker builds.

9. **Winston logger, dev vs prod.** `packages/logger/index.ts` reads `LOGGER_LEVEL` (or falls back to `debug` in dev, `error` in prod) and switches between a colorised pretty format and JSON.

10. **Templates as static assets.** Templates live in `apps/web/public/templates/code/*.tsx` and `apps/web/public/templates/*.json` (category manifests). They are static — not imported into the bundle — and consumed at runtime.

---

## Project Structure

```
form-builder/
├── apps/
│   ├── api/                       # Express + tRPC server (tsup build)
│   │   └── src/
│   │       ├── index.ts           # http.createServer bootstrap
│   │       ├── server.ts          # Express app, /trpc, /api, /docs mounts
│   │       └── env.ts             # zod-validated API env
│   └── web/                       # Next.js 16 (App Router)
│       ├── app/
│       │   ├── (auth)/            # login, register, verify, forgot/reset password
│       │   ├── (protected)/       # guarded by AuthGuard
│       │   │   ├── layout.tsx
│       │   │   └── dashboard/page.tsx
│       │   ├── fonts/             # local woff/woff2 (Geist, HelveticaNeue, PPEditorialNew, LaBelleAurore)
│       │   ├── globals.css
│       │   ├── layout.tsx         # root <html>, font vars, GlobalProviders
│       │   └── page.tsx           # marketing home (Header + Homepage + Footer)
│       ├── components/
│       │   ├── auth/              # login, sign-up, forgot/reset forms
│       │   ├── layout/app-sidebar.tsx
│       │   ├── sections/          # marketing sections (Header, Footer, Features, …)
│       │   └── ui/                # shadcn/ui primitives (accordion → tooltip)
│       ├── constants/Navigation.ts
│       ├── hooks/
│       │   ├── api/auth/index.ts  # useSignUp, useSignIn, useMe, useForgotPassword, …
│       │   ├── use-as-ref.ts
│       │   ├── use-lazy-ref.ts
│       │   └── use-mobile.ts
│       ├── lib/utils.ts           # cn() helper (clsx + tailwind-merge)
│       ├── providers/global.tsx   # QueryClient + tRPC Provider + Toaster
│       ├── public/
│       │   ├── assets/            # jpg, png
│       │   ├── company/           # logo webp (cocacola, mercedes, redbull, …)
│       │   ├── riv/               # Rive animations (.riv)
│       │   └── templates/
│       │       ├── code/*.tsx     # 96 form templates
│       │       └── *.json         # category manifests
│       ├── trpc/
│       │   ├── client.ts          # createTRPCReact<ServerRouter>()
│       │   ├── create-client.ts   # http link factory (with credentials: include)
│       │   └── server.ts          # proxy clients (api, apiStreaming)
│       ├── env.js                 # @t3-oss/env-nextjs
│       ├── next.config.js
│       ├── components.json        # shadcn config (new-york)
│       ├── eslint.config.js
│       ├── postcss.config.mjs     # @tailwindcss/postcss
│       └── package.json
├── packages/
│   ├── database/                  # Drizzle ORM + Postgres
│   │   ├── models/
│   │   │   ├── user.ts            # usersTable, passwordResetTokensTable
│   │   │   └── form.ts            # formTable, submissionFormTable, FormPayload, visibilityEnum
│   │   ├── schema.ts              # re-exports models
│   │   ├── drizzle.config.ts
│   │   ├── env.ts
│   │   └── index.ts               # db = drizzle(env.DATABASE_URL), re-exports drizzle-orm helpers
│   ├── eslint-config/             # base.js, next.js, react-internal.js
│   ├── logger/                    # Winston
│   │   ├── env.ts
│   │   └── index.ts
│   ├── services/                  # Business logic (class-based)
│   │   ├── clients/
│   │   │   ├── google-oauth.ts    # scaffolded, unused
│   │   │   └── nodemailer.ts      # SMTP transport
│   │   ├── email/index.ts         # EmailService (verification + reset)
│   │   ├── user/
│   │   │   ├── index.ts           # UserService class
│   │   │   └── model.ts           # Zod input models + types
│   │   ├── form/
│   │   │   ├── index.ts           # FormService class
│   │   │   └── model.ts
│   │   ├── env.ts                 # JWT_SECRET, BASE_URL, SMTP_*
│   │   └── package.json
│   ├── trpc/                      # Shared tRPC server + client types
│   │   ├── server/
│   │   │   ├── index.ts           # serverRouter (health, auth, form)
│   │   │   ├── trpc.ts            # initTRPC + isAuthed middleware
│   │   │   ├── context.ts         # createContext (cookie factories)
│   │   │   ├── schema.ts          # zodUndefinedModel
│   │   │   ├── routes/
│   │   │   │   ├── auth/{route.ts, model.ts}
│   │   │   │   ├── form/{route.ts, model.ts}
│   │   │   │   └── health/route.ts
│   │   │   ├── services/index.ts  # singletons: userService, formService
│   │   │   └── utils/{cookie.ts, path-generator.ts}
│   │   └── client/index.ts        # re-exports ServerRouter types + @trpc/client
│   └── typescript-config/         # base.json, nextjs.json, node.json
├── docker-compose.yml             # postgresdb:15 on :5432
├── turbo.json                     # build/lint/check-types/dev/db:* tasks
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── prettier.config.js
├── setup.sh
└── package.json                   # name: "make-my-form-builder"
```

---

## Key Concepts

- **`serverRouter`** — the single root tRPC router. Adding a new feature means: create `routes/<feature>/{route.ts, model.ts}`, register it in `packages/trpc/server/index.ts`, and (if business logic is non-trivial) add a `Service` class in `packages/services/<feature>/`.
- **`ServerRouter` type** — `typeof serverRouter`. Re-exported via `@repo/trpc/client` so the web app gets full inference (`RouterInputs`/`RouterOutputs`).
- **`FormPayload`** — the JSON contract for a form. `name` (string), `rows[]` with `fields[]`. Used identically for `draft`, `published`, and `submission`.
- **Visibility & slugs** — every form has `publicSlug` and `unlistedSlug`. `visibility: "public"` makes the `publicSlug` active, `visibility: "unlisted"` makes the `unlistedSlug` active. `showTheFormBySlug` checks both, then enforces the active one for the chosen visibility.
- **`isExpiry`** — timestamp; submissions are blocked once it passes (`FORM_EXPIRED`).
- **`isDeleted`** — soft-delete flag on `formTable`.
- **Authentication cookie** — name: `authentication-token`. Set by `setAuthenticationCookie`, read by `getAuthenticationCookie`, cleared by `clearAuthenticationCookie`. `httpOnly`, `secure` in prod, `sameSite: "strict"`, `maxAge` = 1 year.
- **Env precedence** — `LOGGER_LEVEL` overrides the dev/prod default. `JWT_SECRET` is required by services. `BASE_URL` is used in email links and as the OpenAPI `baseUrl`. `NEXT_PUBLIC_API_URL` (web) overrides the default `/trpc` path.
- **Drizzle migration flow** — `pnpm db:generate` → `pnpm db:migrate` → `pnpm --filter @repo/database dev` (Drizzle Studio).

---

## Common Tasks

> All commands are run from the repo root unless noted. `dotenv --` is wired in `package.json` scripts so `.env` files are loaded automatically.

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Start Postgres | `docker compose up -d` (then `setup.sh` if first time) |
| Run everything in dev | `pnpm dev` |
| Run only the API | `pnpm dev --filter=@repo/api` (port 8000) |
| Run only the web app | `pnpm dev --filter=web` (port 3000) |
| Generate Drizzle migrations | `pnpm db:generate` |
| Apply migrations | `pnpm db:migrate` |
| Open Drizzle Studio | `pnpm dev --filter=@repo/database` |
| Build all | `pnpm build` |
| Lint all | `pnpm lint` |
| Type-check all | `pnpm check-types` |
| Format | `pnpm format` |
| View API docs (after `pnpm dev --filter=@repo/api`) | http://localhost:8000/docs |
| View OpenAPI JSON | http://localhost:8000/openapi.json |

### Adding a new tRPC route

1. Create `packages/trpc/server/routes/<feature>/model.ts` with Zod `*InputModel` / `*OutputModel` and inferred `*InputType` / `*OutputType` if you need them inside the service.
2. Create `routes/<feature>/route.ts`:
   ```ts
   import { publicProcedure, protectedProcedure, router } from "../../trpc";
   import { generatePath } from "../../utils/path-generator";
   import { <feature>Service } from "../../services";
   import { xInputModel, xOutputModel } from "./model";
   ```
3. Register the router in `packages/trpc/server/index.ts`.
4. If a service is needed, add `packages/services/<feature>/{index.ts, model.ts}` and a singleton in `packages/trpc/server/services/index.ts`.
5. Add OpenAPI metadata via `.meta({ openapi: { method, path, tags } })` and use `generatePath("/feature")(...)`.

### Adding a database table

1. Add the table to `packages/database/models/<name>.ts` (Drizzle pgTable, snake_case columns).
2. Re-export from `schema.ts`.
3. `pnpm db:generate` to produce a migration in `packages/database/drizzle/`.
4. `pnpm db:migrate` to apply it.

### Adding a protected page

1. Create `apps/web/app/(protected)/<page>/page.tsx`.
2. The `AuthGuard` in `app/(protected)/layout.tsx` will redirect to `/login` if the user has no session.
3. Read the current user with `useMe()` from `~/hooks/api/auth`.

### Adding a shadcn component

`components.json` is already configured (new-york, lucide icons, `~/components/ui` alias). Add via the shadcn CLI as usual — components land in `apps/web/components/ui/`.

---

## Code Structure

### Import & module conventions

- **Workspace imports** are typed as bare specifiers: `import { db } from "@repo/database"`, `import { logger } from "@repo/logger"`, etc. Do not use deep relative paths across packages.
- **Within an app**, use the `~/*` alias (configured in `apps/web/tsconfig.json`) for absolute imports from the project root.
- **`@repo/database` re-exports all `drizzle-orm` helpers** so a single import line is enough: `import { db, eq, and, or, ilike, sql, desc, isNotNull } from "@repo/database"`.
- **Zod** is the single source of truth for input/output types in tRPC routes. Service methods re-parse with the service-level Zod schema — do not skip this.
- **Logger** is imported as `import { logger } from "@repo/logger"` and called with structured meta: `logger.info("msg", { key: value })`.
- **Env** is imported from the package's own `env.ts` (e.g. `import { env } from "../env"` inside a service, `import { env } from "./env"` in the API). Do not read `process.env` directly outside env files.

### File naming

- **React components** are PascalCase in `components/<area>/` (e.g. `Login-form.tsx`, `app-sidebar.tsx` — note: the auth folder mixes cases intentionally; the rest of the repo is consistent PascalCase for new code).
- **Hooks** are camelCase starting with `use…` (`use-as-ref.ts`, `use-mobile.ts`).
- **tRPC route files** are always `route.ts` paired with `model.ts`.
- **Database models** are singular nouns (`user.ts`, `form.ts`).
- **Services** are class-based, suffixed with `Service` (`UserService`, `FormService`, `EmailService`).

### Layer boundaries

| Layer | Allowed to import | Forbidden from importing |
|---|---|---|
| `apps/web` | `@repo/trpc/client`, `@repo/trpc/server` (types only), own components/hooks | `@repo/database`, `@repo/services` directly |
| `apps/api` | `@repo/trpc/server`, `@repo/logger`, Express | React, Next.js, web components |
| `packages/trpc/server` | `@repo/services`, `@repo/database` (types), `@repo/logger` | UI, Express (only inside `context.ts`) |
| `packages/services` | `@repo/database`, `@repo/logger` | tRPC, web, api |
| `packages/database` | `drizzle-orm`, `pg`, `dotenv`, `zod` | Everything else |
| `packages/logger` | `winston`, `zod` | Everything else |

### Route handler shape

Every tRPC procedure follows this template:

```ts
publicProcedure                // or protectedProcedure
  .meta({ openapi: { method: "POST", path: getPath("/x"), tags: TAGS } })
  .input(xInputModel)
  .output(xOutputModel)
  .mutation(async ({ input, ctx }) => { ... });
```

`ctx` is the tRPC context built in `createContext` — it always has `createCookie`, `getCookie`, `clearCookie`, and (for `protectedProcedure`) `user`.

---

## Code Consistency

These are the rules the codebase already follows. New code must match.

1. **TypeScript strictness.** `strict: true` is implicit via `typescript-config/base.json`. Prefer `z.infer<typeof xModel>` over hand-written types.
2. **No `any` leaks.** The codebase uses `Record<string, any>` and `Record<string, unknown>` deliberately for `FormPayload` JSON columns. New JSON-typed fields should mirror this style (`jsonb("...").$type<MyShape>()`).
3. **Double quotes + semicolons + trailing commas + 100-col.** Enforced by `prettier.config.js`. `jsxSingleQuote: false`, `arrowParens: "always"`.
4. **ESLint `max-warnings 0`** in `apps/web` — zero-warning policy.
5. **Service methods always `.parseAsync(payload)`** before touching the database. Don't trust upstream Zod alone.
6. **Soft delete + visibility checks** are mandatory for any `formTable` SELECT. Mirror the predicates in `FormService.showTheFormBySlug` (`isDeleted = false`, visibility/slug match, `isExpiry` not passed).
7. **Auth cookie name is centralised.** Always use `setAuthenticationCookie` / `getAuthenticationCookie` / `clearAuthenticationCookie` from `utils/cookie.ts`. Do not call `res.cookie("authentication-token", ...)` directly.
8. **OpenAPI metadata is required on every procedure.** Use `generatePath("/feature")(...)` to keep paths consistent; the resulting doc powers both `/api` and `/docs`.
9. **Singleton services.** Always import `userService` / `formService` from `packages/trpc/server/services`. Never `new UserService()` in a route.
10. **Env is validated at module load.** Throwing from `env.ts` is the intended fail-fast behaviour — never wrap it in a try/catch.
11. **Logger, not `console.log`.** Use `logger.info|debug|error` with structured meta. In production, output is JSON; don't pretty-print in app code.
12. **Tailwind v4 with CSS variables** (shadcn new-york). Use `cn(...)` from `~/lib/utils` to compose classes — never template-stringify Tailwind classes.
13. **Route groups `(auth)` and `(protected)`** are the only places that should use `useMe()` and the auth-guard pattern. Public marketing pages must not call auth procedures.
14. **Client → server tRPC** goes through `~/trpc/client` (React) or `~/trpc/server` (proxy) — both use `createTRPCHttpBatchClientClient` so cookies are always sent.
15. **Templates are static assets.** Adding a template means a new `.tsx` in `apps/web/public/templates/code/` and an entry in the relevant category JSON manifest. Do not import templates into the bundle.
16. **DRY for table queries.** Repeated `db.select().from(xTable).where(...)` patterns should be lifted into a private method on the service (see `UserService.getUserByEmail` / `getUserById`).
17. **Naming parity between input models and service methods.** A procedure `storeFormTitleAndDesriptionIntoDb` should call `formService.storeFormTitleAndDesriptionIntoDb` with a payload typed as `storeFormTitleAndDesriptionIntoDbInputType`. The Zod schema in `services/<feature>/model.ts` carries the same name.
18. **CORS is dev-permissive, prod-strict.** The API allows `origin: "*"` in dev and `origin: env.BASE_URL, credentials: true` in prod. Mirror this when adding new middlewares.
19. **Migrations live in `packages/database/drizzle/`.** Never edit generated SQL by hand — regenerate via `pnpm db:generate`.
20. **No comments unless they document a non-obvious decision.** Pre-existing comments in this codebase are sparse and intentional; new code should follow the same style (no banner comments, no obvious JSDoc).

---

_Last regenerated from the working tree at the path indicated by this file. If the repo shape changes, regenerate this file._
