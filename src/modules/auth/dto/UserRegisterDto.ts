'use strict';

import { IsString, IsEmail, IsInt, MinLength, IsNotEmpty, Min, IsEnum } from 'class-validator';
import { RoleType } from '../../../constants/role-type';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class UserRegisterDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly lastName: string;

    @IsInt()
    @IsNotEmpty()
    @Min(18)
    @ApiModelProperty()
    readonly age: number;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly email: string;

    @IsEnum(RoleType)
    @ApiModelPropertyOptional({ enum: Object.values(RoleType)})
    readonly role: RoleType = RoleType.User;

    @IsString()
    @MinLength(6)
    @ApiModelProperty()
    readonly password: string;

    // todo Itegrate avatar
}
