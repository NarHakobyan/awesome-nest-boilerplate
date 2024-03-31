import { Entity, OneToOne, Property } from '@mikro-orm/core';

import { AbstractEntity } from '../../common/abstract.entity';
import type { UserDtoOptions } from './dtos/user.dto';
import { UserDto } from './dtos/user.dto';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'user_settings' })
export class UserSettingsEntity extends AbstractEntity<
  UserDto,
  UserDtoOptions
> {
  dtoClass = () => UserDto as any;

  @Property({ default: false })
  isEmailVerified = false;

  @Property({ default: false })
  isPhoneVerified = false;

  @Property({ type: 'uuid', fieldName: 'user_id', persist: false })
  userId!: string;

  @OneToOne(() => UserEntity, {
    mapToPk: true,
    joinColumn: 'user_id',
    columnType: 'uuid',
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  user?: UserEntity;
}
