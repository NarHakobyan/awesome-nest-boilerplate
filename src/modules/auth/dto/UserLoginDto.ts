import { EmailField, PasswordField } from '../../../decorators';
import { SameAs } from '../../../validators/same-as.validator';

export class UserLoginDto {
  @EmailField()
  readonly email!: string;

  @PasswordField()
  @SameAs('confirmPassword')
  readonly password!: string;

  @PasswordField()
  readonly confirmPassword!: string;
}
