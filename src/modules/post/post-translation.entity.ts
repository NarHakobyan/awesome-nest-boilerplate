import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractTranslationEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { PostTranslationDto } from './dtos/post-translation.dto.ts';
import { PostEntity } from './post.entity.ts';

@Entity({ name: 'post_translations' })
@UseDto(PostTranslationDto)
export class PostTranslationEntity extends AbstractTranslationEntity<PostTranslationDto> {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ type: 'uuid' })
  postId!: Uuid;

  @ManyToOne(() => PostEntity, (postEntity) => postEntity.translations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post?: Relation<PostEntity>;
}
