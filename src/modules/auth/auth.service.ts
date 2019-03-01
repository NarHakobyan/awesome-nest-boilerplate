import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UtilsService } from '../../providers/utils.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly utilsService: UtilsService,
    ) { }

    async createToken(user: UserEntity) {
        return {
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ id: user.id }),
        };
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ email: userLoginDto.email });
        const isPasswordValid = await this.utilsService.validateHash(userLoginDto.password, user && user.passwordHash);
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }
}
