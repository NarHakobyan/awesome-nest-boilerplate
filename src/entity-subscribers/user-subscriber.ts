import type {
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

import { generateHash } from '../common/utils.ts';
import { UserEntity } from '../modules/user/user.entity.ts';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  beforeInsert(event: InsertEvent<UserEntity>): void {
    // Check if password is already hashed (bcrypt format)
    const isBcryptHash = /^\$2[abxy]\$\d{2}\$/.test(
      event.entity.password ?? '',
    );

    if (event.entity.password && !isBcryptHash) {
      event.entity.password = generateHash(event.entity.password);
    }
  }

  beforeUpdate(event: UpdateEvent<UserEntity>): void {
    const entity = event.entity as UserEntity;

    // Check if password is already hashed (bcrypt format)
    const isBcryptHash = /^\$2[abxy]\$\d{2}\$/.test(entity.password ?? '');

    // Only hash if password exists, is being changed, and is not already hashed
    if (
      entity.password &&
      entity.password !== event.databaseEntity.password &&
      !isBcryptHash
    ) {
      entity.password = generateHash(entity.password);
    }
  }
}
