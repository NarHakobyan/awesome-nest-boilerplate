'use strict';

import { ApiModelProperty } from '@nestjs/swagger';

import { UserEntity } from '../../user/user.entity';
import { AbstractDto } from '../../../abstract/AbstractDto';

export class UserDto extends AbstractDto {

    @ApiModelProperty()
    readonly firstName: string;

    @ApiModelProperty()
    readonly lastName: string;

    @ApiModelProperty()
    readonly age: number;

    @ApiModelProperty()
    readonly email: string;

    @ApiModelProperty()
    readonly thumbnail: string;

    constructor(user: UserEntity) {
        super(user);
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.age = user.age;
        this.email = user.email;
        this.thumbnail = user.thumbnail;
    }
}
