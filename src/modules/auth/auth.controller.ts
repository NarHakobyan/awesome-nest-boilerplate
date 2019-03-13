import { Controller, Post, Body, HttpCode, HttpStatus, Get, BadRequestException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { UserLoginDto } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { UserDto } from './dto/UserDto';

@Controller('auth')
export class AuthController {

    constructor(
        public readonly userService: UserService,
        public readonly authService: AuthService,
    ) {}

    @MessagePattern({ cmd: 'login' })
    login(data: UserLoginDto) {
        return this.userLogin(data);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async userLogin(@Body() userLoginDto: UserLoginDto) {
        const userEntity = await this.authService.validateUser(userLoginDto);

        const [user, token] = await Promise.all([userEntity.toJSON(), this.authService.createToken(userEntity)]);
        return { user, token };
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async userRegister(@Body() userRegisterDto: UserRegisterDto): Promise<UserDto> {
        const user = await this.userService.findUser({ email: userRegisterDto.email });
        if (user) {
            throw new BadRequestException('error.email_already_exists');
        }

        const createdUser = await this.userService.createUser(userRegisterDto);

        return createdUser.toJSON();
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getCurrentUser() {
        // jwt.verify(user.passwordHash, process.env.JWT_SECRET);
        // const tokenData = <{ id: string }> jwt.decode(userLoginDto.userToken);
    }
}
