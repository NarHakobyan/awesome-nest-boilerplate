import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  ClassFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import {
  DynamicTranslate,
  StaticTranslate,
} from '../../../decorators/translate.decorator.ts';
import type { PostEntity } from '../post.entity.ts';
import { PostTranslationDto } from './post-translation.dto.ts';

export class PostDto extends AbstractDto {
  @StringFieldOptional()
  @DynamicTranslate()
  title?: string;

  @StringFieldOptional()
  @DynamicTranslate()
  description?: string;

  @StringFieldOptional()
  @StaticTranslate()
  info: string;

  @ClassFieldOptional(() => PostTranslationDto, { isArray: true })
  declare translations?: PostTranslationDto[];

  constructor(postEntity: PostEntity) {
    super(postEntity);

    this.info = 'keywords.admin';
  }
}
