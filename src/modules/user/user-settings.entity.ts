import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { UserDto } from './dtos/user.dto';
import { UserEntity } from './user.entity';

export class UserSettingsRepository extends EntityRepository<UserSettingsEntity> {}

@Entity({
  tableName: 'user_settings',
  customRepository: () => UserSettingsRepository,
})
@UseDto(UserDto)
export class UserSettingsEntity extends AbstractEntity<UserSettingsEntity> {
  [EntityRepositoryType]?: UserSettingsRepository;

  @Property({ default: false })
  isEmailVerified?: boolean;

  @Property({ default: false })
  isPhoneVerified?: boolean;

  @Property({ type: 'uuid' })
  userId?: string;

  @OneToOne(() => UserEntity, (user) => user.settings, {
    owner: true,
    mapToPk: true,
    onDelete: 'cascade',
    onUpdateIntegrity: 'cascade',
    fieldName: 'user_id',
  })
  user?: UserEntity;
}
