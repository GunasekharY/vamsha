# Vamsha Project Understanding

## 1. Purpose of the project

Vamsha is a family-relationship platform designed around a graph model rather than a rigid, tree-only representation. The product idea is not just “who is a parent of whom,” but how people are connected through a network of family, marriage, lineage, and other relationship edges.

The current repository is the Phase 1 foundation scaffold. It includes the key platforms and patterns needed for later phases:

- user registration and login
- authenticated family workspaces
- GraphQL API
- Neo4j graph database access
- Redis for refresh-token storage
- React frontend with protected routes
- shared type/package structure for future extension

This is described in [README.md](README.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 2. High-level architecture

This is a monorepo using npm workspaces:

- [apps/api](../apps/api) — NestJS GraphQL backend
- [apps/web](../apps/web) — React + Vite frontend
- [packages/graph-engine](../packages/graph-engine) — graph relationship logic independent from NestJS/React
- [packages/shared-types](../packages/shared-types) — shared DTOs and type contracts
- [packages/ui](../packages/ui) — shared UI primitives for future reuse

The main project entry is [package.json](../package.json), which defines the workspace structure and root scripts for development, build, testing, and typechecking.

## 3. Tech stack

### Backend

- NestJS
- GraphQL via @nestjs/graphql and Apollo
- Neo4j as the primary graph database
- Redis for token storage and refresh rotation
- JWT authentication
- Argon2 password hashing

### Frontend

- React
- Vite
- TypeScript
- Material UI
- React Router
- TanStack Query for server state
- Zustand for persisted auth state

## 4. What the backend is doing

The core application module in [apps/api/src/app.module.ts](../apps/api/src/app.module.ts) wires together the major services:

- ConfigModule for environment variables
- GraphQLModule with Apollo driver and generated schema file
- ThrottlerModule for rate limiting
- Neo4jModule
- RedisModule
- AuthModule
- FamilyModule
- PersonModule

This means the API is built around a GraphQL-first architecture with domain-specific modules rather than a single large controller layer.

### Auth module

The auth flow is implemented in [apps/api/src/auth/auth.service.ts](../apps/api/src/auth/auth.service.ts) and [apps/api/src/auth/auth.resolver.ts](../apps/api/src/auth/auth.resolver.ts).

The system does the following:

1. User registers with email/password/name.
2. The password is hashed with Argon2.
3. A user node is created in Neo4j.
4. The backend issues:
   - a short-lived access token
   - a longer-lived refresh token
5. The refresh token is hashed and stored in Redis with TTL.
6. On refresh, the old token is invalidated and a new token pair is issued.

Important implementation details:

- The backend avoids leaking whether a user exists or whether the password is wrong.
- Refresh tokens are rotated, not reused.
- Access tokens are validated using JWT guards.
- Redis stores hashed refresh tokens, not raw tokens.

### Family module

The family domain is implemented in [apps/api/src/family/family.service.ts](../apps/api/src/family/family.service.ts) and [apps/api/src/family/family.resolver.ts](../apps/api/src/family/family.resolver.ts).

The idea is that a user is a member of one or more family workspaces, and each family has a role such as OWNER.

When a user creates a family:

- a Family node is created in Neo4j
- the user is linked with [:MEMBER_OF { role: OWNER }]
- the created family is returned with the user’s role attached

A role guard ensures that protected family operations check the user’s role against the target family before allowing mutation.

### Person module

The person domain is set up in [apps/api/src/person/person.module.ts](../apps/api/src/person/person.module.ts). This is the area where actual person records, family membership, and relationship edges are expected to be built out later.

The architecture is deliberately modular so person operations can stay separate from family authorization logic.

## 5. Graph model

The graph model is central to the application. According to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), the Phase 1 subset includes:

- User nodes
- Family nodes
- Person nodes
- Marriage nodes
- Relationship edges such as:
  - PARENT_OF
  - SPOUSE_IN
  - CHILD_OF_MARRIAGE
  - HAS_MEMBER
  - MEMBER_OF

