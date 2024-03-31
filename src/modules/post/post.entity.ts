import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { AbstractEntity } from '../../common/abstract.entity';
import { UserEntity } from '../user/user.entity';
import { PostDto } from './dtos/post.dto';
import { PostTranslationEntity } from './post-translation.entity';

@Entity({ tableName: 'posts' })
export class PostEntity extends AbstractEntity<PostDto> {
  // FIXME fix type
  dtoClass = () => PostDto as any;

  @Property({ type: 'uuid', fieldName: 'user_id', persist: false })
  userId!: Uuid;

  @ManyToOne(() => UserEntity, {
    referenceColumnName: 'id',
    joinColumn: 'user_id',
    deleteRule: 'cascade',
    updateRule: 'cascade',
  })
  user?: UserEntity;

  @OneToMany(
    () => PostTranslationEntity,
    (postTranslationEntity) => postTranslationEntity.post,
  )
  translations = new Collection<PostTranslationEntity>(this);
}
