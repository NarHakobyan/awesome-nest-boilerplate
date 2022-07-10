import { EmailField, PasswordField } from '../../../decorators';

export class UserLoginDto {
  @EmailField()
  readonly email!: string;

  @PasswordField()
  readonly password!: string;
}
