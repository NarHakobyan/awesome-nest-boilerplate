import { AbstractTranslationDto } from '../../../common/dto/abstract.dto.ts';
import { LanguageCode } from '../../../constants/language-code.ts';
import {
  EnumFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { PostTranslationEntity } from '../post-translation.entity.ts';

export class PostTranslationDto extends AbstractTranslationDto {
  @StringFieldOptional()
  title?: string;

  @StringFieldOptional()
  description?: string;

  @EnumFieldOptional(() => LanguageCode)
  languageCode?: LanguageCode;

  constructor(postTranslationEntity: PostTranslationEntity) {
    super(postTranslationEntity);
    this.title = postTranslationEntity.title;
    this.description = postTranslationEntity.description;
    this.languageCode = postTranslationEntity.languageCode;
  }
}
