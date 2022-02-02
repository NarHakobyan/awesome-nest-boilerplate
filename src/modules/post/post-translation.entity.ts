import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { LanguageCode } from '../../constants';
import { UseDto } from '../../decorators';
import { PostTranslationDto } from './dtos/post-translation.dto';
import { PostEntity } from './post.entity';

@Entity({ name: 'post_translations' })
@UseDto(PostTranslationDto)
export class PostTranslationEntity extends AbstractEntity<PostTranslationDto> {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'uuid' })
  postId: Uuid;

  @Column({ type: 'enum', enum: LanguageCode })
  languageCode: LanguageCode;

  @ManyToOne(() => PostEntity, (postEntity) => postEntity.translations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;
}
