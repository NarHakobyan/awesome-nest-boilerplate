import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly userService: UserService,
    ) { }

    async createToken(user: UserEntity) {
        return {
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ id: user.id }),
        };
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ email: userLoginDto.email });
        const isPasswordValid = await this.validateHash(userLoginDto.password, user && user.passwordHash);
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }

    generateHash(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    validateHash(password: string, hash: string = ''): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
