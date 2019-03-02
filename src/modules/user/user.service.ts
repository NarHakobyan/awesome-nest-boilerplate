import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions } from 'typeorm';

import { UserDto } from '../auth/dto/UserDto';
import { UserEntity } from './user.entity';
import { UtilsService } from '../../providers/utils.service';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        public readonly userRepository: UserRepository,
        public readonly utilsService: UtilsService,
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

        return returnEntity ? user : this.utilsService.toDto(UserDto, user);
    }

    /**
     * Find all users
     */
    async findUsers(findData: FindConditions<UserEntity>): Promise<UserDto[]>;
    async findUsers(findData: FindConditions<UserEntity>, returnEntity: true): Promise<UserEntity[]>;
    async findUsers(findData: FindConditions<UserEntity>, returnEntity = false): Promise<Array<UserEntity | UserDto>> {
        const users: UserEntity[] = await this.userRepository.find(findData);

        return returnEntity ? users : this.utilsService.toDto(UserDto, users);
    }

    async createUser(userRegisterDto: UserRegisterDto) {

        const passwordHash = await this.utilsService.generateHash(userRegisterDto.password);
        const user = this.userRepository.create({ ...userRegisterDto, passwordHash });

        return this.userRepository.save(user);

    }
}
