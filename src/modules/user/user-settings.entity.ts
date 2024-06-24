import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import type { UserDtoOptions } from './dtos/user.dto';
import { UserDto } from './dtos/user.dto';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_settings' })
@UseDto(UserDto)
export class UserSettingsEntity extends AbstractEntity<
  UserDto,
  UserDtoOptions
> {
  @Column({ default: false })
  isEmailVerified?: boolean;

  @Column({ default: false })
  isPhoneVerified?: boolean;

  @Column({ type: 'uuid' })
  userId?: string;

  @OneToOne(() => UserEntity, (user) => user.settings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
