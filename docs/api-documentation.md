# API Documentation

This guide covers the API documentation practices and standards used in the Awesome NestJS Boilerplate, including Swagger/OpenAPI integration, authentication patterns, and RESTful API design principles.

- [API Documentation](#api-documentation)
  - [OpenAPI (Swagger) Documentation](#openapi-swagger-documentation)
    - [Accessing the Documentation](#accessing-the-documentation)
    - [Swagger Configuration](#swagger-configuration)
  - [API Structure](#api-structure)
    - [Base URL and Versioning](#base-url-and-versioning)
    - [Content Types](#content-types)
  - [Authentication](#authentication)
    - [JWT Authentication](#jwt-authentication)
    - [Protected Endpoints](#protected-endpoints)
  - [API Endpoints](#api-endpoints)
    - [Authentication Endpoints](#authentication-endpoints)
      - [POST /auth/login](#post-authlogin)
      - [POST /auth/register](#post-authregister)
    - [User Management](#user-management)
      - [GET /users/:id](#get-usersid)
      - [GET /users](#get-users)
    - [Post Management](#post-management)
      - [POST /posts](#post-posts)
      - [GET /posts/:id](#get-postsid)
    - [Health Check](#health-check)
      - [GET /health](#get-health)
  - [Request/Response Patterns](#requestresponse-patterns)
    - [Standard Response Format](#standard-response-format)
    - [Pagination](#pagination)
    - [Error Responses](#error-responses)
  - [DTOs and Validation](#dtos-and-validation)
    - [Input DTOs](#input-dtos)
    - [Response DTOs](#response-dtos)
    - [Validation Decorators](#validation-decorators)
  - [Error Handling](#error-handling)
    - [HTTP Status Codes](#http-status-codes)
    - [Error Response Format](#error-response-format)
  - [Security](#security)
    - [CORS Configuration](#cors-configuration)
    - [Rate Limiting](#rate-limiting)
    - [Input Validation](#input-validation)
  - [Internationalization](#internationalization)
  - [API Testing](#api-testing)
    - [Using Swagger UI](#using-swagger-ui)
    - [Using cURL](#using-curl)
    - [Using Postman](#using-postman)
  - [Best Practices](#best-practices)
    - [API Design](#api-design)
    - [Documentation](#documentation)
    - [Security](#security-1)
    - [Performance](#performance)
    - [Error Handling](#error-handling-1)
    - [Testing](#testing)

## OpenAPI (Swagger) Documentation

The API is documented using OpenAPI 3.0 specifications with automatic generation from NestJS decorators and DTOs.

### Accessing the Documentation

When the application is running in development mode:

- **Swagger UI**: `http://localhost:3000/documentation`
- **OpenAPI JSON**: `http://localhost:3000/documentation-json`
- **OpenAPI YAML**: `http://localhost:3000/documentation-yaml`

### Swagger Configuration

The Swagger setup is configured in `src/setup-swagger.ts`:

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Awesome NestJS Boilerplate API')
    .setDescription('RESTful API built with NestJS, TypeScript, and PostgreSQL')
    .setVersion('11.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('posts', 'Post management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
```

## API Structure

### Base URL and Versioning

- **Base URL**: `http://localhost:3000`
- **API Versioning**: Enabled through NestJS versioning
- **Global Prefix**: Can be configured (currently no global prefix)

### Content Types

- **Request Content-Type**: `application/json`
- **Response Content-Type**: `application/json`
- **Character Encoding**: UTF-8

## Authentication

### JWT Authentication

The API uses JWT (JSON Web Tokens) for stateless authentication:

```typescript
// Authentication header format
Authorization: Bearer <jwt_token>
```

**Token Structure**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Protected Endpoints

Most endpoints require authentication using the `@Auth()` decorator:

```typescript
@Controller('users')
@ApiTags('users')
export class UserController {
  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOkResponse({ type: UserDto })
  async getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
    return this.userService.getUser(userId);
  }
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/register
Register a new user account.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management

#### GET /users/:id
Get user by ID (requires authentication).

**Parameters**:
- `id` (UUID): User identifier

**Response**:
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "role": "USER",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### GET /users
Get paginated list of users (requires ADMIN role).

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `take` (number, optional): Items per page (default: 10)
- `order` (string, optional): Sort order (ASC/DESC)

### Post Management

#### POST /posts
Create a new post (requires authentication).

**Request Body**:
```json
{
  "title": [
    {
      "languageCode": "en",
      "text": "Post Title"
    }
  ],
  "description": [
    {
      "languageCode": "en",
      "text": "Post description"
    }
  ]
}
```

#### GET /posts/:id
Get post by ID.

**Response**:
```json
{
  "id": "uuid",
  "title": "Post Title",
  "description": "Post description",
  "translations": [
    {
      "languageCode": "en",
      "title": "Post Title",
      "description": "Post description"
    }
  ],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Health Check

#### GET /health
Check application health status.

**Response**:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

## Request/Response Patterns

### Standard Response Format

All API responses follow a consistent structure:

**Success Response**:
```json
{
  "data": { /* response data */ },
  "meta": { /* metadata (for paginated responses) */ }
}
```

**Single Resource**:
```json
{
  "id": "uuid",
  "name": "Resource Name",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Pagination

Paginated endpoints use the following structure:

**Request Query Parameters**:
```
GET /users?page=1&take=10&order=ASC
```

**Paginated Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "User 1"
    }
  ],
  "meta": {
    "page": 1,
    "take": 10,
    "itemCount": 2,
    "pageCount": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

### Error Responses

All error responses follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

## DTOs and Validation

### Input DTOs

Input DTOs use custom validation decorators:

```typescript
export class CreateUserDto {
  @StringField({ minLength: 2, maxLength: 50 })
  readonly firstName!: string;

  @StringField({ minLength: 2, maxLength: 50 })
  readonly lastName!: string;

  @EmailField()
  readonly email!: string;

  @StringField({ minLength: 6 })
  readonly password!: string;

  @PhoneFieldOptional()
  readonly phone?: string;
}
```

### Response DTOs

Response DTOs extend `AbstractDto` for consistent structure:

```typescript
export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
  }
}
```

### Validation Decorators

Custom validation decorators provide both validation and Swagger documentation:

```typescript
// String validation
@StringField({ minLength: 3, maxLength: 50 })
name!: string;

// Email validation
@EmailField()
email!: string;

// Number validation
@NumberField({ min: 0, max: 100 })
age!: number;

// Boolean validation
@BooleanField()
isActive!: boolean;

// UUID validation
@UUIDField()
id!: string;

// Optional fields
@StringFieldOptional()
description?: string;

// Array validation
@StringField({ each: true })
tags!: string[];
```

## Error Handling

### HTTP Status Codes

The API uses standard HTTP status codes:

- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

### Error Response Format

```typescript
// Validation error (422)
{
  "statusCode": 422,
  "message": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ],
  "error": "Unprocessable Entity"
}

// Not found error (404)
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}

// Unauthorized error (401)
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Security

### CORS Configuration

CORS is configured to allow specific origins:

```typescript
// main.ts
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }
});
```

### Rate Limiting

Rate limiting is implemented using `@nestjs/throttler`:

```typescript
// Default configuration
{
  ttl: 60, // Time window in seconds
  limit: 10 // Maximum requests per time window
}
```

### Input Validation

All input is validated using:
- **Class-validator**: DTO validation
- **Class-transformer**: Data transformation
- **Custom validators**: Business logic validation

## Internationalization

The API supports multiple languages through the `Accept-Language` header or `lang` query parameter:

```http
GET /posts
Accept-Language: en-US

# or

GET /posts?lang=en
```

Supported languages:
- `en` (English)
- `ru` (Russian)

## API Testing

### Using Swagger UI

1. Navigate to `http://localhost:3000/documentation`
2. Click "Authorize" and enter your JWT token
3. Test endpoints directly from the interface

### Using cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get user (with token)
curl -X GET http://localhost:3000/users/uuid \
  -H "Authorization: Bearer your-jwt-token"

# Create post
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": [{"languageCode": "en", "text": "My Post"}],
    "description": [{"languageCode": "en", "text": "Post description"}]
  }'
```

### Using Postman

1. Import the OpenAPI specification from `http://localhost:3000/documentation-json`
2. Set up environment variables for base URL and authentication token
3. Use the pre-configured requests

## Best Practices

### API Design
1. **RESTful URLs**: Use nouns for resources, verbs for actions
2. **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. **Status Codes**: Return meaningful HTTP status codes
4. **Versioning**: Plan for API versioning from the start

### Documentation
1. **Swagger Decorators**: Use comprehensive Swagger decorators
2. **Examples**: Provide request/response examples
3. **Descriptions**: Write clear endpoint descriptions
4. **Tags**: Group related endpoints with tags

### Security
1. **Authentication**: Require authentication for sensitive endpoints
2. **Authorization**: Implement role-based access control
3. **Validation**: Validate all input data
4. **Rate Limiting**: Implement rate limiting to prevent abuse

### Performance
1. **Pagination**: Implement pagination for list endpoints
2. **Filtering**: Allow filtering and sorting of results
3. **Caching**: Implement appropriate caching strategies
4. **Compression**: Enable response compression

### Error Handling
1. **Consistent Format**: Use consistent error response format
2. **Meaningful Messages**: Provide clear error messages
3. **Logging**: Log errors for debugging
4. **Graceful Degradation**: Handle errors gracefully

### Testing
1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test API endpoints
3. **E2E Tests**: Test complete user workflows
4. **Documentation Tests**: Ensure documentation matches implementation
