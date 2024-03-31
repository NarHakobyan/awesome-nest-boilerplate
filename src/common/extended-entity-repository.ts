import type { AnyEntity, EntityManager } from '@mikro-orm/postgresql';
import { EntityRepository } from '@mikro-orm/postgresql';

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
}
