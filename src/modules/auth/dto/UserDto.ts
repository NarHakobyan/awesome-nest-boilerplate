'use strict';

import { UserEntity } from '../../user/user.entity';
import { AbstractDto } from '../../../abstract/AbstractDto';

export class UserDto extends AbstractDto {
    readonly firstName: string;

    readonly lastName: string;

    readonly age: number;

    readonly email: string;

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
