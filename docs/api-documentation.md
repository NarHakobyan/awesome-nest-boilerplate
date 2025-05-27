# API Documentation

This guide covers the API documentation practices and standards used in the Awesome NestJS Boilerplate. You follow RESTful API design principles.

- [API Documentation](#api-documentation)
  - [OpenAPI (Swagger) Documentation](#openapi-swagger-documentation)
    - [Accessing the Documentation](#accessing-the-documentation)
  - [API Versioning](#api-versioning)
  - [Authentication](#authentication)
    - [JWT Authentication](#jwt-authentication)
  - [Request/Response Examples](#requestresponse-examples)
    - [User Endpoints](#user-endpoints)
      - [Create User](#create-user)
      - [Get User](#get-user)
  - [DTOs and Entities](#dtos-and-entities)
    - [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
    - [Response Entities](#response-entities)
  - [Error Handling](#error-handling)
    - [Exception Filters](#exception-filters)
    - [API Responses](#api-responses)
  - [Security](#security)
    - [API Security Schemes](#api-security-schemes)
    - [Role-Based Access Control](#role-based-access-control)
  - [Pagination](#pagination)
    - [Query Parameters](#query-parameters)
    - [Paginated Response](#paginated-response)
  - [API Testing](#api-testing)
    - [Integration Tests](#integration-tests)
  - [Best Practices](#best-practices)

## OpenAPI (Swagger) Documentation

The API is documented using OpenAPI (Swagger) specifications. The documentation is automatically generated from decorators in the code.

### Accessing the Documentation

When the application is running:
- Swagger UI: `http://localhost:3000/documentation`
- OpenAPI JSON: `http://localhost:3000/documentation-json`
- OpenAPI YAML: `http://localhost:3000/documentation-yaml`

## API Versioning

The API supports versioning through header `x-api-version`

```typescript
// main.ts
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'x-api-version',
});
```

Example endpoints:
- `/users`
- `/users/1`

## Authentication

### JWT Authentication

```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiOkResponse({ description: 'Login successful' })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    // Implementation
  }

  @Post('refresh')
  @Auth([RoleType.USER])
  @ApiOkResponse({ description: 'Token refreshed' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    // Implementation
  }
}
```

## Request/Response Examples

### User Endpoints

#### Create User

```typescript
@Controller('users')
export class UserController {
  @Post()
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Implementation
  }
}

export class CreateUserDto {
  @EmailField()
  email!: string;

  @StringField()
  name!: string;

  @PasswordField()
  password!: string;
}
```

#### Get User

```typescript
export class UserController {
  @Get(':id')
  @ApiOkResponse({
    description: 'User found',
    type: UserResponseDto,
  })
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    // Implementation
  }
}
```

## DTOs and Entities

### Data Transfer Objects (DTOs)

```typescript
export class CreatePostDto {
  @StringField()
  title!: string;

  @TextAreaField()
  content!: string;

  @StringFieldOptional({
    each: true,
  })
  tags?: string[];
}
```

### Response Entities

```typescript
export class PostResponseDto {
  @UUIDField()
  id!: string;

  @StringField()
  title!: string;

  @TextAreaField()
  content!: string;

  @StringFieldOptional({
    each: true,
  })
  tags?: string[];

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;
}
```

## Error Handling

### Exception Filters

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      error: typeof error === 'string' ? { message: error } : error,
    });
  }
}
```

### API Responses

```typescript
@ApiResponse({
  status: 400,
  description: 'Bad Request',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 400 },
      message: { type: 'string', example: 'Validation failed' },
      error: { type: 'string', example: 'Bad Request' },
      timestamp: { type: 'string', example: '2023-01-01T00:00:00Z' },
      path: { type: 'string', example: '/api/v1/users' },
    },
  },
})
```

## Security

### API Security Schemes

```typescript
.addBearerAuth(
  {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'JWT',
    description: 'Enter JWT token',
    in: 'header',
  },
  'access-token',
)
```

### Role-Based Access Control

```typescript
@Controller('posts')
export class PostController {
  @Post()
  @Auth([RoleType.USER])
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostResponseDto> {
    // Implementation
  }
}
```

## Pagination

### Query Parameters

```typescript
export class PaginationQueryDto {
  @NumberFieldOptional({
    min: 1,
    default: 1,
  })
  page?: number = 1;

  @NumberFieldOptional({
    min: 1,
    max: 50,
    default: 10,
  })
  limit?: number = 10;
}
```

### Paginated Response

```typescript
export class PaginatedResponseDto<T> {
  @ArrayField()
  items!: T[];

  @NumberField()
  total: number;

  @NumberField()
  page!: number;

  @NumberField()
  limit!: number;

  @NumberField()
  pages!: number;
}
```

## API Testing

### Integration Tests

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get authentication token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    token = response.body.accessToken;
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(res => {
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('limit');
      });
  });
});
```

## Best Practices

1. **Documentation**
   - Keep API documentation up to date
   - Include clear descriptions and examples
   - Document all possible responses
   - Use meaningful tags and operations

2. **Versioning**
   - Version your APIs
   - Maintain backward compatibility
   - Document breaking changes

3. **Security**
   - Document authentication methods
   - Specify required permissions
   - Hide sensitive information

4. **Response Format**
   - Use consistent response formats
   - Include proper error messages
   - Implement proper status codes

5. **Testing**
   - Write comprehensive API tests
   - Test edge cases
   - Validate response schemas
