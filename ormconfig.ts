import './src/boilerplate.polyfill';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { validateEnv } from './src/config/env/env.schema';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

dotenv.config();

/*
 * The migration CLI is a second entry point into the same configuration, so it
 * goes through the same schema the application does.
 */
const env = validateEnv(process.env) as {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
};

export const dataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    'src/modules/**/*.entity{.ts,.js}',
    'src/modules/**/*.view-entity{.ts,.js}',
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
