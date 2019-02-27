export interface ITypeOrmConfig {
  type: 'postgres';
  host: string;
  port: number;
  synchronize?: boolean;
  username: string;
  password: string;
  database: string;
  entities: string[];
  migrations: string[];
  migrationsRun: boolean;
  logging: boolean;
}
