import { AbstractEntity } from '../../common/abstract.entity';
import { UserEntity } from '../user/user.entity';
import { PostDto } from './dtos/post.dto';
import { PostTranslationEntity } from './post-translation.entity';
import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/core';
import { UseDto } from '../../decorators/use-dto.decorator.ts';

@Entity({ tableName: 'posts' })
@UseDto(PostDto)
export class PostEntity extends AbstractEntity<PostDto> {
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
