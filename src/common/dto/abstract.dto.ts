import { DateField, UUIDField } from '../../decorators/field.decorators';
import { DYNAMIC_TRANSLATION_DECORATOR_KEY } from '../../decorators/translate.decorator';
import { ContextProvider } from '../../providers';
import type { AbstractEntity } from '../abstract.entity';

export class AbstractDto {
  @UUIDField()
  id!: Uuid;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  translations?: AbstractTranslationDto[];

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt!;
      this.updatedAt = entity.updatedAt!;
    }

    const languageCode = ContextProvider.getLanguage();

    if (languageCode && entity.translations) {
      const translationEntity = entity.translations.find(
        (titleTranslation) => titleTranslation.languageCode === languageCode,
      )!;

      const fields: Record<string, string> = {};

      for (const key of Object.keys(translationEntity)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const metadata = Reflect.getMetadata(
          DYNAMIC_TRANSLATION_DECORATOR_KEY,
          this,
          key,
        );

        if (metadata) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          fields[key] = translationEntity[key];
        }
      }

      Object.assign(this, fields);
    } else {
      this.translations = entity.translations?.toArray().toDtos();
    }
  }
}

export class AbstractTranslationDto extends AbstractDto {
  constructor(entity: AbstractEntity) {
    super(entity, { excludeFields: true });
  }
}
