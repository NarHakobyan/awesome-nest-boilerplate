# NestJS Code Style Guide

This document serves as the definitive guide for code style, patterns, and conventions used in the Awesome NestJS Boilerplate. This guide should be used as context for all future code generation and development work.

## Table of Contents

- [NestJS Code Style Guide](#nestjs-code-style-guide)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [General TypeScript Guidelines](#general-typescript-guidelines)
    - [Basic Principles](#basic-principles)
    - [Naming Conventions](#naming-conventions)
    - [Import Organization](#import-organization)
    - [TypeScript Conventions](#typescript-conventions)
  - [File and Directory Structure](#file-and-directory-structure)
    - [Project Structure](#project-structure)
    - [Module Structure](#module-structure)
    - [File Naming Conventions](#file-naming-conventions)
  - [Module Architecture](#module-architecture)
    - [Module Definition Pattern](#module-definition-pattern)
  - [Controllers](#controllers)
    - [Controller Structure Pattern](#controller-structure-pattern)
    - [Controller Best Practices](#controller-best-practices)
    - [REST API Standards](#rest-api-standards)
  - [Services](#services)
    - [Service Structure Pattern](#service-structure-pattern)
    - [Service Best Practices](#service-best-practices)
  - [DTOs and Validation](#dtos-and-validation)
    - [Input DTO Pattern](#input-dto-pattern)
    - [Response DTO Pattern](#response-dto-pattern)
    - [Custom Field Decorators](#custom-field-decorators)
    - [DTO Best Practices](#dto-best-practices)
  - [Entities](#entities)
    - [Entity Structure Pattern](#entity-structure-pattern)
    - [Entity Best Practices](#entity-best-practices)
    - [Entity Module Ownership Rules](#entity-module-ownership-rules)
  - [CQRS Pattern](#cqrs-pattern)
    - [Command Structure](#command-structure)
    - [Command Handler Structure](#command-handler-structure)
    - [Query Structure](#query-structure)
    - [CQRS Best Practices](#cqrs-best-practices)
  - [Authentication and Authorization](#authentication-and-authorization)
    - [Auth Decorator Usage](#auth-decorator-usage)
    - [JWT Token Structure](#jwt-token-structure)
  - [Exception Handling](#exception-handling)
    - [Custom Exception Pattern](#custom-exception-pattern)
  - [Configuration and Environment](#configuration-and-environment)
    - [Environment Variables Pattern](#environment-variables-pattern)
    - [Configuration Service Pattern](#configuration-service-pattern)
  - [Summary](#summary)

## Project Overview

This is a modern NestJS boilerplate built with:
- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.x** - Strict type checking enabled
- **TypeORM 0.3.x** - Database ORM with PostgreSQL
- **CQRS Pattern** - Command Query Responsibility Segregation
- **JWT Authentication** - JSON Web Token based auth
- **Swagger/OpenAPI** - API documentation
- **ESM Modules** - ES Module support with .ts extensions
- **Vite** - Fast development server
- **Jest** - Testing framework

## General TypeScript Guidelines

### Basic Principles

- Use English for all code and documentation
- Always declare types for variables and functions (avoid `any`)
- Use strict TypeScript configuration
- One export per file
- No blank lines within functions
- No comments in code (self-documenting code preferred)

### Naming Conventions

```typescript
// PascalCase for classes
export class UserService {}
export class CreateUserDto {}

// camelCase for variables, functions, methods
const userName = 'john';
async function createUser() {}

// kebab-case for files and directories
user.service.ts
create-user.dto.ts
user-settings.entity.ts

// UPPERCASE for constants and environment variables
const MAX_RETRY_ATTEMPTS = 3;
process.env.DATABASE_URL

// Use verbs for boolean variables
const isLoading = true;
const hasError = false;
const canDelete = user.role === RoleType.ADMIN;
```

### Import Organization

```typescript
// 1. Node modules (external dependencies)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 2. Internal imports with absolute paths and .ts extensions
import { validateHash } from '../../common/utils.ts';
import type { RoleType } from '../../constants/role-type.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';

// 3. Relative imports
import type { UserEntity } from './user.entity.ts';
import { UserService } from './user.service.ts';
```

### TypeScript Conventions

```typescript
// Use type imports for types only
import type { RoleType } from '../constants/role-type.ts';
import type { Reference } from '../types.ts';

// Do not use readonly for DTO properties
export class UserLoginDto {
  @EmailField()
  email!: string;

  @StringField()
  password!: string;
}

// Use definite assignment assertion for decorated properties
@Column({ unique: true })
email!: string;

// Use optional properties appropriately
phone?: string;
```

## File and Directory Structure

### Project Structure

```
src/
├── main.ts                    # Application bootstrap
├── app.module.ts             # Root module
├── setup-swagger.ts          # Swagger configuration
├── types.ts                  # Global type definitions
├── boilerplate.polyfill.ts   # Global polyfills
├── snake-naming.strategy.ts  # Database naming strategy
├── metadata.ts               # Application metadata
├── common/                   # Shared utilities and base classes
│   ├── dto/                  # Common DTOs
│   └── abstract.entity.ts    # Base entity class
├── constants/                # Application constants
├── database/                 # Database configuration and migrations
│   └── migrations/
├── decorators/               # Custom decorators
├── entity-subscribers/       # TypeORM entity subscribers
├── exceptions/               # Custom exception classes
├── filters/                  # Exception filters
├── guards/                   # Authentication/authorization guards
├── i18n/                     # Internationalization files
│   ├── en_US/
│   └── ru_RU/
├── interceptors/             # Request/response interceptors
├── interfaces/               # TypeScript interfaces
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   ├── user/                 # User management module
│   ├── post/                 # Post management module
│   └── health-checker/       # Health check module
├── providers/                # Custom providers
├── shared/                   # Shared services and modules
│   └── services/
└── validators/               # Custom validators
```

### Module Structure

Each feature module follows this structure:

```
modules/feature-name/
├── commands/                 # CQRS command handlers
│   ├── create-feature.command.ts
│   └── create-feature.handler.ts
├── queries/                  # CQRS query handlers
│   ├── get-feature.query.ts
│   └── get-feature.handler.ts
├── dtos/                     # Data Transfer Objects
│   ├── create-feature.dto.ts
│   ├── feature.dto.ts
│   └── features-page-options.dto.ts
├── exceptions/               # Module-specific exceptions
│   └── feature-not-found.exception.ts
├── feature.controller.ts     # REST API controller
├── feature.service.ts        # Business logic service
├── feature.module.ts         # Module definition
├── feature.entity.ts         # Database entity
└── feature-related.entity.ts # Related entities
```

### File Naming Conventions

- Use kebab-case: `user-login.dto.ts`
- Include type in filename: `.controller.ts`, `.service.ts`, `.dto.ts`, `.entity.ts`
- Use singular names for entities: `user.entity.ts` not `users.entity.ts`
- Use descriptive names: `create-user.command.ts`, `user-not-found.exception.ts`

## Module Architecture

### Module Definition Pattern

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateUserHandler } from './commands/create-user.handler.ts';
import { GetUserHandler } from './queries/get-user.handler.ts';
import { UserController } from './user.controller.ts';
import { UserEntity } from './user.entity.ts';
import { UserService } from './user.service.ts';
import { UserSettingsEntity } from './user-settings.entity.ts';

const handlers = [CreateUserHandler, GetUserHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([UserEntity, UserSettingsEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, ...handlers],
  exports: [UserService],
})
export class UserModule {}
```

## Controllers

### Controller Structure Pattern

```typescript
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto.ts';
import { RoleType } from '../../constants/role-type.ts';
import { ApiPageResponse } from '../../decorators/api-page-response.decorator.ts';
import { AuthUser } from '../../decorators/auth-user.decorator.ts';
import { Auth, UUIDParam } from '../../decorators/http.decorators.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UsersPageOptionsDto } from './dtos/users-page-options.dto.ts';
import { UserEntity } from './user.entity.ts';
import { UserService } from './user.service.ts';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private userService: UserService,
    private translationService: TranslationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.ADMIN])
  @ApiOkResponse({ type: UserDto, description: 'User created successfully' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER])
  @ApiOkResponse({ type: UserDto, description: 'Get user by ID' })
  async getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
    return this.userService.getUser(userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER])
  @ApiPageResponse({
    description: 'Get paginated users list',
    type: PageDto,
  })
  async getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto);
  }
}
```

### Controller Best Practices

1. **Use dependency injection via constructor**
2. **Mark injected services as `private`**
3. **Use specific HTTP status codes with `@HttpCode()`**
4. **Apply authentication/authorization with `@Auth()` decorator**
5. **Use comprehensive Swagger documentation**
6. **Use ValidationPipe for query parameters**
7. **Use custom decorators like `@UUIDParam()` for parameter validation**
8. **Keep controllers thin - delegate business logic to services**
9. **Use versioning when needed with `@Version()`**
10. **Return DTOs, not entities**
11. **🚨 CRITICAL: Follow REST API standards strictly for all endpoints**

### REST API Standards

All controllers MUST follow these REST API conventions:

**HTTP Methods & Status Codes:**
```typescript
// Resource Creation
@Post()                    // 201 Created
@HttpCode(HttpStatus.CREATED)

// Resource Retrieval
@Get()                     // 200 OK (list)
@Get(':id')               // 200 OK (single)
@HttpCode(HttpStatus.OK)

// Resource Update
@Put(':id')               // 200 OK (full update)
@Patch(':id')             // 200 OK (partial update)
@HttpCode(HttpStatus.OK)

// Resource Deletion
@Delete(':id')            // 204 No Content
@HttpCode(HttpStatus.NO_CONTENT)
```

**URL Naming Conventions:**
```typescript
// ✅ CORRECT: Use plural nouns
@Controller('users')         // /users
@Controller('posts')         // /posts
@Controller('categories')    // /categories

// ❌ WRONG: Don't use verbs or singular
@Controller('user')          // ❌ singular
@Controller('getUsers')      // ❌ verb in URL
@Controller('userManagement') // ❌ management suffix
```

**Endpoint Patterns:**
```typescript
// ✅ CORRECT REST endpoints
GET    /users              // List all users
POST   /users              // Create new user
GET    /users/{id}         // Get specific user
PUT    /users/{id}         // Update entire user
PATCH  /users/{id}         // Partially update user
DELETE /users/{id}         // Delete user

// Nested resources
GET    /users/{id}/posts   // Get user's posts
POST   /users/{id}/posts   // Create post for user

// ❌ WRONG: Non-RESTful endpoints
POST   /users/create       // ❌ verb in URL
GET    /users/list         // ❌ unnecessary action
POST   /deleteUser         // ❌ wrong method + verb
GET    /users/getById/{id} // ❌ unnecessary action
```

**Query Parameters for Filtering & Pagination:**
```typescript
// ✅ CORRECT: Use query parameters
GET /users?page=1&limit=10&role=admin&search=john

@Get()
async getUsers(
  @Query() pageOptions: UsersPageOptionsDto,
): Promise<PageDto<UserDto>> {
  return this.userService.getUsers(pageOptions);
}
```

**Response Format Standards:**
```typescript
// ✅ CORRECT: Consistent response structure
// Single resource
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}

// List with pagination
{
  "data": [...],
  "meta": {
    "page": 1,
    "take": 10,
    "itemCount": 50,
    "pageCount": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}

// Error responses
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Services

### Service Structure Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageDto } from '../../common/dto/page.dto.ts';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import type { IFile } from '../../interfaces/IFile.ts';
import type { Reference } from '../../types.ts';
import { CreateUserDto } from './dtos/create-user.dto.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UsersPageOptionsDto } from './dtos/users-page-options.dto.ts';
import { UserEntity } from './user.entity.ts';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    file?: Reference<IFile>,
  ): Promise<UserEntity> {
    const userEntity = this.userRepository.create(createUserDto);

    if (file) {
      userEntity.avatar = file.key;
    }

    await this.userRepository.save(userEntity);
    return userEntity;
  }

  async findOne(findOptions: Partial<UserEntity>): Promise<UserEntity> {
    const userEntity = await this.userRepository.findOne({
      where: findOptions,
    });

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity;
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const userEntity = await this.findOne({ id: userId });
    return userEntity.toDto();
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    return items.toPageDto(pageMetaDto);
  }
}
```

### Service Best Practices

1. **Use `@Injectable()` decorator**
2. **Inject repositories with `@InjectRepository()`**
3. **Mark dependencies as `private`**
4. **Create separate methods for finding entities vs returning DTOs**
5. **Throw custom exceptions for not found cases**
6. **Use TypeORM query builders for complex queries**
7. **Return DTOs from public methods, entities from private/internal methods**
8. **Use pagination for list endpoints**
9. **Handle transactions when needed**

## DTOs and Validation

### Input DTO Pattern

```typescript
import {
  EmailField,
  PasswordField,
  PhoneFieldOptional,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class CreateUserDto {
  @StringField()
  firstName!: string;

  @StringField()
  lastName!: string;

  @EmailField()
  email!: string;

  @PasswordField({ minLength: 6 })
  password!: string;

  @PhoneFieldOptional()
  phone?: string;
}
```

### Response DTO Pattern

```typescript
import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import {
  BooleanFieldOptional,
  EmailFieldOptional,
  EnumFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';

export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  @PhoneFieldOptional({ nullable: true })
  phone?: string | null;

  @BooleanFieldOptional()
  isActive?: boolean;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.email = user.email;
    this.phone = user.phone;
    this.isActive = options?.isActive;
  }
}
```

### Custom Field Decorators

The project uses custom field decorators that combine validation and Swagger documentation:

```typescript
// String fields
@StringField()                           // Required string, min length 1
@StringFieldOptional()                   // Optional string
@StringField({ minLength: 3, maxLength: 50 })  // With constraints

// Email fields
@EmailField()                            // Required email
@EmailFieldOptional()                    // Optional email

// Password fields
@PasswordField({ minLength: 6 })         // Required password
@PasswordFieldOptional()                 // Optional password

// Phone fields
@PhoneField()                            // Required phone
@PhoneFieldOptional()                    // Optional phone

// Boolean fields
@BooleanField()                          // Required boolean
@BooleanFieldOptional()                  // Optional boolean

// Enum fields
@EnumField(() => RoleType)               // Required enum
@EnumFieldOptional(() => RoleType)       // Optional enum

// UUID fields
@UUIDField()                             // Required UUID
@UUIDFieldOptional()                     // Optional UUID

// Number fields
@NumberField()                           // Required number
@NumberFieldOptional()                   // Optional number
@NumberField({ min: 0, max: 100, int: true })  // With constraints

// Date fields
@DateField()                             // Required date
@DateFieldOptional()                     // Optional date

// URL fields
@URLField()                              // Required URL
@URLFieldOptional()                      // Optional URL

// Class fields
@ClassField(() => UserDto)              // Required class field
@ClassField(() => TokenPayloadDto)      // Required class field

// Enum fields
@EnumField(() => RoleType)               // Required enum
@EnumFieldOptional(() => RoleType)       // Optional enum

// Array Fields
@StringField({ each: true })
@StringFieldOptional({ each: true })
@StringField({ each: true, minLength: 3, maxLength: 50 })
@StringFieldOptional({ each: true, minLength: 3, maxLength: 50 })
@ClassField(() => UserDto, { each: true })
@ClassFieldOptional(() => TokenPayloadDto, { each: true })
@EnumField(() => RoleType, { each: true })
@EnumFieldOptional(() => RoleType, { each: true })
@NumberField({ each: true })
@NumberFieldOptional({ each: true })
@NumberField({ each: true, min: 0, max: 100, int: true })
@NumberFieldOptional({ each: true, min: 0, max: 100, int: true })
@DateField({ each: true })
```

### DTO Best Practices

1. **Do not use `readonly` for all input DTO properties**
2. **Extend `AbstractDto` for response DTOs**
3. **Use custom field decorators for validation and Swagger documentation**
4. **Use optional fields with proper typing (`?` and `| null`)**
5. **Implement constructor for response DTOs that maps from entities**
6. **Use options type for additional DTO construction parameters**
7. **Use definite assignment assertion (`!`) for required fields**

## Entities

### Entity Structure Pattern

```typescript
import { Column, Entity, OneToMany, OneToOne, VirtualColumn } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { PostEntity } from '../post/post.entity.ts';
import type { UserDtoOptions } from './dtos/user.dto.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UserSettingsEntity } from './user-settings.entity.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role!: RoleType;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  phone!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar!: string | null;

  @VirtualColumn({
    query: (alias) =>
      `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
  })
  fullName!: string;

  @OneToOne(() => UserSettingsEntity, (userSettings) => userSettings.user)
  settings?: UserSettingsEntity;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts?: PostEntity[];
}
```

### Entity Best Practices

1. **Extend `AbstractEntity` for common fields (id, createdAt, updatedAt)**
2. **Use `@UseDto()` decorator to link entity with its DTO**
3. **Use explicit column types: `type: 'varchar'`, `type: 'enum'`**
4. **Use definite assignment assertion (`!`) for all properties**
5. **Use proper nullable typing: `string | null` for nullable columns**
6. **Use `@VirtualColumn` for computed fields**
7. **Define relationships with proper decorators**
8. **Use table names in plural: `{ name: 'users' }`**
9. **🚨 CRITICAL: Each entity must belong to only ONE module - do not share entities across multiple modules**

### Entity Module Ownership Rules

- **One entity per module**: Every entity must be owned by exactly one feature module
- **No cross-module entity sharing**: Do not import or use entities from other modules
- **Use services for cross-module communication**: If you need data from another module, use their service methods
- **Create dedicated entities**: If similar data structures are needed, create separate entities per module
- **Exception for shared entities**: Only `AbstractEntity` and entities in `src/common/` can be shared

Example of correct entity organization:
```
modules/user/
├── user.entity.ts          ✅ Owned by user module
└── user-settings.entity.ts ✅ Owned by user module

modules/post/
├── post.entity.ts          ✅ Owned by post module
└── post-category.entity.ts ✅ Owned by post module

// ❌ WRONG: Don't do this
modules/post/
├── post.entity.ts
└── user.entity.ts          ❌ User entity belongs to user module

// ✅ CORRECT: Use services for cross-module data
@Injectable()
export class PostService {
  constructor(
    private userService: UserService, // ✅ Use service, not entity
  ) {}
}
```

## CQRS Pattern

### Command Structure

```typescript
// Command definition
import type { ICommand } from '@nestjs/cqrs';
import type { CreatePostDto } from '../dtos/create-post.dto.ts';

export class CreatePostCommand implements ICommand {
  constructor(
    public userId: Uuid,
    public createPostDto: CreatePostDto,
  ) {}
}
```

### Command Handler Structure

```typescript
// Command handler
import type { ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PostEntity } from '../post.entity.ts';
import { CreatePostCommand } from './create-post.command.ts';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, PostEntity>
{
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  async execute(command: CreatePostCommand): Promise<PostEntity> {
    const { userId, createPostDto } = command;
    const postEntity = this.postRepository.create({ userId });

    await this.postRepository.save(postEntity);
    return postEntity;
  }
}
```

### Query Structure

```typescript
// Query definition
import type { IQuery } from '@nestjs/cqrs';

export class GetUserQuery implements IQuery {
  constructor(public userId: Uuid) {}
}

// Query handler
import type { IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private userService: UserService) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    return this.userService.getUser(query.userId);
  }
}
```

### CQRS Best Practices

1. **Use commands for write operations**
2. **Use queries for read operations**
3. **Keep commands and queries simple**
4. **Register handlers in module providers**
5. **Use proper typing with generics**
6. **Separate command/query definitions from handlers**

## Authentication and Authorization

### Auth Decorator Usage

```typescript
// Role-based authentication
@Auth([RoleType.ADMIN])                  // Admin only
@Auth([RoleType.USER])                   // User only
@Auth([RoleType.USER, RoleType.ADMIN])   // User or Admin

// Get current user
@AuthUser() user: UserEntity             // Inject current user

// Public endpoints (no @Auth decorator)
@Post('login')                           // Public login endpoint
```

### JWT Token Structure

```typescript
// Token payload interface
export class TokenPayloadDto {
  @NumberField()
  expiresIn: number;

  @StringField()
  token: string;
}
// Token creation
const token = await this.authService.createAccessToken({
  userId: userEntity.id,
  role: userEntity.role,
});
```

## Exception Handling

### Custom Exception Pattern

```typescript
import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.userNotFound', error);
  }
}
```

## Configuration and Environment

### Environment Variables Pattern

```typescript
// Use UPPERCASE for environment variables
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

// Access in code
process.env.DATABASE_URL
process.env.JWT_SECRET
```

### Configuration Service Pattern

```typescript
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get postgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    };
  }
}
```


## Summary

This NestJS boilerplate follows modern TypeScript and NestJS best practices with:

- **Strict typing** throughout the codebase
- **Modular architecture** with clear separation of concerns
- **CQRS pattern** for scalable command/query operations
- **Custom decorators** for validation and documentation
- **Comprehensive error handling** with custom exceptions
- **JWT-based authentication** with role-based authorization
- **Swagger documentation** auto-generated from decorators
- **ESM modules** with explicit .ts extensions
- **Comprehensive testing** setup with Jest

Use this guide as the definitive reference for all code generation and development work on this project.
