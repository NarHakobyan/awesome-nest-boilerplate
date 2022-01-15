/* eslint-disable @typescript-eslint/naming-convention */
import 'source-map-support/register';

import { compact, map } from 'lodash';
import { Brackets, QueryBuilder, SelectQueryBuilder } from 'typeorm';

import type { AbstractEntity } from './common/abstract.entity';
import type { AbstractDto } from './common/dto/abstract.dto';
import { PageDto } from './common/dto/page.dto';
import { PageMetaDto } from './common/dto/page-meta.dto';
import type { PageOptionsDto } from './common/dto/page-options.dto';
import { VIRTUAL_COLUMN_KEY } from './decorators';

declare global {
  export type Uuid = string & { _uuidBrand: undefined };

  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: any): Dto[];

    toPageDto<Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: any,
    ): PageDto<Dto>;
  }
}

declare module 'typeorm' {
  interface QueryBuilder<Entity> {
    searchByString(q: string, columnNames: string[]): this;
  }

  interface SelectQueryBuilder<Entity> {
    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean }>,
    ): Promise<[Entity[], PageMetaDto]>;
  }
}

Array.prototype.toDtos = function <
  Entity extends AbstractEntity<Dto>,
  Dto extends AbstractDto,
>(options?: any): Dto[] {
  return compact(
    map<Entity, Dto>(this, (item) => item.toDto(options as never)),
  );
};

Array.prototype.toPageDto = function (pageMetaDto: PageMetaDto, options?: any) {
  return new PageDto(this.toDtos(options), pageMetaDto);
};

QueryBuilder.prototype.searchByString = function (q, columnNames) {
  if (!q) {
    return this;
  }

  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  this.setParameter('q', `%${q}%`);

  return this;
};

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{ takeAll: boolean }>,
) {
  if (options?.takeAll) {
    this.skip(pageOptionsDto.skip).take(pageOptionsDto.take);
  }

  const itemCount = await this.getCount();

  const { entities, raw } = await this.getRawAndEntities();

  const items = entities.map((entity, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entity) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entity[propertyKey] = item[name];
    }

    return entity;
  });

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return [items, pageMetaDto];
};
