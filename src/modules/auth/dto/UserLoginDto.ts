'use strict';

import { IsString, IsEmail } from 'class-validator';

export class UserLoginDto {
    @IsString()
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly password: string;
}
