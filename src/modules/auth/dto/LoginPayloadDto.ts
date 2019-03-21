'use strict';

import { TokenPayloadDto } from './TokenPayloadDto';
import { UserDto } from '../../user/dto/UserDto';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginPayloadDto {
    @ApiModelProperty({ type: UserDto })
    user: UserDto;
    @ApiModelProperty({ type: TokenPayloadDto })
    token: TokenPayloadDto;

    constructor(user: UserDto, token: TokenPayloadDto) {
        this.user = user;
        this.token = token;
    }
}
