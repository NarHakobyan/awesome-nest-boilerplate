'use strict';

import { IsString, IsEmail, MinLength, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class UserRegisterDto {
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly firstName: string;

    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly lastName: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @ApiModelProperty()
    readonly email: string;

    @IsString()
    @MinLength(6)
    @ApiModelProperty({ minLength: 6 })
    readonly password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    username: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    companyEmail: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    companyName: string;

    @Column()
    @IsPhoneNumber('ZZ')
    @IsNotEmpty()
    @ApiModelProperty()
    phone: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    industry: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    address: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    country: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    state: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    city: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @ApiModelProperty()
    zipCode: string;
}
