import { BaseDto } from '../../../common/dto/base.dto.ts';
import { ClassField } from '../../../decorators/field.decorators.ts';
import { UserDto } from '../../user/dtos/user.dto.ts';
import { TokenPayloadDto } from './token-payload.dto.ts';

export class LoginPayloadDto extends BaseDto {
  @ClassField(() => UserDto)
  user!: UserDto;

  @ClassField(() => TokenPayloadDto)
  accessToken!: TokenPayloadDto;
}
