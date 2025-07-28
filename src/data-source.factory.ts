import type { TypeOrmDataSourceFactory } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';

export const dataSourceFactory: TypeOrmDataSourceFactory = async (
  options?: DataSourceOptions,
): Promise<DataSource> => {
  if (!options) {
    throw new Error('Invalid options passed');
  }

  const existing = getDataSourceByName('default');

  if (!existing) {
    const dataSource = new DataSource(options);
    const initialized = await dataSource.initialize();
    addTransactionalDataSource(initialized);

    return initialized;
  }

  return existing;
};
