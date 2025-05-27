# Architecture

This document describes the high-level architecture of the Awesome NestJS Boilerplate.

- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Core Concepts](#core-concepts)
    - [Module Organization](#module-organization)
    - [Design Patterns](#design-patterns)
    - [Database Layer](#database-layer)
    - [Authentication \& Authorization](#authentication--authorization)
    - [API Documentation](#api-documentation)
    - [Error Handling](#error-handling)
    - [Validation](#validation)
    - [Internationalization (i18n)](#internationalization-i18n)
    - [Testing](#testing)
    - [Security](#security)
  - [Best Practices](#best-practices)
  - [Development Workflow](#development-workflow)

## Project Structure

```
src/
├── common/          # Common DTOs, interfaces, and utilities
├── constants/       # Application-wide constants
├── database/        # Database configurations and migrations
├── decorators/      # Custom decorators
├── entity-subscribers/  # TypeORM entity subscribers
├── exceptions/      # Custom exception classes
├── filters/         # Exception filters
├── guards/          # Authentication and authorization guards
├── i18n/           # Internationalization files
├── interceptors/    # Request/Response interceptors
├── interfaces/      # TypeScript interfaces
├── modules/         # Feature modules
├── providers/       # Custom providers
├── shared/         # Shared services and utilities
└── validators/      # Custom validators
```

## Core Concepts

### Module Organization

The application follows NestJS's modular architecture pattern. Each feature module contains:

```
modules/feature/
├── commands/        # Command handlers (CQRS)
├── dtos/           # Data Transfer Objects
├── exceptions/     # Module-specific exceptions
├── queries/        # Query handlers (CQRS)
├── entities/       # TypeORM entities
├── controllers/    # Route controllers
└── services/       # Business logic services
```

### Design Patterns

1. **CQRS (Command Query Responsibility Segregation)**
   - Commands handle state changes
   - Queries handle data retrieval
   - Improves separation of concerns

2. **Repository Pattern**
   - Implemented through TypeORM repositories
   - Abstracts database operations
   - Enables easy switching between database providers

3. **Dependency Injection**
   - Follows NestJS's DI container
   - Promotes loose coupling
   - Facilitates testing

### Database Layer

- Uses TypeORM with the Data Mapper pattern
- Supports multiple database types (PostgreSQL, MySQL)
- Migrations for version control of database schema
- Entity subscribers for automated tasks

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Custom guards and decorators
- Secure password handling

### API Documentation

- Auto-generated API documentation
- Available at `/documentation` endpoint
- Includes request/response examples and DTOs

### Error Handling

1. **Exception Filters**
   - Global exception handling
   - Consistent error responses
   - i18n support for error messages

2. **Custom Exceptions**
   - Business logic exceptions
   - HTTP exceptions
   - Validation exceptions

### Validation

- Class-validator for DTO validation
- Custom validators for complex rules
- Validation pipes for automatic validation

### Internationalization (i18n)

- Support for multiple languages
- Nested translations
- Dynamic language switching
- Message formatting

### Testing

1. **Unit Tests**
   - Jest as testing framework
   - Mock repositories and services
   - Isolated component testing

2. **E2E Tests**
   - Full API testing
   - Database integration tests
   - Authentication flow tests

### Security

1. **Built-in Protection**
   - CORS configuration
   - Helmet middleware
   - Rate limiting
   - XSS protection

2. **Environment Configuration**
   - Secure env variable handling
   - Configuration validation
   - Environment-specific settings

## Best Practices

1. **Code Organization**
   - Follow single responsibility principle
   - Keep modules focused and cohesive
   - Use meaningful file and directory names

2. **Type Safety**
   - Utilize TypeScript features
   - Define clear interfaces
   - Avoid any type when possible

3. **Performance**
   - Implement caching where appropriate
   - Use database indexes
   - Optimize queries
   - Implement pagination

4. **Maintainability**
   - Write clear documentation
   - Follow consistent coding style
   - Use meaningful variable names
   - Keep functions small and focused

5. **Code Quality Standards**
   - **Remove Unused Code**: All unused imports, variables, functions, and code blocks must be deleted to maintain a clean codebase
   - **Simple Code Style**: Write clear, readable code that follows KISS (Keep It Simple, Stupid) principles
   - **No Passthrough Functions**: Avoid creating functions that simply return their arguments without adding any functionality or value
   - **DRY Principle**: Don't Repeat Yourself - extract common functionality into reusable functions or services
   - **Early Returns**: Use early returns to reduce nesting and improve code readability
   - **Explicit Error Handling**: Handle errors explicitly rather than letting them bubble up silently
   - **Consistent Naming**: Use consistent and descriptive naming conventions across the entire codebase
   - **Single Purpose Functions**: Each function should have one clear responsibility and do it well

6. **Scalability**
   - Stateless application design
   - Support for horizontal scaling
   - Efficient database queries
   - Caching strategies

## Development Workflow

1. **Version Control**
   - Feature branch workflow
   - Meaningful commit messages
   - Pull request reviews
   - Automated CI/CD

2. **Code Quality**
   - ESLint for code linting
   - Prettier for code formatting
   - Husky for git hooks

3. **Documentation**
   - Keep README up to date
   - Document API changes
   - Update architecture docs
   - Maintain changelog

4. **Deployment**
   - Docker support
   - Environment configurations
   - Database migrations
   - Health checks
