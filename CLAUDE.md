# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise-grade NestJS 11 boilerplate — TypeScript, PostgreSQL + TypeORM, JWT auth (RS256), CQRS, i18n, AWS S3, NATS microservices (conditional), multi-runtime (Node/Bun/Deno).

## Package Manager

Use **pnpm**. Do not use npm or yarn.

## Key Commands

```bash
pnpm start:dev          # Vite hot-reload dev server (preferred)
pnpm nest:start:dev     # NestJS CLI watch mode
pnpm build:prod         # Production build
pnpm test               # Jest unit tests
pnpm test:e2e           # E2E tests
pnpm test:cov           # Coverage report
pnpm lint               # ESLint
pnpm lint:fix           # ESLint autofix
pnpm generate           # NestJS code generation (awesome-nestjs-schematics)
pnpm g                  # Shorthand for generate
```

**Database migrations** (required for any schema change):
```bash
pnpm migration:generate -- --name=MigrationName   # Generate from entity changes
pnpm migration:run      # Apply migrations
pnpm migration:revert   # Revert last migration
```

## Architecture

- Feature modules under `src/modules/` — each fully encapsulated (CQRS pattern recommended)
- Shared services in `src/shared/`
- Global filters, interceptors, pipes registered in `src/main.ts`
- NATS microservice conditional on `NATS_ENABLED` env var
- Swagger available at `/documentation` when `ENABLE_DOCUMENTATION=true`

For detailed architecture: @docs/architecture.md

## Critical Code Rules

**ESM imports — always include `.ts` extensions:**
```ts
// Correct
import { UserService } from './user.service.ts';
// Wrong
import { UserService } from './user.service';
```

**Entity ownership — one entity per module:**
- Each entity belongs to exactly one module
- Never import another module's entity directly; use its service instead

**Controller endpoints — always add `@ApiOperation`:**
```ts
@Get(':id')
@ApiOperation({ summary: 'Get user by ID' })
async getUser(...) {}
```

**Type imports — use `import type` for type-only imports** (VerbatimModuleSyntax is enabled):
```ts
import type { UserDto } from './user.dto.ts';
```

**TypeScript strictness:** No `any` — use `unknown` when type is uncertain. All strict flags are on.

**Naming:** `PascalCase` classes/types/enums, `camelCase` variables/functions, `kebab-case` file names, `SCREAMING_SNAKE_CASE` env vars.

For full style rules: @.cursor/rules/nestjs-clean-typescript-cursor-rules.mdc

## Testing

- Unit tests: colocated with source as `*.spec.ts`
- E2E tests: `test/` directory
- Run a single test: `pnpm test -- --testNamePattern="test name"`
- E2E tests require running Docker services (`docker-compose up -d postgres`)

For testing patterns: @.cursor/rules/testing-guidelines.mdc

## Git Conventions

**Branches:** `feature/<name>` or `fix/<name>` → `develop` → `main`

**Commits:** Conventional Commits format:
```
feat(user): add profile image upload
fix(auth): handle expired refresh tokens
chore(deps): upgrade typeorm to 0.3.21
```

Pre-commit hooks (Husky + lint-staged) automatically run Biome + ESLint on staged `.ts` files.

## Environment Setup

Copy `.env.example` to `.env`. Key vars to configure:
- `DB_*` — PostgreSQL connection
- `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` — RSA keys (examples in `.env.example`)
- `CORS_ORIGINS` — comma-separated allowed origins
- `REDIS_URL` / `MEILI_HOST` / `MEILI_MASTER_KEY` — used by Docker services; not yet wired into application code

Docker services: `docker-compose up -d` starts Postgres, pgAdmin (port 8080), and Meilisearch (port 7701).

## Formatter

**Biome** is the primary formatter/linter. ESLint runs alongside it.
- Biome config: `biome.json`
- ESLint config: `eslint.config.mjs`
- Pre-commit: lint-staged runs `biome lint --write` then `eslint --fix` on staged files
