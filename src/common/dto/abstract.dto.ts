import { ApiProperty } from '@nestjs/swagger';

import { DYNAMIC_TRANSLATION_DECORATOR_KEY } from '../../decorators';
import { ContextProvider } from '../../providers';
import type {
  AbstractEntity,
  AbstractTranslationEntity,
} from '../abstract.entity';

export class AbstractDto {
  @ApiProperty()
  id!: Uuid;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  translations?: AbstractTranslationDto[];

  constructor(
    entity: AbstractEntity<any, any>,
    options?: { excludeFields?: boolean },
  ) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt!;
      this.updatedAt = entity.updatedAt!;
    }

    const languageCode = ContextProvider.getLanguage();

    if (languageCode && entity.translations) {
      const translationEntity = entity.translations.getItems().find(
        (titleTranslation) => titleTranslation.languageCode === languageCode,
      )!;

      const fields: Record<string, string> = {};

      for (const key of Object.keys(translationEntity)) {
        const metadata = Reflect.getMetadata(
          DYNAMIC_TRANSLATION_DECORATOR_KEY,
          this,
          key,
        );

        if (metadata) {
          fields[key] = translationEntity[key];
        }
      }

      Object.assign(this, fields);
    } else {
      this.translations = entity.translations?.getItems().toDtos();
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractTranslationEntity<any, any>) {
    super(entity, { excludeFields: true });
  }
}
