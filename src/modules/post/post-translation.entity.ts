import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';

import { AbstractTranslationEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { PostTranslationDto } from './dtos/post-translation.dto';
import { PostEntity } from './post.entity';

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
