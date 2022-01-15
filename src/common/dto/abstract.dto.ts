import { ApiProperty } from '@nestjs/swagger';

import type { AbstractEntity } from '../abstract.entity';

export class AbstractDto {
  @ApiProperty()
  id: Uuid;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt;
      this.updatedAt = entity.updatedAt;
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
