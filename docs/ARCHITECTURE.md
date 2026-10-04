# Vamsha — Architecture (Phase 1)

## Monorepo layout

```
vamsha/
├── apps/
│   ├── api/            NestJS backend (GraphQL, Neo4j, Redis, JWT auth)
│   └── web/             React + Vite frontend
├── packages/
│   ├── graph-engine/    Framework-independent relationship traversal logic
│   ├── shared-types/    DTOs / types shared between api and web
│   └── ui/               Shared React component primitives
├── docker/               Dockerfiles for api/web
└── docker-compose.yml    Neo4j, Redis, api, web for local dev
```

## Why these choices

- **npm workspaces**, not a heavier monorepo tool (Nx/Turborepo) — Phase 1
  explicitly says "avoid premature complexity." We can add Turborepo later
  if build times become a problem.
- **graph-engine is framework-free** (no NestJS or React imports) so it can
  be unit tested in isolation and reused if we ever build a CLI or a second
  client.
- **Neo4j accessed only through a NestJS `Neo4jModule`** — no other module
  talks to the driver directly. This keeps the door open to swapping the
  driver or adding a repository layer without touching business logic.
- **Auth**: JWT access tokens (short-lived) + refresh token rotation stored
  in Redis, per Section 27 of the plan. Passwords hashed with argon2.
- **GraphQL** via `@nestjs/graphql` in code-first mode (decorators on
  NestJS classes generate the schema) — keeps types and resolvers colocated
  and type-safe, and lets us reuse `shared-types` DTOs.

## Person / Marriage graph model (Phase 1 subset)

Implemented now:

```
(:Person {id, familyId, firstName, lastName, displayName, gender,
           dateOfBirth, dateOfDeath, ...})

(:Person)-[:PARENT_OF]->(:Person)
(:Person)-[:SPOUSE_IN]->(:Marriage)
(:Marriage)-[:CHILD_OF_MARRIAGE]->(:Person)
(:Family)-[:HAS_MEMBER]->(:Person)
(:User)-[:MEMBER_OF {role}]->(:Family)
```

`ADOPTED_PARENT_OF` and `STEP_PARENT_OF` are modeled in the schema but full
UI/UX for them lands in Phase 4.

## Auth & workspace flow (Phase 1 deliverable)

1. User registers (`email`, `password`, `name`) → `User` node created,
   password hashed with argon2.
2. User logs in → access token (15 min) + refresh token (7 days, stored
   hashed in Redis, rotated on use).
2. User creates a `Family` (workspace) → becomes `Owner` via
   `MEMBER_OF {role: OWNER}`.
4. All subsequent mutations require a valid access token *and* a role check
   against the target family (`AuthGuard` + `FamilyRoleGuard`).

## What's deliberately deferred past Phase 1

- Relationship-finder / graph-engine algorithms (Phase 5)
- React Flow canvas & ELK.js layout (Phase 3)
- Photos/S3 (Phase 6)
- GEDCOM import/export (Phase 8)

Phase 1's job is: a user can register, log in, and create a family
workspace, on a foundation (Docker, Neo4j, Redis, NestJS, React, CI-ready
lint/test setup) that the later phases build on without rework.
