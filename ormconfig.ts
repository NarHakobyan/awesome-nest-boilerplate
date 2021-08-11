import './src/boilerplate.polyfill';

import { SnakeNamingStrategy } from './src/snake-naming.strategy';
import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const configs: TypeOrmModuleOptions & {seeds: string[], factories: string[],} =  {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  subscribers: [UserSubscriber],
  entities: ['src/modules/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  seeds: ['src/database/seeds/**/*{.ts,.js}'],
  factories: ['src/database/factories/**/*{.ts,.js}'],
};

module.exports = configs;
