'use strict';

import { TokenPayloadDto } from './TokenPayloadDto';
import { UserDto } from './UserDto';

export class LoginPayloadDto {
    user: UserDto;
    token: TokenPayloadDto;

    constructor(user: UserDto, token: TokenPayloadDto) {
        this.user = user;
        this.token = token;
    }
}
