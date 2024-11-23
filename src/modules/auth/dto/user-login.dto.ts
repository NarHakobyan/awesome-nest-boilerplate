import {
  EmailField,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class UserLoginDto {
  @EmailField()
  readonly email!: string;

  @StringField()
  readonly password!: string;
}
