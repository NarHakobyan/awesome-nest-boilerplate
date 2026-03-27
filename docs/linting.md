# Linting and Code Quality

This guide covers the linting, formatting, and code quality tools used in the Awesome NestJS Boilerplate.

- [Linting and Code Quality](#linting-and-code-quality)
  - [Overview](#overview)
  - [Biome (Primary)](#biome-primary)
    - [Configuration](#configuration)
    - [Running Biome](#running-biome)
  - [ESLint (Supplementary)](#eslint-supplementary)
    - [Installed Plugins](#installed-plugins)
    - [Configuration File](#configuration-file)
    - [Prettier via ESLint](#prettier-via-eslint)
  - [TypeScript Configuration](#typescript-configuration)
    - [Compiler Options](#compiler-options)
    - [Strict Mode](#strict-mode)
  - [Git Hooks](#git-hooks)
    - [Husky Configuration](#husky-configuration)
    - [Lint-Staged](#lint-staged)
  - [Available Scripts](#available-scripts)
  - [IDE Integration](#ide-integration)
    - [VS Code Setup](#vs-code-setup)
    - [WebStorm Setup](#webstorm-setup)
  - [Code Quality Rules](#code-quality-rules)
    - [Naming Conventions](#naming-conventions)
    - [Import Organization](#import-organization)
    - [Code Complexity](#code-complexity)
  - [Security Linting](#security-linting)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
  - [Best Practices](#best-practices)

## Overview

The project uses a two-layer linting and formatting setup:

- **Biome**: Primary formatter and linter (runs first — handles most code style and formatting)
- **ESLint**: Supplementary linter for rules not covered by Biome (runs after Biome)
- **TypeScript**: Strict type checking (`strict: true`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`)
- **Husky + Lint-staged**: Git hooks that run both tools on staged files before every commit

There is **no standalone Prettier** — Prettier runs only as an ESLint plugin rule (`prettier/prettier`).

## Biome (Primary)

[Biome](https://biomejs.dev/) is the primary code formatter and linter. It replaces Prettier as the standalone formatter and handles many lint rules faster than ESLint.

### Configuration

**`biome.json`** (key settings):

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  }
}
```

Biome enforces naming conventions configured in `biome.json`:
- `PascalCase` for classes, types, enums
- `camelCase` for variables and functions
- `SCREAMING_SNAKE_CASE` for constants and enum members
- `kebab-case` for file names

### Running Biome

```bash
# Check all files (lint + format)
pnpm exec biome check .

# Fix auto-fixable issues
pnpm exec biome check --write .

# Check only staged files
pnpm lint:changes
```

## ESLint (Supplementary)

ESLint runs after Biome for rules that Biome does not cover (import ordering, security scanning, Node.js-specific rules, etc.).

### Installed Plugins

```json
{
  "devDependencies": {
    "@eslint/js": "^9.x",
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser": "^8.x",
    "eslint": "^9.x",
    "eslint-plugin-canonical": "^5.x",
    "eslint-plugin-import": "^2.x",
    "eslint-plugin-import-helpers": "^2.x",
    "eslint-plugin-n": "^17.x",
    "eslint-plugin-no-secrets": "^2.x",
    "eslint-plugin-prettier": "^5.x",
    "eslint-plugin-promise": "^7.x",
    "eslint-plugin-simple-import-sort": "^12.x",
    "eslint-plugin-sonarjs": "^3.x",
    "eslint-plugin-unicorn": "^59.x"
  }
}
```

### Configuration File

**`eslint.config.mjs`** uses ESLint 9 flat config format. Key rules enforced:

- `@typescript-eslint/no-explicit-any`: error (use `unknown` instead)
- `simple-import-sort/imports` + `simple-import-sort/exports`: enforces sorted imports
- `no-secrets/no-secrets`: prevents committing API keys/tokens
- `sonarjs/cognitive-complexity`: limits cyclomatic complexity
- `unicorn/prefer-node-protocol`: enforces `node:` prefix for built-in imports
- `promise/catch-or-return`: ensures promises are handled

TypeScript rules that overlap with Biome or the TS compiler are disabled to avoid duplicate errors.

### Prettier via ESLint

There is no `.prettierrc` file in the project. Prettier formatting rules are applied through `eslint-plugin-prettier`:

```javascript
// Inline Prettier config in eslint.config.mjs
{
  'prettier/prettier': ['error', {
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 2,
    bracketSpacing: true,
  }]
}
```

## TypeScript Configuration

### Compiler Options

**`tsconfig.json`** (key settings):

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "lib": ["ESNext"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedParameters": true,
    "noUnusedLocals": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "isolatedModules": true,
    "baseUrl": "./src",
    "outDir": "./dist"
  }
}
```

### Strict Mode

The project enables all TypeScript strict flags plus additional safety checks:

- `strict: true`: Enables all strict checks (strictNullChecks, noImplicitAny, etc.)
- `verbatimModuleSyntax: true`: Requires `import type` for type-only imports
- `allowImportingTsExtensions: true`: Allows `.ts` extensions in import paths (required for ESM)
- `noUncheckedIndexedAccess: true`: Array/object access returns `T | undefined`
- `isolatedModules: true`: Compatible with single-file transpilation

**ESM imports must include `.ts` extension:**

```typescript
// ✅ Correct
import { UserService } from './user.service.ts';
import type { UserDto } from './user.dto.ts';

// ❌ Wrong
import { UserService } from './user.service';
```

## Git Hooks

### Husky Configuration

**`.husky/pre-commit`** runs lint-staged on every commit:

```bash
pnpm exec lint-staged
```

### Lint-Staged

**`package.json`** lint-staged configuration:

```json
{
  "lint-staged": {
    "*.ts": [
      "npx @biomejs/biome lint --write",
      "eslint --fix",
      "git add"
    ]
  }
}
```

Execution order on every commit:
1. **Biome** auto-fixes formatting and lint issues on staged `.ts` files
2. **ESLint** fixes remaining issues (import ordering, security, etc.)
3. Fixed files are re-staged automatically

This means any commit that passes the hook is guaranteed to meet both Biome and ESLint standards.

## Available Scripts

```bash
# Run ESLint on all files
pnpm lint

# Run ESLint with auto-fix
pnpm lint:fix

# Check staged files with Biome (pre-commit equivalent)
pnpm lint:changes
```

> **Note**: To run Biome manually on all files, use `pnpm exec biome check --write .`

## IDE Integration

### VS Code Setup

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) and the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

**`.vscode/settings.json`** (recommended):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "quickfix.biome": "explicit"
  },
  "eslint.validate": ["typescript"],
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### WebStorm Setup

1. **Enable ESLint**:
   - Go to `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
   - Check "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

2. **Enable Biome**:
   - Install the [Biome plugin](https://plugins.jetbrains.com/plugin/22761-biome)
   - Go to `Settings > Languages & Frameworks > Biome`
   - Enable "Use Biome as formatter"

## Code Quality Rules

### Naming Conventions

```typescript
// ✅ PascalCase for classes
export class UserService {}

// ✅ camelCase for variables and functions
const userName = 'john';
function getUserById(id: string) {}

// ✅ kebab-case for file names
// user-service.ts, create-user.dto.ts

// ✅ SCREAMING_SNAKE_CASE for constants and enum values
const MAX_RETRY_ATTEMPTS = 3;
enum RoleType { USER = 'USER', ADMIN = 'ADMIN' }
```

### Import Organization

```typescript
// ✅ Correct — .ts extension required for ESM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../../modules/user/user.entity.ts';
import type { CreateUserDto } from '../dtos/create-user.dto.ts';

// ❌ Wrong — missing .ts extension
import { UserEntity } from '../../modules/user/user.entity';
```

### Code Complexity

```typescript
// ✅ Low cognitive complexity
function processUser(user: User): ProcessedUser {
  if (!user.isActive) {
    return { ...user, status: 'inactive' };
  }

  if (user.role === RoleType.ADMIN) {
    return { ...user, permissions: getAdminPermissions() };
  }

  return { ...user, permissions: getUserPermissions() };
}

// ❌ High cognitive complexity (too many nested conditions)
function processUser(user: User): ProcessedUser {
  if (user.isActive) {
    if (user.role === 'admin') {
      if (user.department === 'IT') {
        if (user.experience > 5) {
          // Too deeply nested
        }
      }
    }
  }
}
```

## Security Linting

The `no-secrets` plugin prevents committing sensitive information:

```typescript
// ❌ Bad — hardcoded secrets will fail the lint check
const apiKey = 'sk-1234567890abcdef';
const password = 'mySecretPassword123';

// ✅ Good — use environment variables
const apiKey = process.env.API_KEY;
const password = process.env.DATABASE_PASSWORD;
```

## Troubleshooting

### Common Issues

**Biome and ESLint rules conflict**:
- Biome takes precedence. ESLint rules that duplicate Biome's formatting rules are disabled in `eslint.config.mjs` via TypeScript-specific overrides.

**ESLint not working in IDE**:
```bash
# Restart TypeScript service in VS Code
# Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Verify ESLint can parse the file
pnpm exec eslint --debug src/main.ts
```

**Import resolution errors**:
```bash
# Verify TypeScript paths
pnpm exec tsc --noEmit --listFiles
```

**Slow linting**:
```bash
# Use ESLint cache
pnpm lint --cache
```

## Best Practices

### 1. Let the hooks do the work
Commit normally — Husky + lint-staged will auto-fix Biome and ESLint issues before the commit lands. You only need to run lint manually when debugging.

### 2. Prefer `import type` for type-only imports
`verbatimModuleSyntax` enforces this. IDE auto-imports will often get it right; lint-staged fixes it otherwise.

### 3. Document ESLint disable comments
```typescript
// ✅ Good — explain why the disable is needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// TODO: Replace with proper typing after API update — see issue #123
const legacyData: any = await getLegacyData();

// ❌ Bad — no explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();
```

### 4. CI/CD Integration
Run linting in CI before building:
```yaml
- name: Lint
  run: pnpm lint

- name: Build
  run: pnpm build:prod
```
