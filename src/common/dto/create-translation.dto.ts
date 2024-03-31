import { LanguageCode } from '../../constants';
import { EnumField, StringField } from '../../decorators/field.decorators';

export class CreateTranslationDto {
  @EnumField(() => LanguageCode)
  languageCode!: LanguageCode;

  @StringField()
  text!: string;
}
