import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DynamicTranslate, StaticTranslate } from '../../../decorators';
import type { PostEntity } from '../post.entity';
import { PostTranslationDto } from './post-translation.dto';

export class PostDto extends AbstractDto {
  @ApiPropertyOptional()
  @DynamicTranslate()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  @StaticTranslate()
  info: string;

  @ApiPropertyOptional({ type: PostTranslationDto, isArray: true })
  declare translations?: PostTranslationDto[];

  constructor(postEntity: PostEntity) {
    super(postEntity);

    this.info = 'keywords.admin';
  }
}
