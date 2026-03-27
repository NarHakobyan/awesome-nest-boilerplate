# Cursor Rules Organization

This directory contains Cursor IDE rules organized for optimal LLM understanding and code generation guidance.

## File Structure

### Core Rules (Always Applied)
- **`typescript.mdc`** - Comprehensive TypeScript guidelines including imports, types, and patterns
- **`clean-code.mdc`** - Clean code principles and best practices
- **`codequality.mdc`** - Code quality standards and workflow guidelines
- **`nestjs-general-guidelines.mdc`** - High-level NestJS architecture principles

### Feature-Specific Rules (Context-Applied)
- **`dto-structure-guidelines.mdc`** - DTO patterns and validation decorators (*.dto.ts)
- **`entity-guidelines.mdc`** - CRITICAL entity ownership rules and TypeORM patterns (*.entity.ts)
- **`http-decorators-guidelines.mdc`** - REST API standards and Swagger documentation (*.controller.ts)
- **`nestjs-module-structure-guidelines.mdc`** - Module structure and CQRS patterns
- **`testing-guidelines.mdc`** - Testing strategies and patterns (*.spec.ts, *.test.ts)

### Infrastructure Rules (Context-Applied)
- **`nestjs-core-module-guidelines.mdc`** - Core module setup and global configurations
- **`nestjs-shared-module-guidelines.mdc`** - Shared module patterns and utilities
- **`development-workflow-guidelines.mdc`** - Development scripts and environment setup

### Master Reference
- **`nestjs-clean-typescript-cursor-rules.mdc`** - Comprehensive master file with all patterns

### Deprecated
- **`typescript-general-guidelines.mdc`** - DEPRECATED (content moved to typescript.mdc)
- **`implementation-issues-found.mdc`** - Critical issues to be fixed in codebase

## Rule Priority

1. **CRITICAL** - Entity ownership, import patterns, API documentation
2. **HIGH** - TypeScript standards, clean code principles
3. **MEDIUM** - Module structure, testing patterns
4. **LOW** - Development workflow, shared utilities

## Usage

Cursor IDE automatically applies these rules based on:
- `alwaysApply: true` - Applied to all relevant files
- `globs` patterns - Applied to specific file types
- Context relevance - LLM determines applicability

Files are optimized for LLM parsing with clear headings, examples, and structured content.