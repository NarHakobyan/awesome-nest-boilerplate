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
