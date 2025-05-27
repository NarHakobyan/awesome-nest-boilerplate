# Getting Started

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Available Scripts](#available-scripts)
    - [Development](#development)
    - [Production](#production)
    - [Testing](#testing)
  - [Runtime Support](#runtime-support)
    - [Node.js (Default)](#nodejs-default)
    - [Bun](#bun)
    - [Deno](#deno)
  - [Initial Setup Checklist](#initial-setup-checklist)
  - [Next Steps](#next-steps)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.x or later)
- [Git](https://git-scm.com/)
- A PostgreSQL database (or MySQL/MariaDB)

## Quick Start

```bash
# Clone the repository using degit
npx degit NarHakobyan/awesome-nest-boilerplate my-nest-app

# Navigate to the project directory
cd my-nest-app

# Create environment variables file
cp .env.example .env

# Install dependencies
yarn install

# Start the development server
yarn start:dev
```

## Available Scripts

### Development
```bash
# Start development server
yarn start:dev

# Start with file watching
yarn watch:dev

# Start with debugger
yarn debug:dev
```

### Production
```bash
# Build for production
yarn build:prod

# Start production server
yarn start:prod
```

### Testing
```bash
# Run unit tests
yarn test

# Run e2e tests
yarn test:e2e

# Run test coverage
yarn test:cov
```

## Runtime Support

This boilerplate supports multiple JavaScript runtimes:

### Node.js (Default)
The traditional and most stable runtime environment.

### Bun
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

1. Update the following files with your project information:
   - [ ] Update `package.json` with your project details
   - [ ] Modify `LICENSE` with your name/organization
   - [ ] Configure `.env` with your environment variables
   - [ ] Update `README.md` with project-specific information

2. Configure your database:
   - [ ] Set up your database (PostgreSQL/MySQL)
   - [ ] Update database configurations in `.env`
   - [ ] Run initial migrations

3. Set up your development environment:
   - [ ] Configure your IDE/editor
   - [ ] Set up linting and formatting tools
   - [ ] Configure git hooks (using Husky)

## Next Steps

- Read the [Architecture Documentation](./architecture.md) to understand the project structure
- Check the [Development Guide](./development.md) for detailed development instructions
- Review the [Naming Cheatsheet](./naming-cheatsheet.md) for coding conventions
- Explore the [API Documentation](http://localhost:3000/documentation) when running the server
