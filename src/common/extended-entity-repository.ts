import type {
  AnyEntity,
  EntityManager,
  QueryBuilder,
} from '@mikro-orm/postgresql';
import { EntityRepository } from '@mikro-orm/postgresql';

import { PageMetaDto } from './dto/page-meta.dto.ts';
import type { PageOptionsDto } from './dto/page-options.dto.ts';

export class ExtendedEntityRepository<
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object,
> extends EntityRepository<T> {
  persist(entity: AnyEntity | AnyEntity[]): EntityManager {
    return this.em.persist(entity);
  }

  async persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    await this.em.persistAndFlush(entity);
  }

  remove(entity: AnyEntity): EntityManager {
    return this.em.remove(entity);
  }

  async removeAndFlush(entity: AnyEntity): Promise<void> {
    await this.em.removeAndFlush(entity);
  }

  async flush(): Promise<void> {
    return this.em.flush();
  }

  async paginate(
    queryBuilder: QueryBuilder<T>,
    pageOptionsDto: PageOptionsDto,
    options?: Partial<{
      takeAll: boolean;
    }>,
  ): Promise<[T[], PageMetaDto]> {
    const qb = queryBuilder.clone();

    if (!options?.takeAll) {
      qb.limit(pageOptionsDto.take, pageOptionsDto.skip);
    }

    const [entities, itemCount] = await qb.getResultAndCount();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto,
    });

    return [entities, pageMetaDto];
  }
}
