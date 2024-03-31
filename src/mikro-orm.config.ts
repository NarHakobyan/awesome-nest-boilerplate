import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { Options, PopulateHint, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import dotenv from 'dotenv';

dotenv.config();

const config: Options = {
  // for simplicity, we use the SQLite database, as it's available pretty much everywhere
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  autoJoinOneToOneOwner: false,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  migrations: {
    transactional: true,
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    glob: '!(*.d).{js,ts}',
    dropTables: this.isTest,
    generator: TSMigrationGenerator,
  },
  dbName: process.env.DB_DATABASE,
  // folder-based discovery setup, using common filename suffix
  entities: ['./dist/modules/**/*.entity.js'],
  entitiesTs: ['./src/modules/**/*.entity.ts'],
  // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
  // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
  metadataProvider: TsMorphMetadataProvider,
  ignoreUndefinedInQuery: true,
  populateWhere: PopulateHint.INFER, // revert to v4 behaviour
  validate: true,
  strict: true,
  debug: true, // enable debug mode to log SQL queries and discovery information
  forceUndefined: true,
  extensions: [Migrator, EntityGenerator, SeedManager],
};

export default config;
