import type { FilterQuery } from '@mikro-orm/core/typings';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { plainToClass } from 'class-transformer';

import { RoleType } from '../../constants';
import { FileNotImageException, UserNotFoundException } from '../../exceptions';
import type { IFile } from '../../interfaces/IFile';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import { ValidatorService } from '../../shared/services/validator.service';
import type { UserRegisterDto } from '../auth/dto/user-register.dto';
import { CreateSettingsCommand } from './commands/create-settings.command';
import { CreateSettingsDto } from './dtos/create-settings.dto';
import type { UserDto } from './dtos/user.dto';
import { UserEntity } from './user.entity';
import type { UserSettingsEntity } from './user-settings.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: EntityRepository<UserEntity>,
    private validatorService: ValidatorService,
    private awsS3Service: AwsS3Service,
    private commandBus: CommandBus,
  ) {}

  /**
   * Find single user
   */
  findOne(findData: FilterQuery<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOne(findData);
  }

  async findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'settings');

    if (options.email) {
      queryBuilder.orWhere('user.email = ?', [options.email]);
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = ?', [options.username]);
    }

    return queryBuilder.getSingleResult();
  }

  // @Transactional()
  async createUser(
    userRegisterDto: UserRegisterDto,
    file?: IFile,
  ): Promise<UserEntity> {
    const user = this.userRepository.create({
      email: userRegisterDto.email,
      firstName: userRegisterDto.firstName,
      lastName: userRegisterDto.lastName,
      password: userRegisterDto.password,
      phone: userRegisterDto.phone,
      role: RoleType.USER,
    });

    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }

    if (file) {
      user.avatar = await this.awsS3Service.uploadImage(file);
    }

    await this.userRepository.insert(user);

    user.settings = await this.createSettings(
      user.id,
      plainToClass(CreateSettingsDto, {
        isEmailVerified: false,
        isPhoneVerified: false,
      }),
    );

    return user;
  }

  // async getUsers(
  //   pageOptionsDto: UsersPageOptionsDto,
  // ): Promise<PageDto<UserDto>> {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');
  //   const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
  //
  //   return items.toPageDto(pageMetaDto);
  // }

  async getUser(userId: Uuid): Promise<UserDto> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder.where('user.id = ?', [userId]);

    const userEntity = await queryBuilder.getSingleResult();

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity.toDto();
  }

  async createSettings(
    userId: Uuid,
    createSettingsDto: CreateSettingsDto,
  ): Promise<UserSettingsEntity> {
    return this.commandBus.execute<CreateSettingsCommand, UserSettingsEntity>(
      new CreateSettingsCommand(userId, createSettingsDto),
    );
  }
}
