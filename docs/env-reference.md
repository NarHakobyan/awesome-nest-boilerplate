<!-- Generated from src/config/env/env.definition.ts by `pnpm env:sync`. Do not edit by hand. -->

# Environment reference

Every variable this project reads. The list is generated from
`src/config/env/env.definition.ts`, which is the single source of truth for
`.env.example`, the runtime validation and this page.

To add a variable: add an entry to `env.definition.ts`, run `pnpm env:sync`, and
commit the regenerated files. `pnpm env:check` fails the build if they drift.

**Scope** is `app` when the NestJS application reads the variable, and `external`
when something else does (docker-compose, a shell script, the AWS SDK).

## App

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | app | required | `development` | Runtime environment. |
| `PORT` | app | required | `3000` | HTTP port the API listens on. |
| `TRANSPORT_PORT` | external | optional | `8080` | Port exposed by the container for the microservice transport. Read by docker-compose.yml. |
| `FALLBACK_LANGUAGE` | app | required | `en_US` | Locale used when the request asks for one we do not ship. |
| `ENABLE_ORM_LOGS` | app | required | `true` | Log every SQL statement TypeORM executes. |
| `ENABLE_DOCUMENTATION` | app | required | `true` | Serve the Swagger UI at /documentation. |
| `API_VERSION` | app | required | `v1.0.0` | Version string shown in the Swagger document. |
| `CORS_ORIGINS` | app | required | `http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `FRONTEND_URL` | app | optional | `http://localhost:3000` | Public URL of the web client. Currently unused by the API. |
| `API_BASE_URL` | app | optional | — | Public base URL of this API. Currently unused by the API. |

## JWT Auth

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `JWT_PRIVATE_KEY` | app | required | — | RS256 private key. Write newlines as literal \n to keep it on one line. |
| `JWT_PUBLIC_KEY` | app | required | — | RS256 public key, matching JWT_PRIVATE_KEY. |
| `JWT_EXPIRATION_TIME` | app | required | `86400` | Access-token lifetime, in seconds. |

## DB

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `DB_HOST` | app | required | `127.0.0.1` | Postgres host. |
| `DB_PORT` | app | required | `5432` | Postgres port. |
| `DB_USERNAME` | app | required | `postgres` | Postgres user. Also read by init-data.sh. |
| `DB_PASSWORD` | app | required | `postgres` | Postgres password. Also read by init-data.sh. |
| `DB_DATABASE` | app | required | `awesome_nest_db` | Postgres database name. Also read by init-data.sh. |

## AWS S3

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | external | required in production | — | Picked up implicitly by the AWS SDK credential chain. Read by @aws-sdk credential chain. |
| `AWS_SECRET_ACCESS_KEY` | external | required in production | — | Picked up implicitly by the AWS SDK credential chain. Read by @aws-sdk credential chain. |
| `AWS_REGION` | external | optional | `eu-central-1` | Default region for the AWS SDK. S3 calls use AWS_S3_BUCKET_REGION instead. Read by @aws-sdk credential chain. |
| `AWS_S3_BUCKET_NAME` | app | required | `deno-prod-upload` | Bucket uploads are written to. |
| `AWS_S3_BUCKET_REGION` | app | required | `eu-central-1` | Region of AWS_S3_BUCKET_NAME. Used to build public URLs. |
| `AWS_S3_API_VERSION` | app | required | `2006-03-01` | S3 API version pinned by the client. |
| `SECRET_MANAGER_ARN` | external | optional | — | ARN baked into the image as a build arg. Not read by the API. Read by Dockerfile build arg. |

## NATS

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `NATS_ENABLED` | app | required | `false` | Start the NATS microservice transport alongside HTTP. |
| `NATS_HOST` | app | required | `localhost` | NATS server host. Required when NATS_ENABLED is true. |
| `NATS_PORT` | app | required | `4222` | NATS server port. Required when NATS_ENABLED is true. |

## Throttler

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `THROTTLER_TTL` | app | required | `1m` | Rate-limit window, e.g. 1m, 30s, 500ms. |
| `THROTTLER_LIMIT` | app | required | `10` | Requests allowed per THROTTLER_TTL window. |

## Redis

| Variable | Scope | Presence | Default | Description |
| --- | --- | --- | --- | --- |
| `REDIS_URL` | external | optional | — | Redis connection string. Not yet wired into application code. Read by docker-compose redis service. |

