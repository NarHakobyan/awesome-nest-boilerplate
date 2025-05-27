# Testing Guide

This guide covers testing practices and patterns used in the Awesome NestJS Boilerplate, including unit tests, integration tests, and end-to-end testing strategies.

- [Testing Guide](#testing-guide)
  - [Overview](#overview)
  - [Test Configuration](#test-configuration)
  - [Test Structure](#test-structure)
  - [Unit Tests](#unit-tests)
    - [Service Testing](#service-testing)
    - [Controller Testing](#controller-testing)
    - [CQRS Handler Testing](#cqrs-handler-testing)
  - [Integration Tests](#integration-tests)
    - [Module Integration Testing](#module-integration-testing)
    - [Database Integration Testing](#database-integration-testing)
  - [E2E Tests](#e2e-tests)
    - [API Endpoint Testing](#api-endpoint-testing)
    - [Authentication Flow Testing](#authentication-flow-testing)
  - [Running Tests](#running-tests)
  - [Test Database Setup](#test-database-setup)
  - [Mocking Strategies](#mocking-strategies)
    - [Repository Mocks](#repository-mocks)
    - [Service Mocks](#service-mocks)
    - [External Service Mocks](#external-service-mocks)
  - [Test Data Factories](#test-data-factories)
  - [Testing Best Practices](#testing-best-practices)
    - [1. Test Organization](#1-test-organization)
    - [2. Mock Management](#2-mock-management)
    - [3. Test Data](#3-test-data)
    - [4. Async Testing](#4-async-testing)
    - [5. Coverage Goals](#5-coverage-goals)
  - [Continuous Integration](#continuous-integration)

## Overview

The project uses Jest as the primary testing framework with TypeScript support. The testing strategy includes:

- **Unit Tests**: Testing individual components in isolation
- **Integration Tests**: Testing module interactions and database operations
- **End-to-End Tests**: Testing complete API workflows

## Test Configuration

Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

## Test Structure

```
project-root/
├── src/
│   └── modules/
│       └── feature/
│           ├── __tests__/
│           │   ├── feature.service.spec.ts
│           │   ├── feature.controller.spec.ts
│           │   └── feature.handler.spec.ts
│           ├── feature.service.ts
│           └── feature.controller.ts
└── test/
    ├── e2e/
    │   ├── auth.e2e-spec.ts
    │   ├── user.e2e-spec.ts
    │   └── post.e2e-spec.ts
    └── jest-e2e.json
```

## Unit Tests

Unit tests focus on testing individual components in isolation using mocks for dependencies.

### Service Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';

import { PostService } from '../post.service';
import { PostEntity } from '../post.entity';
import { PostNotFoundException } from '../exceptions/post-not-found.exception';
import { CreatePostDto } from '../dtos/create-post.dto';

describe('PostService', () => {
  let service: PostService;
  let repository: Repository<PostEntity>;
  let commandBus: CommandBus;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockRepository,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    repository = module.get<Repository<PostEntity>>(getRepositoryToken(PostEntity));
    commandBus = module.get<CommandBus>(CommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSinglePost', () => {
    it('should return a post when found', async () => {
      // Arrange
      const postId = 'uuid-123';
      const expectedPost = { id: postId, title: 'Test Post' } as PostEntity;

      mockRepository.createQueryBuilder().getOne.mockResolvedValue(expectedPost);

      // Act
      const result = await service.getSinglePost(postId);

      // Assert
      expect(result).toEqual(expectedPost);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw PostNotFoundException when post not found', async () => {
      // Arrange
      const postId = 'non-existent-uuid';
      mockRepository.createQueryBuilder().getOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSinglePost(postId)).rejects.toThrow(PostNotFoundException);
    });
  });

  describe('createPost', () => {
    it('should create a post using command bus', async () => {
      // Arrange
      const userId = 'user-uuid';
      const createPostDto: CreatePostDto = {
        title: [{ languageCode: 'en', text: 'Test Title' }],
        description: [{ languageCode: 'en', text: 'Test Description' }],
      };
      const expectedPost = { id: 'post-uuid' } as PostEntity;

      mockCommandBus.execute.mockResolvedValue(expectedPost);

      // Act
      const result = await service.createPost(userId, createPostDto);

      // Assert
      expect(result).toEqual(expectedPost);
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          createPostDto,
        })
      );
    });
  });
});
```

### Controller Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { PostController } from '../post.controller';
import { PostService } from '../post.service';
import { UserEntity } from '../../user/user.entity';
import { CreatePostDto } from '../dtos/create-post.dto';
import { PostDto } from '../dtos/post.dto';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPostService = {
    createPost: jest.fn(),
    getSinglePost: jest.fn(),
    getAllPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post and return DTO', async () => {
      // Arrange
      const user = { id: 'user-uuid' } as UserEntity;
      const createPostDto: CreatePostDto = {
        title: [{ languageCode: 'en', text: 'Test Title' }],
        description: [{ languageCode: 'en', text: 'Test Description' }],
      };
      const postEntity = {
        id: 'post-uuid',
        toDto: jest.fn().mockReturnValue({ id: 'post-uuid' } as PostDto),
      };

      mockPostService.createPost.mockResolvedValue(postEntity);

      // Act
      const result = await controller.createPost(createPostDto, user);

      // Assert
      expect(result).toEqual({ id: 'post-uuid' });
      expect(mockPostService.createPost).toHaveBeenCalledWith(user.id, createPostDto);
      expect(postEntity.toDto).toHaveBeenCalled();
    });
  });

  describe('getSinglePost', () => {
    it('should return a post DTO', async () => {
      // Arrange
      const postId = 'post-uuid';
      const postEntity = {
        toDto: jest.fn().mockReturnValue({ id: postId } as PostDto),
      };

      mockPostService.getSinglePost.mockResolvedValue(postEntity);

      // Act
      const result = await controller.getSinglePost(postId);

      // Assert
      expect(result).toEqual({ id: postId });
      expect(mockPostService.getSinglePost).toHaveBeenCalledWith(postId);
    });
  });
});
```

### CQRS Handler Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostHandler } from '../commands/create-post.handler';
import { CreatePostCommand } from '../commands/create-post.command';
import { PostEntity } from '../post.entity';
import { PostTranslationEntity } from '../post-translation.entity';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;
  let postRepository: Repository<PostEntity>;
  let translationRepository: Repository<PostTranslationEntity>;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTranslationRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostHandler,
        {
          provide: getRepositoryToken(PostEntity),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(PostTranslationEntity),
          useValue: mockTranslationRepository,
        },
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
    postRepository = module.get<Repository<PostEntity>>(getRepositoryToken(PostEntity));
    translationRepository = module.get<Repository<PostTranslationEntity>>(
      getRepositoryToken(PostTranslationEntity)
    );
  });

  describe('execute', () => {
    it('should create post with translations', async () => {
      // Arrange
      const command = new CreatePostCommand('user-uuid', {
        title: [{ languageCode: 'en', text: 'Test Title' }],
        description: [{ languageCode: 'en', text: 'Test Description' }],
      });

      const postEntity = { id: 'post-uuid' } as PostEntity;
      const translationEntity = { id: 'translation-uuid' } as PostTranslationEntity;

      mockPostRepository.create.mockReturnValue(postEntity);
      mockPostRepository.save.mockResolvedValue(postEntity);
      mockTranslationRepository.create.mockReturnValue(translationEntity);
      mockTranslationRepository.save.mockResolvedValue([translationEntity]);

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toEqual(postEntity);
      expect(mockPostRepository.create).toHaveBeenCalledWith({ userId: 'user-uuid' });
      expect(mockPostRepository.save).toHaveBeenCalledWith(postEntity);
      expect(mockTranslationRepository.save).toHaveBeenCalled();
    });
  });
});
```

## Integration Tests

Integration tests verify that different parts of the application work together correctly.

### Module Integration Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PostModule } from '../post.module';
import { PostService } from '../post.service';
import { PostEntity } from '../post.entity';
import { PostTranslationEntity } from '../post-translation.entity';

describe('Post Module Integration', () => {
  let module: TestingModule;
  let service: PostService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PostEntity, PostTranslationEntity],
          synchronize: true,
          logging: false,
        }),
        PostModule,
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and retrieve a post', async () => {
    // This test would require proper setup with user authentication
    // and complete module dependencies
  });
});
```

### Database Integration Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserEntity } from '../user.entity';
import { UserSettingsEntity } from '../user-settings.entity';

describe('User Entity Integration', () => {
  let module: TestingModule;
  let userRepository: Repository<UserEntity>;
  let settingsRepository: Repository<UserSettingsEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity, UserSettingsEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserEntity, UserSettingsEntity]),
      ],
    }).compile();

    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    settingsRepository = module.get<Repository<UserSettingsEntity>>(
      getRepositoryToken(UserSettingsEntity)
    );
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create user with settings relationship', async () => {
    // Arrange
    const user = userRepository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    });

    // Act
    const savedUser = await userRepository.save(user);
    const settings = settingsRepository.create({
      userId: savedUser.id,
      isEmailVerified: true,
    });
    await settingsRepository.save(settings);

    // Assert
    const userWithSettings = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['settings'],
    });

    expect(userWithSettings).toBeDefined();
    expect(userWithSettings!.settings).toBeDefined();
    expect(userWithSettings!.settings!.isEmailVerified).toBe(true);
  });
});
```

## E2E Tests

End-to-end tests verify the entire application flow from HTTP request to response.

### API Endpoint Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';
import { CreateUserDto } from '../../src/modules/user/dtos/create-user.dto';

describe('User API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup authentication token for protected routes
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password',
      })
      .expect(200);

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.firstName).toBe(createUserDto.firstName);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should return validation error for invalid email', () => {
      const invalidUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserDto)
        .expect(422);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user by id', async () => {
      // First create a user
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      // Then retrieve the user
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe('jane.smith@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### Authentication Flow Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.token).toBeDefined();
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Protected routes', () => {
    it('should reject requests without token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should accept requests with valid token', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      const token = loginResponse.body.token;

      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
```

## Running Tests

```bash
# Run all unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run e2e tests
yarn test:e2e

# Run specific test file
yarn test user.service.spec.ts

# Run tests with debugging
yarn test:debug

# Run tests matching pattern
yarn test --testNamePattern="should create"
```

## Test Database Setup

For integration and e2e tests, use a separate test database:

```typescript
// test/setup.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
  dropSchema: true,
};
```

## Mocking Strategies

### Repository Mocks

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
});
```

### Service Mocks

```typescript
const mockUserService = {
  createUser: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findUserByEmail: jest.fn(),
};
```

### External Service Mocks

```typescript
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
  getString: jest.fn(),
  getNumber: jest.fn(),
  getBoolean: jest.fn(),
};
```

## Test Data Factories

Create reusable test data factories:

```typescript
// test/factories/user.factory.ts
import { UserEntity } from '../../src/modules/user/user.entity';
import { RoleType } from '../../src/constants/role-type';

export class UserFactory {
  static create(overrides: Partial<UserEntity> = {}): UserEntity {
    const user = new UserEntity();
    user.id = overrides.id || 'test-uuid';
    user.firstName = overrides.firstName || 'John';
    user.lastName = overrides.lastName || 'Doe';
    user.email = overrides.email || 'john.doe@example.com';
    user.role = overrides.role || RoleType.USER;
    user.createdAt = overrides.createdAt || new Date();
    user.updatedAt = overrides.updatedAt || new Date();

    return Object.assign(user, overrides);
  }

  static createMany(count: number, overrides: Partial<UserEntity> = {}): UserEntity[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, email: `user${index}@example.com` })
    );
  }
}
```

## Testing Best Practices

### 1. Test Organization
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Follow the Arrange-Act-Assert (AAA) pattern
- Keep tests focused and test one thing at a time

### 2. Mock Management
- Clear mocks between tests using `jest.clearAllMocks()`
- Use specific mocks for each test case
- Verify mock calls with `expect().toHaveBeenCalledWith()`

### 3. Test Data
- Use factories for creating test data
- Keep test data minimal and focused
- Use meaningful test data that reflects real scenarios

### 4. Async Testing
- Always use `async/await` for asynchronous operations
- Test both success and error scenarios
- Use `expect.assertions()` for async error testing

### 5. Coverage Goals
- Aim for high test coverage (>80%)
- Focus on business logic and critical paths
- Don't sacrifice test quality for coverage numbers

## Continuous Integration

Configure GitHub Actions for automated testing:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run unit tests
        run: yarn test:cov

      - name: Run e2e tests
        run: yarn test:e2e
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: test_db

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```
