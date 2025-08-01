import './src/boilerplate.polyfill';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { UserSubscriber } from './src/entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

dotenv.config();
function getString(
  key: string,
  defaultValue?: string,
  removeLineBreaks?: true,
): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`${key} environment variable doesn't exist`);
  }

  const str = value.toString().replaceAll(String.raw`\n`, '\n');

  if (removeLineBreaks) {
    return str.replaceAll(String.raw`\n`, '');
  }

  return str.toString().replaceAll(String.raw`\n`, '\n');
}
const isSSL: boolean = process.env.DB_SSL === 'true';
const dbSSLCa = getString('DB_SSL_CA', '', true);

const ssl = isSSL
  ? {
      rejectUnauthorized: true,
      ca: dbSSLCa,
    }
  : {};

export const dataSource = new DataSource({
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
  ...(isSSL ? { ssl } : {}),
});
