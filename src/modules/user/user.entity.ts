import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';

import { AbstractEntity } from '../../common/abstract.entity';
import { RoleType } from '../../constants';
import { PostEntity } from '../post/post.entity';
import type { UserDtoOptions } from './dtos/user.dto';
import { UserDto } from './dtos/user.dto';
import { UserSettingsEntity } from './user-settings.entity';

@Entity({ tableName: 'users' })
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  dtoClass = () => UserDto as any;

  @Property({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Property({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Enum({
    items: () => RoleType,
    default: RoleType.USER,
    nativeEnumName: 'user_role_type',
  })
  role: RoleType = RoleType.USER;

  @Property({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Property({ nullable: true, type: 'varchar' })
  password!: string | null;

  @Property({ nullable: true, type: 'varchar' })
  phone!: string | null;

  @Property({ nullable: true, type: 'varchar' })
  avatar!: string | null;

  // @VirtualProperty({
  //   query: (alias) =>
  //     `SELECT CONCAT(${alias}.first_name, ' ', ${alias}.last_name)`,
  // })
  // fullName!: string;

  @OneToOne(() => UserSettingsEntity, (userSettings) => userSettings.user)
  settings?: UserSettingsEntity;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts = new Collection<PostEntity>(this);
}
