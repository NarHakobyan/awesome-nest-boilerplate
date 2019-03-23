import { Injectable } from '@nestjs/common';
import { FindConditions, QueryRunner, SelectQueryBuilder } from 'typeorm';
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
    findUser(findData: FindConditions<UserEntity>): Promise<UserEntity> {
        return this.userRepository.findOne(findData);
    }

    /**
     * Find all users
     */
    findUsers(findData: FindConditions<UserEntity>): Promise<UserEntity[]> {
        return this.userRepository.find(findData);
    }

    createQueryBuilder(alias: string = 'user', queryRunner?: QueryRunner): SelectQueryBuilder<UserEntity> {
        return this.userRepository.createQueryBuilder(alias, queryRunner);
    }

    async createUser(userRegisterDto: UserRegisterDto): Promise<UserEntity> {

        const passwordHash = await UtilsService.generateHash(userRegisterDto.password);
        const user = this.userRepository.create({ ...userRegisterDto, passwordHash });

        return this.userRepository.save(user);

    }
}
