/* eslint-disable canonical/no-use-extend-native */
import 'source-map-support/register';

import { QueryBuilder } from '@mikro-orm/postgresql';
import { compact, map } from 'lodash';

import type { AbstractEntity } from './common/abstract.entity';
import type { AbstractDto } from './common/dto/abstract.dto';
import type { CreateTranslationDto } from './common/dto/create-translation.dto';
import { PageDto } from './common/dto/page.dto';
import { PageMetaDto } from './common/dto/page-meta.dto';
import type { PageOptionsDto } from './common/dto/page-options.dto.ts';
import type { LanguageCode } from './constants';

declare global {
  export type Uuid = string & { _uuidBrand: undefined };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-redundant-type-constituents
  export type Todo = any & { _todoBrand: undefined };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Array<T> {
    toDtos<Dto extends AbstractDto>(this: T[], options?: unknown): Dto[];

    getByLanguage(
      this: CreateTranslationDto[],
      languageCode: LanguageCode,
    ): string;

    toPageDto<Dto extends AbstractDto>(
      this: T[],
      pageMetaDto: PageMetaDto,
      // FIXME make option type visible from entity
      options?: unknown,
    ): PageDto<Dto>;
  }
}

declare module '@mikro-orm/postgresql' {
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/ban-types
  interface QueryBuilder<T extends object> {
    searchByString(
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean;
      },
    ): this;

    paginate(
      this: QueryBuilder<T>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean; skipCount: boolean }>,
    ): Promise<[T[], PageMetaDto]>;

    // leftJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
    //   this: QueryBuilder<T>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ): this;
    //
    // leftJoin<AliasEntity extends AbstractEntity, A extends string>(
    //   this: QueryBuilder<T>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ): this;
    //
    // innerJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
    //   this: QueryBuilder<T>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ): this;
    //
    // innerJoin<AliasEntity extends AbstractEntity, A extends string>(
    //   this: QueryBuilder<T>,
    //   property: `${A}.${Exclude<
    //     KeyOfType<AliasEntity, AbstractEntity>,
    //     symbol
    //   >}`,
    //   alias: string,
    //   condition?: string,
    //   parameters?: ObjectLiteral,
    // ): this;
  }
}

Array.prototype.toDtos = function <
  Entity extends AbstractEntity<Dto>,
  Dto extends AbstractDto,
>(options?: unknown): Dto[] {
  return compact(
    map<Entity, Dto>(this as Entity[], (item) => item.toDto(options as never)),
  );
};

Array.prototype.getByLanguage = function (languageCode: LanguageCode): string {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return this.find((translation) => languageCode === translation.languageCode)!
    .text;
};

Array.prototype.toPageDto = function (
  pageMetaDto: PageMetaDto,
  options?: unknown,
) {
  return new PageDto(this.toDtos(options), pageMetaDto);
};

// (QueryBuilder as any).prototype.searchByString = function (
//   q,
//   columnNames,
//   options,
// ) {
//   if (!q) {
//     return this;
//   }
//
//   this.andWhere(
//     new Brackets((qb) => {
//       for (const item of columnNames) {
//         qb.orWhere(`${item} ILIKE :q`);
//       }
//     }),
//   );
//
//   if (options?.formStart) {
//     this.setParameter('q', `${q}%`);
//   } else {
//     this.setParameter('q', `%${q}%`);
//   }
//
//   return this;
// };

QueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>,
) {
  const qb = this.clone();

  if (!options?.takeAll) {
    qb.limit(pageOptionsDto.take, pageOptionsDto.skip);
  }

  const [entities, itemCount] = await qb.getResultAndCount();

  const pageMetaDto = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return [entities, pageMetaDto];
};
