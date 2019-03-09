import { Entity, Column } from 'typeorm';

import { AbstractEntity } from '../../abstract/abstract.entity';
import { UserDto } from '../auth/dto/UserDto';
import { RoleType } from '../../constants/role-type';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity<UserDto> {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

    @Column({ type: 'enum', enum: RoleType })
    role: RoleType;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    @Column({ nullable: true })
    thumbnail: string;

    dtoClass = UserDto;
}
