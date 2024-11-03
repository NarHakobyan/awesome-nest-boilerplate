import { ApiProperty } from '@nestjs/swagger';

import { ClassField } from '../../decorators/field.decorators.ts';
import { PageMetaDto } from './page-meta.dto.ts';

export class PageDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ClassField(() => PageMetaDto)
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
