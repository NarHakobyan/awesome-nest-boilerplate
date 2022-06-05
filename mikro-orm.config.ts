import './src/boilerplate.polyfill';

import { TSMigrationGenerator } from '@mikro-orm/migrations';
import type { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';

import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

const configs: MikroOrmModuleSyncOptions = {
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_DATABASE,
  // namingStrategy: new SnakeNamingStrategy(),
  // subscribers: [UserSubscriber],
  entities: ['src/modules/**/*.entity.ts', 'src/modules/**/*.view-entity.ts'],
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: './src/database/migrations', // path to the folder with migrations
    pathTs: './src/database/migrations', // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot when creating new migrations
    emit: 'ts', // migration generation mode
    generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
  },
  // seeds: ['src/database/seeds/**/*{.ts,.js}'],
  // factories: ['src/database/factories/**/*{.ts,.js}'],
};

module.exports = configs;
