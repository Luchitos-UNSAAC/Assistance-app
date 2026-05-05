# AGENTS — Guidance for AI coding agents

Checklist for this task
- [ ] Understand high-level architecture (Next.js app-router, Prisma, Zustand)
- [ ] Use repo-specific commands and infra to run locally (pnpm, Prisma, dev-tools)
- [ ] Follow project conventions (file layout, API versioning, auth patterns)
- [ ] Reference concrete files/examples to make safe edits

What this project is (big picture)
- Next.js 14 app using the App Router (app/). UI is TypeScript + React + Tailwind + shadcn/Radix components.
- Server-side database layer: Prisma (prisma/schema.prisma) with Postgres (DATABASE_URL).
- Client state: Zustand mock stores live in `lib/store.ts` (used for client-only prototyping).
- The codebase mixes API routes (app/(root)/api/v2/*) that call `lib/*` helpers and Prisma for persistence.

Quick start / developer workflows (commands)
- Install deps: pnpm install (README uses pnpm; package.json scripts are standard npm scripts)
- Dev server: pnpm dev (runs `next dev`)
- Build: pnpm build → runs `prisma generate && next build` (see `package.json`)
- Start production: pnpm start (runs `next start`)
- Prisma: pnpm prisma generate after schema changes; pnpm prisma migrate dev --name <name> to run migrations
- Seed DB: node ./prisma/scripts/seed.js
- Local infra (Postgres) helper: dev-tools/assistance-infra — run `cd dev-tools/assistance-infra && docker compose up -d`

Environment & secrets
- Required env vars appear in README (copy `.env.example` → `.env`).
- JWT secret used in `lib/jwt.ts` (process.env.JWT_SECRET). Do not hardcode secrets in code—use `.env`.
- Database connection in `prisma/schema.prisma` uses `env("DATABASE_URL")`.

Important project-specific patterns and conventions
- App Router conventions: the app/ tree contains route groups with parentheses: e.g. `app/(root)/page.tsx`, `app/(public)/layout.tsx`. Treat parentheses as route grouping used by Next.js.
- API versioning: endpoints live under `app/(root)/api/v2/...`. Prefer adding new REST endpoints under `v2` to match existing pattern.
- Auth flow: endpoints expect a Bearer JWT in Authorization header. See `lib/get-auth.ts` and `lib/jwt.ts`:
  - `lib/jwt.ts` implements generateJWT / verifyJWT using `jose` and process.env.JWT_SECRET.
  - `lib/get-auth.ts` reads the Authorization header and calls `verifyJWT` (throws on missing/invalid token).
- Server vs client code: files under `app/...` route handlers are server code (e.g. `route.tsx`). Client UI components are under `components/` and `components/ui/`.
- Local prototyping: `lib/store.ts` contains mock data and Zustand client stores used across UI. When implementing features that require persistence, check whether the UI currently uses mock stores or calls API routes → convert carefully.
- Prisma client reuse: `lib/prisma.ts` sets a global `prisma` variable to avoid connection proliferation in development. If you change DB usage, reuse `prisma` export to avoid leaks.

API patterns & examples (concrete)
- Example endpoint: GET + POST at `app/(root)/api/v2/volunteers/route.tsx`:
  - GET: calls `getAuthPayload(req)` -> `getVolunteerGroupedToday(payload.email)` -> returns JSON with {attendances, volunteers}
  - POST: validates body fields (name, email, address, dni, phone, birthday, status, day) then calls `addVolunteerV2(payload.email, bodyCreateVolunteer)`
  - Error handling: endpoints wrap logic in try/catch and return NextResponse.json with status codes and messages (401 for invalid/expired token).
- When adding endpoints follow this pattern: validate input early, call `getAuthPayload` for auth, use `NextResponse.json({ data }, { status })`.

Files & directories to inspect first (high value)
- `app/(root)/api/v2/` — API surface and examples
- `lib/jwt.ts`, `lib/get-auth.ts` — authentication behavior
- `lib/prisma.ts`, `prisma/schema.prisma` — DB client and schema
- `lib/store.ts` — client mock stores and common types
- `prisma/scripts/seed.js` — seed data and expected DB shape
- `dev-tools/assistance-infra/` — Docker compose for Postgres/local infra
- `components/` and `components/ui/` — UI patterns (shadcn/Radix wrappers)

Editor/agent behaviors to follow when modifying code
- Do not commit secrets: always read and respect `.env.example` and use env vars.
- Run `pnpm prisma generate` after any schema changes. Build will also run `prisma generate`.
- Prefer small, focused changes: follow existing error handling style (try/catch + NextResponse). Match message shapes used by front-end (e.g. { message: "..." } or { data: ... }).
- When switching UI from mock stores to real DB, update both client usage (lib/store.ts) and API endpoints; ensure types in `lib/store.ts` align with Prisma types in `prisma/schema.prisma`.
- Reuse `lib/prisma.ts` export; do not create new PrismaClient instances in multiple files.

Debugging tips & gotchas
- Prisma logging: `lib/prisma.ts` contains commented example for enabling query logging in development. Use that when you need query traces.
- Server headers: `lib/get-auth.ts` uses `headers()` from `next/headers`. In some contexts (edge vs node) header availability differs — prefer the pattern used in existing endpoints.
- JWT timings: `lib/jwt.ts` uses `process.env.JWT_EXPIRES_IN || "7d"`. Adjust environment to test token expiry behavior.

How agents should propose changes
- Include the minimal set of file edits and a short rationale comment referencing the files above.
- Provide commands to run locally to verify changes (e.g. `pnpm dev`, `pnpm prisma generate`, `node prisma/scripts/seed.js`).
- After changes, run TypeScript checks / lint: `pnpm build` (will run Prisma generate and next build) and `pnpm lint`.

Where to add new features
- UI components: `components/` or `components/ui/` depending on whether it's project-specific or generic UI control.
- Page routes: `app/(root)/...` and follow group segmentation used by existing files.
- API routes: add under `app/(root)/api/v2/` and mirror patterns in existing `route.tsx` files.

Appendix: concrete snippets to copy/reference
- Auth: lib/get-auth.ts and lib/jwt.ts
- Prisma client: lib/prisma.ts
- API example: app/(root)/api/v2/volunteers/route.tsx
- Mock store: lib/store.ts

If you want, I can now:
- create this `AGENTS.md` in the repo (I will do that now), and
- run quick checks (typecheck / npm script) to validate there are no obvious errors after the new file is added.


