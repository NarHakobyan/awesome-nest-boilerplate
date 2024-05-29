import type {
  EventArgs,
  EventSubscriber,
  FlushEventArgs,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';

import { generateHash } from '../common/utils';
import { UserEntity } from '../modules/user/user.entity';

@Injectable()
export class UserSubscriber implements EventSubscriber<UserEntity> {
  constructor(em: EntityManager) {
    em.getEventManager().registerSubscriber(this);
  }

  getSubscribedEntities() {
    return [UserEntity];
  }

  onFlush(args: FlushEventArgs): void {
    for (const changeSet of args.uow.getChangeSets()) {
      const changedPassword = changeSet.payload.password;

      if (changedPassword) {
        changeSet.entity.password = generateHash(changedPassword);
        args.uow.recomputeSingleChangeSet(changeSet.entity);
      }
    }
  }

  beforeUpdate(event: EventArgs<UserEntity>): void {
    const entity = event.entity;

    if (entity.password !== event.changeSet?.entity.password) {
      entity.password = generateHash(entity.password!);
    }
  }
}
