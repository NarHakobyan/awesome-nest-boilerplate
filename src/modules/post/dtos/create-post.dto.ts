import { CreateTranslationDto } from '../../../common/dto/create-translation.dto';
import { TranslationsField } from '../../../decorators/field.decorators';

export class CreatePostDto {
  @TranslationsField({ type: CreateTranslationDto })
  title!: CreateTranslationDto[];

  @TranslationsField({ type: CreateTranslationDto })
  description!: CreateTranslationDto[];
}
