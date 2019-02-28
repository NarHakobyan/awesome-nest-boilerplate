/* tslint:disable:quotemark object-literal-sort-keys */
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as fs from 'fs';

const env = process.env.NODE_ENV || 'development';

let config = dotenv.parse(fs.readFileSync(`.${env}.env`));
config = dotenvExpand({ parsed: config }).parsed;

// Replace \\n with \n to support multiline strings in AWS
config = Object.keys(config).reduce((object, key) => {
  return { ...object, [key]: config[key].replace(/\\n/g, "\n") };
}, {});

module.exports = {
  type: 'postgres',
  host: config.POSTGRES_HOST,
  port: +config.POSTGRES_PORT,
  username: config.POSTGRES_USERNAME,
  password: config.POSTGRES_PASSWORD,
  database: config.POSTGRES_DATABASE,
  entities: [
    'src/entities/**/*.entity{.ts,.js}',
  ],
  migrations: [
    'src/migrations/*{.ts,.js}',
  ],
};
