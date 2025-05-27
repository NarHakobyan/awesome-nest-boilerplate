# Testing Guide

This guide covers testing practices and patterns used in the Awesome NestJS Boilerplate.

- [Testing Guide](#testing-guide)
  - [Overview](#overview)
  - [Test Structure](#test-structure)
  - [Unit Tests](#unit-tests)
    - [Writing Unit Tests](#writing-unit-tests)
    - [Best Practices for Unit Tests](#best-practices-for-unit-tests)
  - [Integration Tests](#integration-tests)
    - [Example Integration Test](#example-integration-test)
  - [E2E Tests](#e2e-tests)
    - [Example E2E Test](#example-e2e-test)
  - [Running Tests](#running-tests)
  - [Test Database Setup](#test-database-setup)
  - [Mocking Strategies](#mocking-strategies)
    - [Service Mocks](#service-mocks)
    - [Repository Mocks](#repository-mocks)
    - [JWT Service Mocks](#jwt-service-mocks)
  - [Test Data Factories](#test-data-factories)
  - [Continuous Integration](#continuous-integration)
  - [Best Practices Summary](#best-practices-summary)

## Overview

The project uses Jest as the testing framework and supports multiple types of tests:
- Unit Tests
- Integration Tests
- End-to-End (E2E) Tests

## Test Structure

```
project-root/
├── src/
│   └── modules/
│       └── feature/
│           ├── __tests__/
│           │   ├── feature.service.spec.ts
│           │   └── feature.controller.spec.ts
│           └── feature.module.ts
└── test/
    └── e2e/
        └── feature.e2e-spec.ts
```

## Unit Tests

Unit tests focus on testing individual components in isolation.

### Writing Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 1, name: 'Test User' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      expect(await service.findOne(1)).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith(1);
    });
  });
});
```

### Best Practices for Unit Tests

1. **Test Organization**
   - Group related tests using `describe` blocks
   - Use clear test descriptions with `it` blocks
   - Follow the Arrange-Act-Assert pattern

2. **Mocking**
   - Mock external dependencies
   - Use Jest's mock functions
   - Avoid testing implementation details

3. **Coverage**
   - Aim for high test coverage
   - Focus on business logic
   - Test edge cases and error scenarios

## Integration Tests

Integration tests verify that different parts of the application work together correctly.

### Example Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';

describe('User Integration', () => {
  let module: TestingModule;
  let service: UserService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        UserModule,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create and retrieve a user', async () => {
    const user = await service.create({
      email: 'test@example.com',
      password: 'password',
    });

    const found = await service.findOne(user.id);
    expect(found).toBeDefined();
    expect(found.email).toBe('test@example.com');
  });
});
```

## E2E Tests

E2E tests verify the entire application flow from start to finish.

### Example E2E Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password',
      })
      .expect(201)
      .expect(res => {
        expect(res.body.email).toBe('test@example.com');
        expect(res.body.password).toBeUndefined();
      });
  });
});
```

## Running Tests

```bash
# Run unit tests
yarn test

# Run unit tests with coverage
yarn test:cov

# Run e2e tests
yarn test:e2e

# Run tests in watch mode
yarn test:watch
```

## Test Database Setup

For integration and E2E tests that require a database:

1. **Use In-Memory Database**
   ```typescript
   TypeOrmModule.forRoot({
     type: 'sqlite',
     database: ':memory:',
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
     synchronize: true,
   })
   ```

2. **Use Test Database**
   ```typescript
   TypeOrmModule.forRoot({
     type: 'postgres',
     host: process.env.TEST_DB_HOST,
     port: parseInt(process.env.TEST_DB_PORT, 10),
     username: process.env.TEST_DB_USERNAME,
     password: process.env.TEST_DB_PASSWORD,
     database: process.env.TEST_DB_DATABASE,
     entities: [__dirname + '/**/*.entity{.ts,.js}'],
     synchronize: true,
   })
   ```

## Mocking Strategies

### Service Mocks

```typescript
const mockUserService = {
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
```

### Repository Mocks

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
```

### JWT Service Mocks

```typescript
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
```

## Test Data Factories

Use factories to create test data:

```typescript
import { Factory } from 'fishery';
import { User } from './user.entity';

export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: sequence,
  email: `user${sequence}@example.com`,
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
}));
```

## Continuous Integration

The project uses GitHub Actions for CI/CD:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16.x'
    - run: yarn install
    - run: yarn test
    - run: yarn test:e2e
```

## Best Practices Summary

1. **Test Organization**
   - Keep tests close to the code they're testing
   - Use meaningful descriptions
   - Follow consistent naming conventions

2. **Test Quality**
   - Test both success and error cases
   - Use appropriate assertions
   - Avoid test interdependence

3. **Performance**
   - Use fast, in-memory databases when possible
   - Clean up test data after each test
   - Optimize test execution time

4. **Maintenance**
   - Keep tests simple and readable
   - Update tests when requirements change
   - Document special test setup requirements
