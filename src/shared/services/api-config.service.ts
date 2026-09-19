import path from 'node:path';

import { Injectable } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import type { ThrottlerOptions } from '@nestjs/throttler';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import type { Env } from '../../config/env/env.schema.ts';
import { UserSubscriber } from '../../entity-subscribers/user-subscriber.ts';
import { SnakeNamingStrategy } from '../../snake-naming.strategy.ts';

/**
 * Typed access to the environment.
 *
 * Every value here has already been validated and coerced by
 * `validateEnv` during `ConfigModule.forRoot()`, so this class does no parsing
 * of its own -- it is a thin, typed projection of `Env` onto the shapes the
 * various Nest modules want. A variable that is not declared in
 * `src/config/env/env.definition.ts` is a compile error.
 */
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get nodeEnv(): Env['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.get('FALLBACK_LANGUAGE');
  }

  get apiVersion(): string {
    return this.get('API_VERSION');
  }

  get corsConfig(): CorsOptions {
    return {
      origin: this.get('CORS_ORIGINS'),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    };
  }

  get throttlerConfigs(): ThrottlerOptions {
    return {
      ttl: this.get('THROTTLER_TTL'),
      limit: this.get('THROTTLER_LIMIT'),
      // storage: new ThrottlerStorageRedisService(new Redis(this.redis)),
    };
  }

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [
      path.join(import.meta.dirname, `../../modules/**/*.entity{.ts,.js}`),
      path.join(import.meta.dirname, `../../modules/**/*.view-entity{.ts,.js}`),
    ];
    const migrations = [
      path.join(import.meta.dirname, `../../database/migrations/*{.ts,.js}`),
    ];

    return {
      entities,
      migrations,
      dropSchema: this.isTest,
      type: 'postgres',
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_DATABASE'),
      subscribers: [UserSubscriber],
      migrationsRun: true,
      logging: this.get('ENABLE_ORM_LOGS'),
      namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get awsS3Config(): {
    bucketRegion: string;
    bucketApiVersion: string;
    bucketName: string;
  } {
    return {
      bucketRegion: this.get('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.get('AWS_S3_API_VERSION'),
      bucketName: this.get('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.get('ENABLE_DOCUMENTATION');
  }

  get natsEnabled(): boolean {
    return this.get('NATS_ENABLED');
  }

  get natsConfig(): { host: string; port: number } {
    return {
      host: this.get('NATS_HOST'),
      port: this.get('NATS_PORT'),
    };
  }

  get authConfig(): {
    privateKey: string;
    publicKey: string;
    jwtExpirationTime: number;
  } {
    return {
      privateKey: this.get('JWT_PRIVATE_KEY'),
      publicKey: this.get('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.get('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig(): { port: number } {
    return {
      port: this.get('PORT'),
    };
  }

  private get<K extends keyof Env>(key: K): Env[K] {
    const value = this.configService.get<Env[K]>(key);

    if (value === undefined) {
      /*
       * Unreachable once bootstrap validation has run; this only fires if a
       * getter and the schema have drifted apart.
       */
      throw new Error(
        `Environment variable ${key} is missing after validation`,
      );
    }

    return value;
  }
}
