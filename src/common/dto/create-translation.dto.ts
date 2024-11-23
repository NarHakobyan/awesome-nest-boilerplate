import { LanguageCode } from '../../constants/language-code.ts';
import { EnumField, StringField } from '../../decorators/field.decorators.ts';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  languageCode!: LanguageCode;

  @StringField()
  text!: string;
}
