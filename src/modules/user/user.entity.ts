import { Entity, Column } from 'typeorm';

import { AbstractEntity } from '../../abstract/abstract.entity';
import { UserDto } from '../auth/dto/UserDto';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity<UserDto> {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column({ nullable: true })
    thumbnail: string;

    dtoClass = UserDto;
}
