# Deployment Guide

This guide covers the deployment process for the Awesome NestJS Boilerplate.

- [Deployment Guide](#deployment-guide)
  - [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
    - [Prerequisites](#prerequisites)
    - [Using Docker Compose](#using-docker-compose)
    - [Production Dockerfile](#production-dockerfile)
  - [Traditional Deployment](#traditional-deployment)
    - [Prerequisites](#prerequisites-1)
    - [Steps](#steps)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
    - [AWS Elastic Beanstalk](#aws-elastic-beanstalk)
    - [Heroku](#heroku)
  - [Environment Configuration](#environment-configuration)
    - [Production Environment Variables](#production-environment-variables)
  - [Security Considerations](#security-considerations)
  - [Monitoring and Logging](#monitoring-and-logging)
  - [Backup and Recovery](#backup-and-recovery)
  - [Scaling](#scaling)
  - [Maintenance](#maintenance)

## Deployment Options

1. **Docker Deployment**
2. **Traditional Deployment**
3. **Cloud Platform Deployment**

## Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose installed
- Access to a Docker registry (optional)

### Using Docker Compose

1. **Build and Run**

```bash
# Build and start the containers
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

2. **Configuration**

The `docker-compose.yml` file includes:
- NestJS application
- PostgreSQL database
- Redis (optional)

```yaml
version: '3'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Production Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build:prod

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["yarn", "start:prod"]
```

## Traditional Deployment

### Prerequisites

- Node.js installed (v16 or later)
- PostgreSQL database
- PM2 or similar process manager

### Steps

1. **Prepare the Environment**

```bash
# Install dependencies
yarn install --production

# Build the application
yarn build:prod

# Set up environment variables
cp .env.example .env
# Edit .env with production values
```

2. **Database Setup**

```bash
# Run migrations
yarn migration:run

# Seed initial data (if needed)
yarn seed:run
```

3. **Process Management with PM2**

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start ecosystem.config.js

# Monitor the application
pm2 monit

# View logs
pm2 logs
```

Example `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'nest-boilerplate',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
```

## Cloud Platform Deployment

### AWS Elastic Beanstalk

1. **Configuration**

Create `.elasticbeanstalk/config.yml`:

```yaml
branch-defaults:
  main:
    environment: production
    group_suffix: null
global:
  application_name: nest-boilerplate
  branch: null
  default_ec2_keyname: null
  default_platform: Node.js 18
  default_region: us-east-1
  include_git_submodules: true
  instance_profile: null
  platform_name: null
  platform_version: null
  profile: null
  repository: null
  sc: git
  workspace_type: Application
```

2. **Deployment**

```bash
# Initialize EB CLI
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

### Heroku

1. **Configuration**

Create `Procfile`:

```
web: yarn start:prod
```

2. **Deployment**

```bash
# Login to Heroku
heroku login

# Create app
heroku create

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Environment Configuration

### Production Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api
APP_FALLBACK_LANGUAGE=en
APP_HEADER_LANGUAGE=x-custom-lang

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nest_boilerplate

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=3600

# AWS
AWS_S3_ACCESS_KEY_ID=your-access-key
AWS_S3_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

## Security Considerations

1. **SSL/TLS Configuration**
   - Use HTTPS in production
   - Configure SSL certificates
   - Enable HTTP/2 if possible

2. **Security Headers**
   ```typescript
   app.use(helmet());
   app.enableCors({
     origin: process.env.ALLOWED_ORIGINS.split(','),
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
     credentials: true,
   });
   ```

3. **Rate Limiting**
   ```typescript
   app.use(
     rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100, // limit each IP to 100 requests per windowMs
     }),
   );
   ```

## Monitoring and Logging

1. **Application Monitoring**
   - New Relic
   - Datadog
   - PM2 monitoring

2. **Logging**
   ```typescript
   app.useLogger(new WinstonLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   }));
   ```

3. **Health Checks**
   ```typescript
   @Get('/health')
   @HealthCheck()
   check() {
     return this.health.check([
       () => this.db.pingCheck('database'),
       () => this.redis.pingCheck('redis'),
     ]);
   }
   ```

## Backup and Recovery

1. **Database Backups**
   ```bash
   # Backup
   pg_dump -U postgres -d nest_boilerplate > backup.sql

   # Restore
   psql -U postgres -d nest_boilerplate < backup.sql
   ```

2. **Application Data**
   - Regular backups of uploaded files
   - Backup of environment configurations
   - Documentation of restore procedures

## Scaling

1. **Horizontal Scaling**
   - Use load balancer
   - Configure session management
   - Implement caching strategy

2. **Vertical Scaling**
   - Monitor resource usage
   - Optimize database queries
   - Implement caching

## Maintenance

1. **Updates and Patches**
   ```bash
   # Update dependencies
   yarn upgrade-interactive --latest

   # Run security audit
   yarn audit
   ```

2. **Database Maintenance**
   ```bash
   # Run database migrations
   yarn migration:run

   # Revert last migration
   yarn migration:revert
   ```

3. **Monitoring and Alerts**
   - Set up monitoring for key metrics
   - Configure alert thresholds
   - Establish incident response procedures
