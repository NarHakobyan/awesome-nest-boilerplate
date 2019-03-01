'use strict';

import { UserEntity } from '../../user/user.entity';

export class UserDto {
    readonly firstName: string;

    readonly lastName: string;

    readonly age: number;

    readonly email: string;

    readonly thumbnail: string;

    readonly createdAt: Date;

    readonly updatedAt: Date;

    constructor(user: UserEntity) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.age = user.age;
        this.email = user.email;
        this.thumbnail = user.thumbnail;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
