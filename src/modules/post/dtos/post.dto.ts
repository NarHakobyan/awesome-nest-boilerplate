import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { LanguageCode } from '../../../constants';
import type { PostEntity } from '../post.entity';
import { PostTranslationDto } from '../post-translation.dto';

export class PostDto extends AbstractDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: PostTranslationDto, isArray: true })
  translations?: PostTranslationDto[];

  constructor(postEntity: PostEntity, languageCode?: LanguageCode) {
    super(postEntity);

    if (languageCode) {
      const postTranslationEntity = postEntity.translations.find(
        (translation) => translation.languageCode === languageCode,
      )!;
      this.title = postTranslationEntity.title;
      this.description = postTranslationEntity.description;
    } else {
      this.translations = postEntity.translations.toDtos();
    }
  }
}
