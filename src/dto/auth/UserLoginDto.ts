'use strict';

import { IsString, IsEmail } from 'class-validator';

export class UserLoginDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
