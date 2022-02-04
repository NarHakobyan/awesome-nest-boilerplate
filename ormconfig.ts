import './src/boilerplate.polyfill';

import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

const configs: TypeOrmModuleOptions & { seeds: string[]; factories: string[] } =
  {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    subscribers: [UserSubscriber],
    entities: [
      'src/modules/**/*.entity{.ts,.js}',
      'src/modules/**/*.view-entity{.ts,.js}',
    ],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    seeds: ['src/database/seeds/**/*{.ts,.js}'],
    factories: ['src/database/factories/**/*{.ts,.js}'],
  };

module.exports = configs;
