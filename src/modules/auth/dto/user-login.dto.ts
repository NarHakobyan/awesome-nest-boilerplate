import { EmailField, StringField } from '../../../decorators';

export class UserLoginDto {
  @EmailField()
  readonly email!: string;

  @StringField()
  readonly password!: string;
}
