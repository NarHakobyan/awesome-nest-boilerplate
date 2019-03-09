'use strict';

import { IsString, IsEmail, IsInt, MinLength, IsNotEmpty, Min, IsEnum } from 'class-validator';
import { RoleType } from '../../../constants/role-type';

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

    @IsEnum(RoleType)
    @IsNotEmpty()
    readonly role: RoleType = RoleType.User;

    @IsString()
    @MinLength(6)
    readonly password: string;
}