This structure supports a relationship-oriented model rather than a strict binary tree. The representation is suited to modern family graphs and future relationship logic such as cousins, siblings, in-laws, and ancestry queries.

## 6. Neo4j access pattern

All database access goes through [apps/api/src/neo4j/neo4j.service.ts](../apps/api/src/neo4j/neo4j.service.ts).

This is important because:

- business logic does not talk directly to the driver
- database connectivity is centralized
- the driver can be swapped or wrapped later without changing services

This service provides:

- driver initialization on module startup
- session creation for read/write operations
- runRead() and runWrite() helper methods

This pattern keeps persistence concerns isolated.

## 7. Frontend behavior

The web app in [apps/web/src/App.tsx](../apps/web/src/App.tsx) sets up the browser router and protected routes.

The application has routes for:

- /login
- /register
- /families
- /families/:familyId
- /families/:familyId/persons/:personId
- /families/:familyId/persons/:personId/edit

Most of the routes are wrapped in ProtectedRoute, which prevents unauthenticated users from reaching app pages.

### Login and registration flow

The user-facing auth flow is implemented in:

- [apps/web/src/pages/LoginPage.tsx](../apps/web/src/pages/LoginPage.tsx)
- [apps/web/src/pages/RegisterPage.tsx](../apps/web/src/pages/RegisterPage.tsx)
- [apps/web/src/api/auth-api.ts](../apps/web/src/api/auth-api.ts)
- [apps/web/src/store/auth-store.ts](../apps/web/src/store/auth-store.ts)

What happens is:

1. the user submits email/password to the GraphQL auth mutation
2. the API returns accessToken, refreshToken, and user data
3. Zustand persists the session in localStorage
4. the app navigates to /families
5. page reloads keep the user signed in because the session is restored from localStorage

### Family workspace flow

[apps/web/src/pages/FamiliesPage.tsx](../apps/web/src/pages/FamiliesPage.tsx) shows the first meaningful phase-1 workflow:

- fetch all families for the logged-in user
- display them as workspace cards with role badges
- allow creation of a new family workspace
- refresh the list after creation

The API call layer for this is in [apps/web/src/api/family-api.ts](../apps/web/src/api/family-api.ts).

## 8. Shared types and contracts

The package [packages/shared-types/src/index.ts](../packages/shared-types/src/index.ts) centralizes shared DTOs and model shapes used by both the backend and the frontend. This prevents drift between client and server contracts.

This is important for GraphQL fields, auth payloads, family types, and future graph/person entities.

## 9. What is implemented now vs. what is deferred

### Implemented in Phase 1

- user registration and login
- JWT auth and refresh token rotation
- family workspace creation and listing
- protected authenticated routes
- Neo4j + Redis + GraphQL foundation
- app scaffold for future feature development

### Deliberately deferred

- person CRUD flows
- family graph visualization
- relationship-finder logic
- drag-and-drop graph canvas
- photos / storage integration
- import/export features

The architecture doc explicitly says Phase 1 is only the foundation, not the full product experience.

## 10. The real product idea

The app is not just a standard family tree app. It is a relationship graph platform where family connections can exist as nodes and edges, with room for richer logic later:

- direct ancestors/descendants
- cousins
- spouses and marriages
- multi-family linking
- relationship inference across graphs

This is why Neo4j is a key technology, and why the graph-engine package exists separately from the UI and API.

## 11. Summary

At a high level, Vamsha is a graph-based family platform with a clean layered architecture:

- React frontend for user interaction
- GraphQL API for typed access
- Neo4j for graph persistence
- Redis for authentication state
- a shared types layer to keep contracts aligned

The current codebase is intentionally focused on establishing the foundation for real family operations: authenticated users, family workspaces, and a graph-backed backend that later phases can expand with people, relationship logic, and visualization.
