# Deployment Guide

This comprehensive guide covers deployment strategies, configurations, and best practices for the Awesome NestJS Boilerplate across different environments and platforms.

- [Deployment Guide](#deployment-guide)
  - [Deployment Overview](#deployment-overview)
  - [Environment Preparation](#environment-preparation)
    - [Production Environment Variables](#production-environment-variables)
    - [Database Configuration](#database-configuration)
  - [Docker Deployment](#docker-deployment)
    - [Prerequisites](#prerequisites)
    - [Production Docker Setup](#production-docker-setup)
    - [Docker Compose Deployment](#docker-compose-deployment)
    - [Container Registry](#container-registry)
  - [Traditional Server Deployment](#traditional-server-deployment)
    - [Prerequisites](#prerequisites-1)
    - [Build and Deploy](#build-and-deploy)
    - [Process Management](#process-management)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
    - [AWS Deployment](#aws-deployment)
      - [AWS Elastic Beanstalk](#aws-elastic-beanstalk)
      - [AWS ECS with Fargate](#aws-ecs-with-fargate)
    - [Google Cloud Platform](#google-cloud-platform)
    - [Heroku Deployment](#heroku-deployment)
    - [DigitalOcean App Platform](#digitalocean-app-platform)
  - [CI/CD Pipeline](#cicd-pipeline)
    - [GitHub Actions](#github-actions)
    - [GitLab CI](#gitlab-ci)
  - [Database Migration](#database-migration)
  - [Security Considerations](#security-considerations)
    - [Environment Security](#environment-security)
    - [Application Security](#application-security)
    - [Infrastructure Security](#infrastructure-security)
  - [Monitoring and Logging](#monitoring-and-logging)
    - [Application Monitoring](#application-monitoring)
    - [External Monitoring](#external-monitoring)
  - [Performance Optimization](#performance-optimization)
    - [Application Optimization](#application-optimization)
    - [Infrastructure Optimization](#infrastructure-optimization)
  - [Backup and Recovery](#backup-and-recovery)
    - [Database Backup](#database-backup)
    - [Application Backup](#application-backup)
  - [Scaling Strategies](#scaling-strategies)
    - [Horizontal Scaling](#horizontal-scaling)
    - [Vertical Scaling](#vertical-scaling)
    - [Auto-scaling Configuration](#auto-scaling-configuration)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Debugging Tools](#debugging-tools)
    - [Log Analysis](#log-analysis)

## Deployment Overview

The Awesome NestJS Boilerplate supports multiple deployment strategies:

1. **Docker Deployment**: Containerized deployment with Docker and Docker Compose
2. **Traditional Deployment**: Direct server deployment with PM2 process management
3. **Cloud Platforms**: Managed deployment on AWS, GCP, Heroku, and other platforms
4. **CI/CD Integration**: Automated deployment with GitHub Actions and GitLab CI

## Environment Preparation

### Production Environment Variables

Create a production `.env` file with the following variables:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_TYPE=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=your-db-name
ENABLE_ORM_LOGS=false

# JWT Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRATION_TIME=3600

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Documentation (disable in production)
ENABLE_DOCUMENTATION=false

# Throttling
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# NATS (if using microservices)
NATS_ENABLED=false
NATS_HOST=your-nats-host
NATS_PORT=4222

# AWS S3 (if using file uploads)
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_S3_REGION=us-east-1

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Database Configuration

Ensure your production database is properly configured:

```sql
-- Create database and user
CREATE DATABASE your_db_name;
CREATE USER your_db_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_db_user;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
```

## Docker Deployment

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Access to a container registry (optional)

### Production Docker Setup

**Dockerfile** (optimized for production):

```dockerfile
# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build:prod

# Remove dev dependencies
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Docker Compose Deployment

**docker-compose.prod.yml**:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**Deployment commands**:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale the application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### Container Registry

**Build and push to registry**:

```bash
# Build image
docker build -t your-registry/nest-boilerplate:latest .

# Tag for versioning
docker tag your-registry/nest-boilerplate:latest your-registry/nest-boilerplate:v1.0.0

# Push to registry
docker push your-registry/nest-boilerplate:latest
docker push your-registry/nest-boilerplate:v1.0.0
```

## Traditional Server Deployment

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 12+
- PM2 process manager
- Nginx (recommended)

### Build and Deploy

```bash
# 1. Clone repository
git clone https://github.com/your-username/your-nest-app.git
cd your-nest-app

# 2. Install dependencies
yarn install --frozen-lockfile

# 3. Build application
yarn build:prod

# 4. Set up environment
cp .env.example .env
# Edit .env with production values

# 5. Run database migrations
yarn typeorm migration:run

# 6. Start application
yarn start:prod
```

### Process Management

**PM2 Configuration** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'nest-boilerplate',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
    },
  ],
};
```

**PM2 Commands**:

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs nest-boilerplate

# Restart application
pm2 restart nest-boilerplate

# Stop application
pm2 stop nest-boilerplate

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

**Nginx Configuration** (`/etc/nginx/sites-available/nest-boilerplate`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloud Platform Deployment

### AWS Deployment

#### AWS Elastic Beanstalk

**`.elasticbeanstalk/config.yml`**:

```yaml
branch-defaults:
  main:
    environment: nest-boilerplate-prod
global:
  application_name: nest-boilerplate
  default_platform: Node.js 18
  default_region: us-east-1
  sc: git
```

**Deployment commands**:

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create production

# Deploy
eb deploy

# Open application
eb open
```

#### AWS ECS with Fargate

**`task-definition.json`**:

```json
{
  "family": "nest-boilerplate",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "nest-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/nest-boilerplate:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nest-boilerplate",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

**`app.yaml`** (App Engine):

```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  DB_HOST: /cloudsql/project:region:instance
  JWT_SECRET: your-jwt-secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10
```

**Deployment**:

```bash
# Deploy to App Engine
gcloud app deploy

# View logs
gcloud app logs tail -s default
```

### Heroku Deployment

**`Procfile`**:

```
web: node dist/main.js
release: yarn typeorm migration:run
```

**`package.json` scripts**:

```json
{
  "scripts": {
    "heroku-postbuild": "yarn build:prod"
  }
}
```

**Deployment commands**:

```bash
# Login to Heroku
heroku login

# Create application
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main

# Run migrations
heroku run yarn typeorm migration:run

# View logs
heroku logs --tail
```

### DigitalOcean App Platform

**`.do/app.yaml`**:

```yaml
name: nest-boilerplate
services:
- name: api
  source_dir: /
  github:
    repo: your-username/nest-boilerplate
    branch: main
  run_command: yarn start:prod
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your-jwt-secret
    type: SECRET
databases:
- name: postgres-db
  engine: PG
  version: "13"
  size: db-s-dev-database
```

## CI/CD Pipeline

### GitHub Actions

**`.github/workflows/deploy.yml`**:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test:cov

      - name: Run e2e tests
        run: yarn test:e2e

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build application
        run: yarn build:prod

      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.DOCKER_REGISTRY }}/nest-boilerplate:${{ github.sha }} .
          docker tag ${{ secrets.DOCKER_REGISTRY }}/nest-boilerplate:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/nest-boilerplate:latest

      - name: Login to Docker Registry
        run: echo ${{ secrets.DOCKER_PASSWORD }} | docker login ${{ secrets.DOCKER_REGISTRY }} -u ${{ secrets.DOCKER_USERNAME }} --password-stdin

      - name: Push Docker image
        run: |
          docker push ${{ secrets.DOCKER_REGISTRY }}/nest-boilerplate:${{ github.sha }}
          docker push ${{ secrets.DOCKER_REGISTRY }}/nest-boilerplate:latest

      - name: Deploy to production
        run: |
          # Add your deployment script here
          # e.g., kubectl apply, docker-compose pull && docker-compose up -d, etc.
```

### GitLab CI

**`.gitlab-ci.yml`**:

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

test:
  stage: test
  image: node:18-alpine
  cache:
    paths:
      - node_modules/
  script:
    - yarn install --frozen-lockfile
    - yarn test:cov
    - yarn test:e2e

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST $DEPLOY_WEBHOOK_URL
  only:
    - main
```

## Database Migration

**Production migration strategy**:

```bash
# 1. Backup database
pg_dump -h localhost -U username -d database_name > backup.sql

# 2. Run migrations
yarn typeorm migration:run

# 3. Verify migration
yarn typeorm migration:show

# 4. Rollback if needed (be careful!)
yarn typeorm migration:revert
```

**Zero-downtime migration approach**:

1. Deploy new version alongside old version
2. Run migrations on new version
3. Switch traffic to new version
4. Remove old version

## Security Considerations

### Environment Security
- Use environment variables for sensitive data
- Never commit secrets to version control
- Use secret management services (AWS Secrets Manager, etc.)
- Implement proper RBAC for deployment access

### Application Security
- Enable HTTPS with valid SSL certificates
- Configure proper CORS settings
- Implement rate limiting
- Use security headers (helmet.js)
- Regular security audits (`yarn audit`)

### Infrastructure Security
- Use private networks for database connections
- Implement proper firewall rules
- Regular security updates
- Monitor for vulnerabilities

## Monitoring and Logging

### Application Monitoring

**Health Check Endpoint**:

```typescript
// src/health-check.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function healthCheck() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('Health check passed');
    process.exit(0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

healthCheck();
```

**Logging Configuration**:

```typescript
// src/main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

// Log application startup
logger.log(`Application is running on: ${await app.getUrl()}`);
```

### External Monitoring

**Sentry Integration**:

```bash
yarn add @sentry/node
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}
```

## Performance Optimization

### Application Optimization
- Enable compression middleware
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Enable HTTP/2

### Infrastructure Optimization
- Use CDN for static assets
- Implement load balancing
- Auto-scaling configuration
- Database read replicas
- Caching layers (Redis)

## Backup and Recovery

### Database Backup

**Automated backup script**:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="your_database"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

**Cron job for automated backups**:

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### Application Backup
- Regular code repository backups
- Configuration file backups
- SSL certificate backups
- Log file archival

## Scaling Strategies

### Horizontal Scaling
- Load balancer configuration
- Multiple application instances
- Database read replicas
- Microservices architecture

### Vertical Scaling
- Increase server resources
- Optimize application performance
- Database performance tuning
- Memory and CPU optimization

### Auto-scaling Configuration

**AWS Auto Scaling**:

```json
{
  "AutoScalingGroupName": "nest-boilerplate-asg",
  "MinSize": 1,
  "MaxSize": 10,
  "DesiredCapacity": 2,
  "TargetGroupARNs": ["arn:aws:elasticloadbalancing:..."],
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300
}
```

## Troubleshooting

### Common Issues

**Application won't start**:
- Check environment variables
- Verify database connectivity
- Check port availability
- Review application logs

**Database connection issues**:
- Verify database credentials
- Check network connectivity
- Confirm database server status
- Review connection pool settings

**Performance issues**:
- Monitor resource usage
- Check database query performance
- Review application logs
- Analyze network latency

### Debugging Tools

```bash
# Check application status
pm2 status

# View real-time logs
pm2 logs --lines 100

# Monitor resource usage
htop
iostat
netstat -tulpn

# Database performance
EXPLAIN ANALYZE SELECT ...;
```

### Log Analysis

```bash
# Search for errors
grep -i error /var/log/app.log

# Monitor access patterns
tail -f /var/log/nginx/access.log

# Check system logs
journalctl -u your-service -f
```
