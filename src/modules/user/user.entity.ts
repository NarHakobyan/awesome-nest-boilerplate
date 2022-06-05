import {
  Collection,
  Entity,
  EntityRepositoryType,
  Enum,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

import { AbstractEntity } from '../../common/abstract.entity';
import { RoleType } from '../../constants';
import { UseDto } from '../../decorators';
import { PostEntity } from '../post/post.entity';
import { UserDto } from './dtos/user.dto';
import { UserSettingsEntity } from './user-settings.entity';

export class UserRepository extends EntityRepository<UserEntity> {}

@Entity({ tableName: 'users', customRepository: () => UserRepository })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserEntity, 'role'> {
  [EntityRepositoryType]?: UserRepository;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Enum({
    items: () => RoleType,
    default: RoleType.USER,
  })
  role: RoleType = RoleType.USER;

  @Property({ unique: true, nullable: true })
  email?: string;

  @Property({ nullable: true })
  password?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  avatar?: string;

  @Property({ name: 'fullName' })
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @OneToOne(() => UserSettingsEntity, (userSettings) => userSettings.user)
  settings?: UserSettingsEntity;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.user)
  posts = new Collection<PostEntity>(this);
}
