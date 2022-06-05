import { ApiProperty } from '@nestjs/swagger';

import { AbstractTranslationDto } from '../../../common/dto/abstract.dto';
import { LanguageCode } from '../../../constants';
import { ApiEnumProperty } from '../../../decorators';
import type { PostTranslationEntity } from '../post-translation.entity';

export class PostTranslationDto extends AbstractTranslationDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiEnumProperty(() => LanguageCode)
  languageCode: LanguageCode;

  constructor(postTranslationEntity: PostTranslationEntity) {
    super(postTranslationEntity);
    this.title = postTranslationEntity.title;
    this.description = postTranslationEntity.description;
    this.languageCode = postTranslationEntity.languageCode;
  }
}
