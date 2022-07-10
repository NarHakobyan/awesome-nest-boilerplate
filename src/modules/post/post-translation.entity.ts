import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';

import { AbstractTranslationEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { PostTranslationDto } from './dtos/post-translation.dto';
import { PostEntity } from './post.entity';

export class PostTranslationRepository extends EntityRepository<PostTranslationEntity> {}

@Entity({ tableName: 'post_translations' })
@UseDto(PostTranslationDto)
export class PostTranslationEntity extends AbstractTranslationEntity<
  PostTranslationEntity,
  'post'
> {
  @Property()
  title!: string;

  @Property()
  description!: string;

  @Property({ type: 'uuid' })
  postId!: Uuid;

  @ManyToOne(() => PostEntity, {
    mapToPk: true,
    fieldName: 'postId',
    onDelete: 'cascade',
    onUpdateIntegrity: 'cascade',
  })
  post?: PostEntity;
}
