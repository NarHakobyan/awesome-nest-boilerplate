'use strict';

import { ApiModelPropertyOptional } from '@nestjs/swagger';

import { RoleType } from '../../../common/constants/role-type';
import { AbstractDto } from '../../../common/dto/AbstractDto';
import { UserEntity } from '../user.entity';

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
    phone: string;

    constructor(user: UserEntity) {
        super(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.role = user.role;
        this.email = user.email;
        this.avatar = user.avatar;
        this.phone = user.phone;
    }
}
