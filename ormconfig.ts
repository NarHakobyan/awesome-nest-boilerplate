import './src/boilerplate.polyfill';

import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

type DbTypes =
  | 'mysql'
  | 'mariadb'
  | 'postgres'
  | 'cockroachdb'
  | 'sqlite'
  | 'mssql'
  | 'oracle';

const configs: TypeOrmModuleOptions & { seeds: string[]; factories: string[] } =
  {
    type: process.env.DB_TYPE as DbTypes,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    subscribers: [UserSubscriber],
    entities: ['src/modules/**/*.entity{.ts,.js}'],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
    factories: ['src/database/factories/**/*{.ts,.js}'],
  };

module.exports = configs;
