import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindConditions } from 'typeorm';

import { UserDto } from '../auth/dto/UserDto';
import { UserEntity } from './user.entity';
import { UtilsService } from '../../providers/utils.service';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
        public readonly utilsService: UtilsService,
    ) {}

    /**
     * Find single user
     */
    async findUser(findData: FindConditions<UserEntity>): Promise<UserEntity>;
    async findUser(findData: FindConditions<UserEntity>, dto): Promise<UserDto>;
    async findUser(findData: FindConditions<UserEntity>, dto: boolean = false): Promise<UserEntity | UserDto> {
        const user = await this.userRepository.findOne(findData);

        if (!user) {
            return null;
        }

        return dto ? this.utilsService.toDto(UserDto, user) : user;
    }

    /**
     * Find all users
     */
    async findUsers(findData: FindConditions<UserEntity>): Promise<UserEntity[]>;
    async findUsers(findData: FindConditions<UserEntity>, dto): Promise<UserDto[]>;
    async findUsers(findData: FindConditions<UserEntity>, dto: boolean = false): Promise<Array<UserEntity | UserDto>> {
        const users: UserEntity[] = await this.userRepository.find(findData);

        return dto ? this.utilsService.toDto(UserDto, users) : users;
    }

    async createUser(userRegisterDto: UserRegisterDto) {

        const passwordHash = await this.utilsService.generateHash(userRegisterDto.password);
        const user = this.userRepository.create({ ...userRegisterDto, passwordHash });

        return this.userRepository.save(user);

    }
}
