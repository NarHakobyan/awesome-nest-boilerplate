'use strict';

import { IsString, IsEmail, IsInt, MinLength, IsNotEmpty, Min } from 'class-validator';

export class UserRegisterDto {
    @IsString()
    @IsNotEmpty()
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    readonly lastName: string;

    @IsInt()
    @IsNotEmpty()
    @Min(18)
    readonly age: number;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @MinLength(6)
    readonly password: string;
}
