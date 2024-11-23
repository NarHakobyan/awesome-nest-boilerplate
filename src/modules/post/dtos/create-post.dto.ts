import { CreateTranslationDto } from '../../../common/dto/create-translation.dto.ts';
import { TranslationsField } from '../../../decorators/field.decorators.ts';

export class CreatePostDto {
  @TranslationsField({ type: CreateTranslationDto })
  title!: CreateTranslationDto[];

  @TranslationsField({ type: CreateTranslationDto })
  description!: CreateTranslationDto[];
}
