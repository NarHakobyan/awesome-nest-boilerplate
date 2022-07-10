import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  Property,
  t,
} from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { UserEntity } from '../user/user.entity';
import { PostDto } from './dtos/post.dto';
import { PostTranslationEntity } from './post-translation.entity';

export class PostRepository extends EntityRepository<PostEntity> {}

@Entity({ tableName: 'posts', customRepository: () => PostRepository })
@UseDto(PostDto)
export class PostEntity extends AbstractEntity<PostEntity, 'user'> {
  [EntityRepositoryType]?: PostRepository;

  @Property({ type: t.uuid })
  userId!: Uuid;

  @ManyToOne(() => UserEntity, {
    fieldName: 'userId',
  })
  user?: UserEntity;

  @OneToMany(
    () => PostTranslationEntity,
    (postTranslationEntity) => postTranslationEntity.post,
  )
  translations = new Collection<PostTranslationEntity>(this);
}
