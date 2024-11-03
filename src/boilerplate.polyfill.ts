import _ from 'lodash';
import type { ObjectLiteral } from 'typeorm';
import { Brackets, SelectQueryBuilder } from 'typeorm';

import type { AbstractEntity } from './common/abstract.entity.ts';
import type { AbstractDto } from './common/dto/abstract.dto.ts';
import type { CreateTranslationDto } from './common/dto/create-translation.dto.ts';
import { PageDto } from './common/dto/page.dto.ts';
import { PageMetaDto } from './common/dto/page-meta.dto.ts';
import type { PageOptionsDto } from './common/dto/page-options.dto.ts';
import type { LanguageCode } from './constants/language-code.ts';
import type { KeyOfType } from './types.ts';

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

declare module 'typeorm' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface SelectQueryBuilder<Entity> {
    searchByString(
      q: string,
      columnNames: string[],
      options?: {
        formStart: boolean;
      },
    ): this;

    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
      options?: Partial<{ takeAll: boolean; skipCount: boolean }>,
    ): Promise<[Entity[], PageMetaDto]>;

    leftJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    leftJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    innerJoinAndSelect<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;

    innerJoin<AliasEntity extends AbstractEntity, A extends string>(
      this: SelectQueryBuilder<Entity>,
      property: `${A}.${Exclude<
        KeyOfType<AliasEntity, AbstractEntity>,
        symbol
      >}`,
      alias: string,
      condition?: string,
      parameters?: ObjectLiteral,
    ): this;
  }
}

export function registerArrayExtensions(): void {
  Array.prototype.toDtos = function <
    Entity extends AbstractEntity<Dto>,
    Dto extends AbstractDto,
  >(options?: unknown): Dto[] {
    return _.compact(
      _.map<Entity, Dto>(this as Entity[], (item) =>
        item.toDto(options as never),
      ),
    );
  };

  Array.prototype.getByLanguage = function (
    languageCode: LanguageCode,
  ): string {
    return this.find(
      (translation) => languageCode === translation.languageCode,
    )!.text;
  };

  Array.prototype.toPageDto = function (
    pageMetaDto: PageMetaDto,
    options?: unknown,
  ) {
    return new PageDto(this.toDtos(options), pageMetaDto);
  };

  SelectQueryBuilder.prototype.searchByString = function (
    q,
    columnNames,
    options,
  ) {
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

    if (options?.formStart) {
      this.setParameter('q', `${q}%`);
    } else {
      this.setParameter('q', `%${q}%`);
    }

    return this;
  };

  SelectQueryBuilder.prototype.paginate = async function (
    pageOptionsDto: PageOptionsDto,
    options?: Partial<{
      skipCount: boolean;
      takeAll: boolean;
    }>,
  ) {
    if (!options?.takeAll) {
      this.skip(pageOptionsDto.skip).take(pageOptionsDto.take);
    }

    const entities = await this.getMany();

    let itemCount = -1;

    if (!options?.skipCount) {
      itemCount = await this.getCount();
    }

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    return [entities, pageMetaDto];
  };
}
