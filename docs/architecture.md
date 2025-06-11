# Architecture

This document describes the high-level architecture of the Awesome NestJS Boilerplate, including design patterns, project structure, and implementation details.

- [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Core Concepts](#core-concepts)
    - [Module Organization](#module-organization)
    - [Design Patterns](#design-patterns)
      - [1. CQRS (Command Query Responsibility Segregation)](#1-cqrs-command-query-responsibility-segregation)
      - [2. Repository Pattern](#2-repository-pattern)
      - [3. Dependency Injection](#3-dependency-injection)
      - [4. Entity-DTO Mapping](#4-entity-dto-mapping)
    - [Database Layer](#database-layer)
      - [TypeORM Configuration](#typeorm-configuration)
      - [Entity Relationships](#entity-relationships)
      - [Transaction Support](#transaction-support)
    - [Authentication \& Authorization](#authentication--authorization)
      - [JWT-based Authentication](#jwt-based-authentication)
      - [Role-based Access Control (RBAC)](#role-based-access-control-rbac)
      - [Custom Decorators](#custom-decorators)
    - [API Documentation](#api-documentation)
      - [Swagger Integration](#swagger-integration)
    - [Error Handling](#error-handling)
      - [Global Exception Filters](#global-exception-filters)
      - [Custom Exceptions](#custom-exceptions)
    - [Validation](#validation)
      - [DTO Validation with Custom Decorators](#dto-validation-with-custom-decorators)
      - [Custom Validation Decorators](#custom-validation-decorators)
    - [Internationalization (i18n)](#internationalization-i18n)
      - [Multi-language Support](#multi-language-support)
    - [Testing](#testing)
      - [Testing Strategy](#testing-strategy)
      - [Test Structure](#test-structure)
    - [Security](#security)
      - [Built-in Security Features](#built-in-security-features)
      - [Environment-based Configuration](#environment-based-configuration)
  - [Technology Stack](#technology-stack)
    - [Core Technologies](#core-technologies)
    - [Development Tools](#development-tools)
    - [Runtime Support](#runtime-support)
  - [Best Practices](#best-practices)
    - [Code Organization](#code-organization)
    - [Performance](#performance)
    - [Code Quality Standards](#code-quality-standards)
    - [Security](#security-1)
  - [Development Workflow](#development-workflow)
    - [Version Control](#version-control)
    - [Code Quality](#code-quality)
    - [Deployment](#deployment)

## Project Structure

```
awesome-nest-boilerplate/
├── src/
│   ├── common/                 # Shared components and utilities
│   │   ├── dto/               # Common DTOs (PageDto, AbstractDto)
│   │   └── abstract.entity.ts # Base entity with common fields
│   ├── constants/             # Application-wide constants
│   │   └── role-type.ts      # User role enumeration
│   ├── database/              # Database configuration and migrations
│   │   └── migrations/        # TypeORM migration files
│   ├── decorators/            # Custom decorators
│   │   ├── auth-user.decorator.ts    # Extract authenticated user
│   │   ├── http.decorators.ts        # HTTP-related decorators
│   │   └── use-dto.decorator.ts      # Entity-DTO mapping
│   ├── entity-subscribers/    # TypeORM entity subscribers
│   │   └── user-subscriber.ts # Password hashing subscriber
│   ├── exceptions/            # Custom exception classes
│   ├── filters/               # Exception filters
│   │   ├── bad-request.filter.ts     # HTTP exception filter
│   │   └── query-failed.filter.ts    # Database error filter
│   ├── guards/                # Authentication and authorization guards
│   ├── i18n/                  # Internationalization files
│   │   ├── en_US/            # English translations
│   │   └── ru_RU/            # Russian translations
│   ├── interceptors/          # Request/Response interceptors
│   │   ├── translation-interceptor.service.ts
│   │   └── language-interceptor.service.ts
│   ├── interfaces/            # TypeScript interfaces
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication module
│   │   ├── user/             # User management module
│   │   ├── post/             # Post management module
│   │   └── health-checker/   # Health check module
│   ├── providers/             # Custom providers
│   ├── shared/                # Shared services and utilities
│   │   └── services/         # Global services (ApiConfigService, TranslationService)
│   ├── validators/            # Custom validators
│   ├── app.module.ts         # Root application module
│   ├── main.ts               # Application entry point
│   └── setup-swagger.ts      # Swagger configuration
├── test/                      # E2E tests
├── docs/                      # Documentation
├── docker-compose.yml         # Docker development setup
└── package.json              # Dependencies and scripts
```

## Core Concepts

### Module Organization

Each feature module follows a consistent structure based on Domain-Driven Design principles:

```
modules/feature/
├── commands/                  # CQRS command handlers
│   └── create-feature/
│       ├── create-feature.command.ts
│       └── create-feature.handler.ts
├── queries/                   # CQRS query handlers
│   └── get-feature/
│       ├── get-feature.query.ts
│       └── get-feature.handler.ts
├── dtos/                     # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature.dto.ts
├── exceptions/               # Module-specific exceptions
│   └── feature-not-found.exception.ts
├── feature.controller.ts     # HTTP route handlers
├── feature.service.ts        # Business logic
├── feature.module.ts         # Module configuration
├── feature.entity.ts         # Database entity
└── feature-related.entity.ts # Related entities
```

**Example: User Module Structure**
```typescript
// user.entity.ts
@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role!: RoleType;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts?: PostEntity[];
}
```

### Design Patterns

#### 1. CQRS (Command Query Responsibility Segregation)
Separates read and write operations for better scalability and maintainability:

```typescript
// Command for state changes
export class CreatePostCommand implements ICommand {
  constructor(
    public readonly userId: Uuid,
    public readonly createPostDto: CreatePostDto,
  ) {}
}

// Query for data retrieval
export class GetPostQuery implements IQuery {
  constructor(public readonly userId: Uuid) {}
}
```

#### 2. Repository Pattern
Implemented through TypeORM repositories with dependency injection:

```typescript
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    private commandBus: CommandBus,
  ) {}

  @Transactional()
  createPost(userId: Uuid, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.commandBus.execute<CreatePostCommand, PostEntity>(
      new CreatePostCommand(userId, createPostDto),
    );
  }
}
```

#### 3. Dependency Injection
Leverages NestJS's powerful DI container for loose coupling and testability.

#### 4. Entity-DTO Mapping
Uses custom decorators for automatic entity-to-DTO conversion:

```typescript
@Entity({ name: 'posts' })
@UseDto(PostDto)
export class PostEntity extends AbstractEntity<PostDto> {
  // Entity properties
}
```

### Database Layer

#### TypeORM Configuration
- **Data Mapper Pattern**: Separates entity definition from persistence logic
- **Snake Case Naming Strategy**: Converts camelCase to snake_case for database columns
- **Migration System**: Version-controlled database schema changes
- **Entity Subscribers**: Automatic operations (e.g., password hashing)

#### Entity Relationships
```typescript
// One-to-Many relationship
@OneToMany(() => PostEntity, (postEntity) => postEntity.user)
posts?: PostEntity[];

// Many-to-One with cascade options
@ManyToOne(() => UserEntity, (userEntity) => userEntity.posts, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
})
@JoinColumn({ name: 'user_id' })
user!: Relation<UserEntity>;
```

#### Transaction Support
```typescript
@Transactional()
async createPost(userId: Uuid, createPostDto: CreatePostDto): Promise<PostEntity> {
  // All database operations within this method are wrapped in a transaction
}
```

### Authentication & Authorization

#### JWT-based Authentication
- Stateless authentication using JSON Web Tokens
- Configurable expiration times
- Secure token signing and verification

#### Role-based Access Control (RBAC)
```typescript
@Auth([RoleType.ADMIN, RoleType.USER])
@Get(':id')
async getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
  return this.userService.getUser(userId);
}
```

#### Custom Decorators
```typescript
// Extract authenticated user from request
@AuthUser() user: UserEntity

// Validate UUID parameters
@UUIDParam('id') userId: Uuid
```

### API Documentation

#### Swagger Integration
- Auto-generated API documentation
- Request/response examples
- DTO validation documentation
- Available at `/documentation` endpoint

```typescript
@ApiTags('users')
@ApiOkResponse({ type: UserDto, description: 'User retrieved successfully' })
@Get(':id')
async getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
  return this.userService.getUser(userId);
}
```

### Error Handling

#### Global Exception Filters
```typescript
// HTTP exception handling with i18n support
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Handle and format exceptions consistently
  }
}
```

#### Custom Exceptions
```typescript
export class UserNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.user_not_found', error);
  }
}
```

### Validation

#### DTO Validation with Custom Decorators
```typescript
export class CreateUserDto {
  @EmailField()
  readonly email!: string;

  @StringField({ minLength: 6 })
  readonly password!: string;

  @PhoneFieldOptional()
  readonly phone?: string;
}
```

#### Custom Validation Decorators
- `@EmailField()`: Email validation with Swagger documentation
- `@StringField()`: String validation with length constraints
- `@NumberField()`: Number validation with range constraints
- `@BooleanField()`: Boolean validation
- `@UUIDField()`: UUID validation

### Internationalization (i18n)

#### Multi-language Support
- Nested translation files
- Dynamic language switching via headers/query parameters
- Translation interpolation and formatting

```typescript
// Translation usage in exceptions
throw new UserNotFoundException('error.user_not_found');

// Translation in DTOs and responses
@DynamicTranslate()
title?: string;
```

### Testing

#### Testing Strategy
1. **Unit Tests**: Individual component testing with mocks
2. **Integration Tests**: Module-level testing with real dependencies
3. **E2E Tests**: Full application flow testing

#### Test Structure
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
});
```

### Security

#### Built-in Security Features
1. **CORS Configuration**: Configurable cross-origin resource sharing
2. **Helmet Middleware**: Security headers protection
3. **Rate Limiting**: Request throttling with configurable limits
4. **Input Validation**: Comprehensive DTO validation
5. **SQL Injection Prevention**: TypeORM query parameterization

#### Environment-based Configuration
```typescript
export class ApiConfigService {
  get corsOrigins(): string[] {
    return this.getString('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
  }

  get throttlerConfigs(): ThrottlerOptions {
    return {
      ttl: this.getNumber('THROTTLE_TTL', 60),
      limit: this.getNumber('THROTTLE_LIMIT', 10),
    };
  }
}
```

## Technology Stack

### Core Technologies
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe JavaScript development
- **TypeORM**: Object-relational mapping with PostgreSQL
- **Vite**: Fast development build tool
- **Jest**: Testing framework

### Development Tools
- **ESLint + Prettier**: Code linting and formatting
- **Husky**: Git hooks for code quality
- **Docker**: Containerized development environment
- **Swagger**: API documentation generation

### Runtime Support
- **Node.js**: Primary runtime environment
- **Bun**: High-performance alternative runtime
- **Deno**: Secure TypeScript runtime

## Best Practices

### Code Organization
1. **Single Responsibility Principle**: Each class/module has one clear purpose
2. **Dependency Injection**: Use NestJS DI for loose coupling
3. **Type Safety**: Leverage TypeScript features extensively
4. **Consistent Naming**: Follow established naming conventions

### Performance
1. **Database Optimization**: Use indexes, query optimization, and pagination
2. **Caching Strategies**: Implement appropriate caching layers
3. **Lazy Loading**: Load related entities only when needed
4. **Connection Pooling**: Efficient database connection management

### Code Quality Standards
1. **Remove Unused Code**: Eliminate dead code and unused imports
2. **Simple Code Style**: Write clear, readable code (KISS principle)
3. **No Passthrough Functions**: Avoid unnecessary function wrappers
4. **DRY Principle**: Extract common functionality into reusable components
5. **Early Returns**: Reduce nesting with early return statements
6. **Explicit Error Handling**: Handle errors explicitly and meaningfully

### Security
1. **Input Validation**: Validate all incoming data
2. **Authentication**: Secure JWT implementation
3. **Authorization**: Role-based access control
4. **Environment Variables**: Secure configuration management

## Development Workflow

### Version Control
1. **Feature Branch Workflow**: Develop features in separate branches
2. **Conventional Commits**: Use meaningful commit messages
3. **Pull Request Reviews**: Code review process
4. **Automated CI/CD**: Continuous integration and deployment

### Code Quality
1. **Pre-commit Hooks**: Automated linting and formatting
2. **Test Coverage**: Maintain high test coverage
3. **Documentation**: Keep documentation up-to-date
4. **Performance Monitoring**: Track application performance

### Deployment
1. **Docker Support**: Containerized deployment
2. **Environment Configurations**: Environment-specific settings
3. **Database Migrations**: Automated schema updates
4. **Health Checks**: Application health monitoring
