'use strict';

import { ApiModelPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';
import { AbstractDto } from '../../../common/dto/AbstractDto';
import { RoleType } from '../../../constants/role-type';

export class UserDto extends AbstractDto {

    @ApiModelPropertyOptional()
    firstName: string;

    @ApiModelPropertyOptional()
    lastName: string;

    @ApiModelPropertyOptional()
    username: string;

    @ApiModelPropertyOptional({ enum: RoleType })
    role: RoleType;

    @ApiModelPropertyOptional()
    email: string;

    @ApiModelPropertyOptional()
    avatar: string;

    @ApiModelPropertyOptional()
    thumbnail: string;

    @ApiModelPropertyOptional()
    companyEmail: string;

    @ApiModelPropertyOptional()
    companyName: string;

    @ApiModelPropertyOptional()
    phone: string;

    @ApiModelPropertyOptional()
    industry: string;

    @ApiModelPropertyOptional()
    address: string;

    @ApiModelPropertyOptional()
    country: string;

    @ApiModelPropertyOptional()
    state: string;

    @ApiModelPropertyOptional()
    city: string;

    @ApiModelPropertyOptional()
    zipCode: string;

    constructor(user: UserEntity) {
        super(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.username = user.username;
        this.role = user.role;
        this.email = user.email;
        this.avatar = user.avatar;
        this.thumbnail = user.thumbnail;
        this.companyEmail = user.companyEmail;
        this.companyName = user.companyName;
        this.phone = user.phone;
        this.industry = user.industry;
        this.address = user.address;
        this.country = user.country;
        this.state = user.state;
        this.city = user.city;
        this.zipCode = user.zipCode;
    }
}
