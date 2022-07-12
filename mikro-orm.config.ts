import './src/boilerplate.polyfill';

// import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
// import { SnakeNamingStrategy } from './src/snake-naming.strategy';
import type { Configuration } from '@mikro-orm/core';
import { TSMigrationGenerator } from '@mikro-orm/migrations';
import type { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';

const configs: MikroOrmModuleSyncOptions = {
  type: process.env.DB_TYPE as keyof typeof Configuration.PLATFORMS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_DATABASE,
  // namingStrategy: new SnakeNamingStrategy(),
  // subscribers: [UserSubscriber],
  entities: ['src/modules/**/*.entity.ts', 'src/modules/**/*.view-entity.ts'],
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot when creating new migrations
    emit: 'ts', // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
  seeder: {
    path: './dist/database/seeds',
    pathTs: './src/database/seeds',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className, // seeder file naming convention
  },
};

module.exports = configs;
