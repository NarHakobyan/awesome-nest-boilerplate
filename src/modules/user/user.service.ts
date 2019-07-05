import { Injectable } from '@nestjs/common';
import { FindConditions, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRegisterDto } from '../auth/dto/UserRegisterDto';
import { UserRepository } from './user.repository';
import { IFile } from '../../interfaces/IFile';
import { ValidatorService } from '../../shared/services/validator.service';
import { FileNotImageException } from '../../exceptions/file-not-image.exception';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { UsersPageOptionsDto } from './dto/users-page-options.dto';
import { PageMetaDto } from '../../common/dto/PageMetaDto';
import { UsersPageDto } from './dto/users-page.dto';

@Injectable()
export class UserService {
    constructor(
        public readonly userRepository: UserRepository,
        public readonly validatorService: ValidatorService,
        public readonly awsS3Service: AwsS3Service,
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

    async findByUsernameOrEmail(options: Partial<{ username: string, email: string }>): Promise<UserEntity | undefined> {
        let queryBuilder = this.userRepository.createQueryBuilder('user');

        if (options.email) {
            queryBuilder = queryBuilder.orWhere('user.email = :email', { email: options.email });
        }
        if (options.username) {
            queryBuilder = queryBuilder.orWhere('user.username = :username', { username: options.username });
        }

        return queryBuilder.getOne();
    }

    async createUser(userRegisterDto: UserRegisterDto, file: IFile): Promise<UserEntity> {
        let avatar: string;
        if (file && !this.validatorService.isImage(file.mimetype)) {
            throw new FileNotImageException();
        }

        if (file) {
            avatar = await this.awsS3Service.uploadImage(file);
        }

        const user = this.userRepository.create({ ...userRegisterDto, avatar });

        return this.userRepository.save(user);

    }

    async getUsers(pageOptionsDto: UsersPageOptionsDto): Promise<UsersPageDto> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const [users, usersCount] = await queryBuilder
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .getManyAndCount();

        const pageMetaDto = new PageMetaDto(
            { pageOptionsDto, itemCount: usersCount },
        );
        return new UsersPageDto(users.toDtos(), pageMetaDto);
    }
}
