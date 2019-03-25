import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../shared/services/config.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dto/UserDto';
import { ContextService } from '../../providers/context.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';

@Injectable()
export class AuthService {
    private static _authUserKey = 'user_key';

    constructor(
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly userService: UserService,
    ) { }

    async createToken(user: UserEntity | UserDto): Promise<TokenPayloadDto> {
        return new TokenPayloadDto({
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: await this.jwtService.signAsync({ id: user.id }),
        });
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
        const user = await this.userService.findUser({ email: userLoginDto.email });
        const isPasswordValid = await UtilsService.validateHash(userLoginDto.password, user && user.password);
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }

    setAuthUser(user: UserEntity) {
        return AuthService.setAuthUser(user);
    }

    getAuthUser() {
        return AuthService.getAuthUser();
    }

    static setAuthUser(user: UserEntity) {
        ContextService.set(AuthService._authUserKey, user);
    }

    static getAuthUser(): UserEntity {
        return ContextService.get(AuthService._authUserKey);
    }
}
