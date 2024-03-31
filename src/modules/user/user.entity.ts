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
import { UseDto } from '../../decorators';
import { PostEntity } from '../post/post.entity';
import { UserDto, type UserDtoOptions } from './dtos/user.dto';
import { UserSettingsEntity } from './user-settings.entity';

@Entity({ tableName: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Property({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Property({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Enum({ type: 'enum', default: RoleType.USER })
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
