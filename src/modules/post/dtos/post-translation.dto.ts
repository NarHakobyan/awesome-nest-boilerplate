import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractTranslationDto } from '../../../common/dto/abstract.dto';
import { LanguageCode } from '../../../constants';
import { ApiEnumPropertyOptional } from '../../../decorators';
import type { PostTranslationEntity } from '../post-translation.entity';

export class PostTranslationDto extends AbstractTranslationDto {
  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  description: string;

  @ApiEnumPropertyOptional(() => LanguageCode)
  languageCode: LanguageCode;

  constructor(postTranslationEntity: PostTranslationEntity) {
    super(postTranslationEntity);
    this.title = postTranslationEntity.title;
    this.description = postTranslationEntity.description;
    this.languageCode = postTranslationEntity.languageCode;
  }
}
