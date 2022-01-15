import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '../../user/dtos/user.dto';
import { TokenPayloadDto } from './TokenPayloadDto';

export class LoginPayloadDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ type: TokenPayloadDto })
  token: TokenPayloadDto;

  constructor(user: UserDto, token: TokenPayloadDto) {
    this.user = user;
    this.token = token;
  }
}
