import { Injectable } from '@nestjs/common';
import { FindConditions } from 'typeorm';

import { UserDto } from './dto/UserDto';
import { UserEntity } from './user.entity';
import { UtilsService } from '../../providers/utils.service';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        public readonly userRepository: UserRepository,
    ) {}

    /**
     * Find single user
     */
    async findUser(findData: FindConditions<UserEntity>): Promise<UserDto>;
    async findUser(findData: FindConditions<UserEntity>, returnEntity: true): Promise<UserEntity>;
    async findUser(findData: FindConditions<UserEntity>, returnEntity: boolean = false): Promise<UserEntity | UserDto> {
        const user = await this.userRepository.findOne(findData);

        if (!user) {
            return null;
        }

        return returnEntity ? user : UtilsService.toDto(UserDto, user);
    }

    /**
     * Find all users
     */
    async findUsers(findData: FindConditions<UserEntity>): Promise<UserDto[]>;
    async findUsers(findData: FindConditions<UserEntity>, returnEntity: true): Promise<UserEntity[]>;
    async findUsers(findData: FindConditions<UserEntity>, returnEntity = false): Promise<Array<UserEntity | UserDto>> {
        const users = await this.userRepository.find(findData);

        return returnEntity ? users : UtilsService.toDto(UserDto, users);
    }

    async createUser(userRegisterDto: UserRegisterDto): Promise<UserEntity> {

        const passwordHash = await UtilsService.generateHash(userRegisterDto.password);
        const user = this.userRepository.create({ ...userRegisterDto, passwordHash });

        return this.userRepository.save(user);

    }
}
