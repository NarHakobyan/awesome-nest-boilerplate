/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/tslint/config */
import 'source-map-support/register';

import * as _ from 'lodash';
import { Brackets, QueryBuilder, SelectQueryBuilder } from 'typeorm';

import { AbstractEntity } from './common/abstract.entity';
import { AbstractDto } from './common/dto/AbstractDto';
import { PageMetaDto } from './common/dto/PageMetaDto';
import { PageOptionsDto } from './common/dto/PageOptionsDto';

declare global {
    interface Array<T> {
        toDtos<B extends AbstractDto>(this: AbstractEntity<B>[]): B[];
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
        ): Promise<[Entity[], PageMetaDto]>;
    }
}

Array.prototype.toDtos = function <B extends AbstractDto>(options?: any): B[] {
    return _(this)
        .map((item) => item.toDto(options))
        .compact()
        .value() as B[];
};

QueryBuilder.prototype.searchByString = function (q, columnNames) {
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

SelectQueryBuilder.prototype.paginate = async function <Entity>(
    this: SelectQueryBuilder<Entity>,
    pageOptionsDto: PageOptionsDto,
): Promise<[Entity[], PageMetaDto]> {
    const [items, itemCount] = await this.skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take)
        .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
        itemCount,
        pageOptionsDto,
    });

    return [items, pageMetaDto];
};
