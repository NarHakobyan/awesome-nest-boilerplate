import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import type { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';
import { PopulateHint, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ThrottlerOptions } from '@nestjs/throttler';
import { isNil } from 'lodash';
import type { Units } from 'parse-duration';
import { default as parse } from 'parse-duration';
import { ExtendedEntityRepository } from '../../common/extended-entity-repository.ts';

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

  private getNumber(key: string): number {
    const value = this.get(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getDuration(key: string, format?: Units): number {
    const value = this.getString(key);
    const duration = parse(value, format);

    if (duration === undefined) {
      throw new Error(`${key} environment variable is not a valid duration`);
    }

    return duration;
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replaceAll('\\n', '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE');
  }

  get throttlerConfigs(): ThrottlerOptions {
    return {
      ttl: this.getDuration('THROTTLER_TTL', 'second'),
      limit: this.getNumber('THROTTLER_LIMIT'),
      // storage: new ThrottlerStorageRedisService(new Redis(this.redis)),
    };
  }

  get mikroOrm(): MikroOrmModuleSyncOptions {
    return {
      entities: ['./dist/modules/**/*.entity.js'],
      entitiesTs: ['./src/modules/**/*.entity.ts'],
      entityRepository: ExtendedEntityRepository,
      // subscribers: [UserSubscriber],
      migrations: {
        transactional: true,
        path: './dist/database/migrations',
        pathTs: './src/database/migrations',
        glob: '!(*.d).{js,ts}',
        dropTables: this.isTest,
        generator: TSMigrationGenerator,
      },
      driver: PostgreSqlDriver,
      name: 'default',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      user: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      dbName: this.getString('DB_DATABASE'),
      // subscribers: [UserSubscriber],
      debug: true,
      autoJoinOneToOneOwner: false,
      autoJoinRefsForFilters: false,
      forceUndefined: true,
      ignoreUndefinedInQuery: true,
      extensions: [Migrator, EntityGenerator, SeedManager],
      metadataProvider: TsMorphMetadataProvider,
      populateWhere: PopulateHint.INFER, // revert to v4 behaviour
      validate: true,
      strict: true,
      seeder: {
        path: './dist/seeders',
        pathTs: './src/seeders',
        defaultSeeder: 'DatabaseSeeder',
      },
      discovery: {
        warnWhenNoEntities: true,
        checkDuplicateTableNames: true,
        checkDuplicateFieldNames: true,
        alwaysAnalyseProperties: true,
      },
      // namingStrategy: new SnakeNamingStrategy(),
    };
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get openAI() {
    return {
      apiKey: this.getString('OPENAI_API_KEY'),
    };
  }

  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED');
  }

  get natsConfig() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (isNil(value)) {
      throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
    }

    return value;
  }
}
