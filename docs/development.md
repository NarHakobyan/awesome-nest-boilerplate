# Development Guide

- [Development Guide](#development-guide)
  - [First-time Setup](#first-time-setup)
  - [Installation](#installation)
  - [Database Configuration](#database-configuration)
    - [PostgreSQL (Default)](#postgresql-default)
    - [MySQL/MariaDB Alternative](#mysqlmariadb-alternative)
    - [Database Operations](#database-operations)
      - [Migration Examples](#migration-examples)
  - [Development Server](#development-server)
  - [Project Structure](#project-structure)
  - [Code Generation](#code-generation)
  - [Environment Variables](#environment-variables)
  - [Docker Development](#docker-development)
    - [Prerequisites](#prerequisites)
    - [Running with Docker](#running-with-docker)
    - [Docker Compose Services](#docker-compose-services)
  - [Development Workflow](#development-workflow)
  - [Debugging](#debugging)
    - [VS Code Configuration](#vs-code-configuration)
    - [Debug Commands](#debug-commands)
  - [Performance Optimization](#performance-optimization)
    - [Development Performance](#development-performance)
    - [Production Considerations](#production-considerations)

## First-time Setup

Ensure you have the required tools installed:

- [Node.js](https://nodejs.org/en/) (v24+ required)
- [pnpm](https://pnpm.io/installation) (v10.26+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)
- [Git](https://git-scm.com/)

## Installation

```bash
# Install dependencies from package.json
pnpm install
```

> **Note**: Don't delete `pnpm-lock.yaml` before installation. See more in [pnpm docs](https://pnpm.io/lockfile)

## Database Configuration

The project uses [TypeORM](https://github.com/typeorm/typeorm) with the Data Mapper pattern and supports multiple database types.

### PostgreSQL (Default)

1. Install and start PostgreSQL
2. Create a database for your application
3. Configure your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nest_boilerplate

# Enable ORM logging (development only)
ENABLE_ORM_LOGS=true
```

### MySQL/MariaDB Alternative

If you prefer MySQL/MariaDB over PostgreSQL, the driver is chosen in code rather
than by an environment variable, so this takes two steps:

1. Update your `.env` file:
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=mysql
DB_PASSWORD=mysql
DB_DATABASE=nest_boilerplate
DB_ROOT_PASSWORD=mysql
DB_ALLOW_EMPTY_PASSWORD=yes
```

2. Update `ormconfig.ts`:
```typescript
export const dataSource = new DataSource({
  type: 'mysql', // Change from 'postgres' to 'mysql'
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // ... rest of configuration
});
```

3. Clear existing migrations and regenerate:
```bash
# Remove existing migrations
rm -rf src/database/migrations/*

# Generate new migrations for MySQL
pnpm migration:generate -- --name=initial-migration
```

### Database Operations

> **Note**: For TypeORM v0.3+, the migration commands have changed:
> - `migration:create` now requires the full path to the migration file
> - `migration:generate` requires the `-d` flag to specify the DataSource configuration
> - All commands now use the DataSource configuration instead of the old ormconfig.ts format

#### Migration Examples

**Creating a new migration manually:**
```bash
# Create a new migration file
pnpm migration:create src/database/migrations/add-gifts-table

# This generates: 1754340825698-add-gifts-table.ts
```

**Generating migration from entity changes:**
```bash
# 1. Create or modify your entity (e.g., src/modules/gift/gift.entity.ts)
# 2. Generate migration based on entity changes
pnpm migration:generate -- --name=add-gifts-table

# 3. Review the generated migration file
# 4. Run the migration
pnpm migration:run
```

**Complete workflow example:**
```bash
# 1. Create entity
# Edit: src/modules/gift/gift.entity.ts

# 2. Generate migration
pnpm migration:generate -- --name=gifts-table

# 3. Review generated migration
# File: src/database/migrations/1754340825698-gifts-table.ts

# 4. Run migration
pnpm migration:run

# 5. Verify migration status
pnpm migration:show

# Revert the last migration
pnpm migration:revert

# Drop entire database schema (⚠️ destructive)
pnpm schema:drop

```

## Development Server

The project uses Vite for fast development with hot module replacement:

```bash
# Start development server with Vite (recommended)
pnpm start:dev

# Alternative: Start with NestJS CLI
pnpm nest:start:dev

# Start with file watching
pnpm watch:dev

# Start with debugger enabled
pnpm nest:start:debug
```

> **Note**: If you're on Linux and see an `ENOSPC` error, you must [increase the number of available file watchers](https://stackoverflow.com/questions/22475849/node-js-error-enospc#answer-32600959).

The development server will be available at:
- **Application**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/documentation`

## Project Structure

```
src/
├── common/                 # Shared DTOs, utilities, and base classes
│   ├── dto/               # Common data transfer objects
│   └── abstract.entity.ts # Base entity class
├── constants/             # Application-wide constants
├── database/              # Database configuration and migrations
│   └── migrations/        # TypeORM migration files
├── decorators/            # Custom decorators
├── entity-subscribers/    # TypeORM entity subscribers
├── exceptions/            # Custom exception classes
├── filters/               # Exception filters
├── guards/                # Authentication and authorization guards
├── i18n/                  # Internationalization files
│   ├── en_US/            # English translations
│   └── ru_RU/            # Russian translations
├── interceptors/          # Request/Response interceptors
├── interfaces/            # TypeScript interfaces
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── user/             # User management module
│   ├── post/             # Post management module
│   └── health-checker/   # Health check module
├── providers/             # Custom providers
├── shared/                # Shared services and utilities
│   └── services/         # Global services
└── validators/            # Custom validators
```

## Code Generation

Use NestJS CLI for rapid development:

```bash
# Install NestJS CLI globally (if not already installed)
pnpm add -g @nestjs/cli

# Generate a new module
nest generate module feature-name

# Generate a new service
nest generate service feature-name

# Generate a new controller
nest generate controller feature-name

# Generate a complete resource (module, service, controller, DTOs)
nest generate resource feature-name

# Use project-specific generator
pnpm generate service feature-name
pnpm g controller feature-name
```

> **Note**: The project includes custom schematics via `awesome-nestjs-schematics` for enhanced code generation.

## Environment Variables

Environment variables are schema-driven. `src/config/env/env.definition.ts` declares
every variable — its type, whether it is required, its default, what reads it and
what it is for — and four things are generated from that one file:

- the validation that runs at startup (`ConfigModule.forRoot({ validate })`)
- the `Env` type `ApiConfigService` is written against
- `.env.example`
- [the environment reference](./env-reference.md)

### First-time setup

```bash
cp .env.example .env
pnpm env:keygen       # writes a fresh RS256 keypair into .env
```

`.env.example` ships placeholders rather than a working keypair, so the keys signing
your tokens are yours alone. Everything else has a working local default.

### Adding a variable

1. Add an entry to `src/config/env/env.definition.ts`.
2. Run `pnpm env:sync` to regenerate `.env.example` and `docs/env-reference.md`.
3. Commit both generated files along with the schema change.

Skipping step 2 fails `pnpm env:check`, which runs in the pre-commit hook and in CI.
That is the point: there is no way to add a variable and forget the example file.

### Commands

| Command | What it does |
|---|---|
| `pnpm env:sync` | Regenerate `.env.example` and `docs/env-reference.md` from the schema |
| `pnpm env:check` | Fail if those files are stale; report on your local `.env` if you have one |
| `pnpm env:validate` | Same checks, but every finding is an error — use it as a deploy preflight |
| `pnpm env:keygen` | Write a fresh RS256 keypair into `.env` |

`env:check` treats the two kinds of drift differently on purpose. A stale
`.env.example` is repository drift that everybody inherits, so it is a hard failure.
An unknown or missing key in your own untracked `.env` is your local setup, so it is
a loud warning that never blocks your commit. `--strict` (what `env:validate` uses)
escalates both.

Set `ENV_SCHEMA_SKIP=1` to bypass the checks entirely for a one-off.

### Scope

Each entry declares a `scope`:

- `app` — the NestJS application reads it. It is validated at boot, appears on the
  `Env` type and is reachable through `ApiConfigService`.
- `external` — something else reads it: docker-compose, `init-data.sh`, the AWS SDK
  credential chain. It is documented and accepted, but deliberately absent from
  `Env`, so nobody can read a value the application never honours.

## Docker Development

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

```bash
# Start all services (app + database)
PORT=3000 docker-compose up

# Start in detached mode
PORT=3000 docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

### Docker Compose Services

The `docker-compose.yml` includes:

- **app**: NestJS application
- **postgres**: PostgreSQL database
- **pgAdmin**: Database administration tool (available at `http://localhost:8080`)
For MySQL development, use:
```bash
docker-compose -f docker-compose_mysql.yml up
```

## Development Workflow

1. **Feature Development**:
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature

   # Generate module structure
   pnpm g resource feature-name

   # Implement feature
   # Write tests
   # Update documentation
   ```

2. **Code Quality**:
   ```bash
   # Run linting
   pnpm lint

   # Fix linting issues
   pnpm lint:fix

   # Run tests
   pnpm test

   # Check test coverage
   pnpm test:cov
   ```

3. **Database Changes**:
   ```bash
   # Create/modify entities
   # Generate migration
   pnpm migration:generate -- --name=[migration-name]

   # Review generated migration
   # Run migration
   pnpm migration:run
   ```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Commands

```bash
# Start with debugger
pnpm nest:start:debug

# Debug tests
pnpm test:debug

# Debug specific test file
pnpm test:debug -- user.service.spec.ts
```

## Performance Optimization

### Development Performance

1. **Use Vite for Development**:
   - Faster startup times
   - Hot module replacement
   - Optimized bundling

2. **Database Query Optimization**:
   ```bash
   # Enable query logging
   ENABLE_ORM_LOGS=true

   # Monitor slow queries
   # Add database indexes
   # Use query builders for complex queries
   ```

3. **Memory Management**:
   ```bash
   # Monitor memory usage
   node --inspect src/main.ts

   # Increase Node.js memory limit if needed
   node --max-old-space-size=4096 src/main.ts
   ```

### Production Considerations

- Use `pnpm build:prod` for optimized builds
- Enable compression middleware
- Configure proper caching strategies
- Set up monitoring and logging
- Use environment-specific configurations
