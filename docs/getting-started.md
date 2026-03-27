# Getting Started

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Available Scripts](#available-scripts)
    - [Development](#development)
    - [Production](#production)
    - [Testing](#testing)
    - [Database Operations](#database-operations)
    - [Code Quality](#code-quality)
  - [Runtime Support](#runtime-support)
    - [Node.js (Default)](#nodejs-default)
    - [Bun](#bun)
    - [Deno](#deno)
  - [Initial Setup Checklist](#initial-setup-checklist)
    - [1. Project Configuration](#1-project-configuration)
    - [2. Environment Setup](#2-environment-setup)
    - [3. Database Setup](#3-database-setup)
    - [4. Development Environment](#4-development-environment)
  - [Environment Configuration](#environment-configuration)
  - [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v24+ required)
- [pnpm](https://pnpm.io/installation) (v10.26+)
- [Git](https://git-scm.com/)
- A PostgreSQL database (v14+ recommended)

## Quick Start

```bash
# Clone the repository using degit
npx degit NarHakobyan/awesome-nest-boilerplate my-nest-app

# Navigate to the project directory
cd my-nest-app

# Create environment variables file
cp .env.example .env

# Install dependencies
pnpm install

# Configure your database settings in .env file
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=nest_boilerplate

# Start the development server
pnpm start:dev
```

Your application will be available at `http://localhost:3000` and API documentation at `http://localhost:3000/documentation`.

## Available Scripts

### Development
```bash
# Start development server with Vite
pnpm start:dev

# Start with NestJS CLI (alternative)
pnpm nest:start:dev

# Start with file watching
pnpm watch:dev

# Start with debugger
pnpm nest:start:debug
```

### Production
```bash
# Build for production
pnpm build:prod

# Start production server
pnpm start:prod
```

### Testing
```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e

# Run test coverage
pnpm test:cov

# Run tests with debugger
pnpm test:debug
```

### Database Operations
```bash
# Generate new migration
pnpm migration:generate -- --name=[migration-name]

# Create empty migration
pnpm migration:create src/database/migrations/[migration-name]

# Run pending migrations
pnpm migration:run

# Show migration status
pnpm migration:show

# Revert last migration
pnpm migration:revert

# Drop database schema
pnpm schema:drop
```

### Code Quality
```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Update dependencies
pnpm taze
```

## Runtime Support

This boilerplate supports multiple JavaScript runtimes for maximum flexibility:

### Node.js (Default)
The traditional and most stable runtime environment with full ecosystem support.

```bash
# Development
pnpm start:dev

# Production
pnpm build:prod && pnpm start:prod
```

### Bun
High-performance JavaScript runtime with built-in bundler and package manager.

```bash
# Start development server with Bun
bun start:dev:bun

# Watch mode with Bun
bun watch:bun

# Run tests with Bun
bun test

# Build with Bun
bun build:bun
```

### Deno
Secure runtime for JavaScript and TypeScript with built-in tooling.

```bash
# Start development server with Deno
deno task start

# Watch mode with Deno
deno task watch

# Run tests with Deno
deno task test

# Build with Deno
deno task buildr
```

## Initial Setup Checklist

After creating your project, complete these steps:

### 1. Project Configuration
- [ ] Update `package.json` with your project details (name, description, author)
- [ ] Modify `LICENSE` with your name/organization
- [ ] Update `README.md` with project-specific information
- [ ] Remove `.github` folder if not needed

### 2. Environment Setup
- [ ] Configure `.env` with your environment variables:
  ```env
  # Database
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=postgres
  DB_DATABASE=nest_boilerplate

  # JWT (RSA key pair — see .env.example for format)
  JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

  # Application
  PORT=3000
  NODE_ENV=development

  # CORS
  CORS_ORIGINS=http://localhost:3000
  ```

### 3. Database Setup
- [ ] Set up your PostgreSQL database
- [ ] Update database configurations in `.env`
- [ ] Run initial migrations: `pnpm migration:run`

### 4. Development Environment
- [ ] Configure your IDE/editor with TypeScript support
- [ ] Install recommended extensions (ESLint, Biome)
- [ ] Set up git hooks (Husky is pre-configured)

## Environment Configuration

The application supports multiple environments:

- **Development**: Full debugging, hot reload, detailed logging
- **Staging**: Production-like environment for testing
- **Production**: Optimized for performance and security

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | RSA key pair for JWT signing (RS256) | Required |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## Next Steps

1. **Explore the Architecture**: Read the [Architecture Documentation](./architecture.md) to understand the project structure and design patterns

2. **Development Setup**: Check the [Development Guide](./development.md) for detailed development instructions and Docker setup

3. **Code Standards**: Review the [Code Style and Patterns](./code-style-and-patterns.md) for coding conventions and best practices

4. **API Documentation**: Visit `http://localhost:3000/documentation` when running the server to explore the auto-generated Swagger documentation

5. **Testing**: Learn about testing strategies in the [Testing Guide](./testing.md)

6. **Deployment**: When ready to deploy, consult the [Deployment Guide](./deployment.md)

7. **Naming Conventions**: Reference the [Naming Cheatsheet](./naming-cheatsheet.md) for consistent naming across your project
