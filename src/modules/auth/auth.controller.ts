import { InjectRepository } from '@nestjs/typeorm';
import { Controller, Post, Body, HttpCode, HttpStatus, Get, BadRequestException } from '@nestjs/common';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { UserService } from '../user/user.service';
import { UtilsService } from '../../providers/utils.service';
import { UserDto } from './dto/UserDto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
        public readonly userService: UserService,
        public readonly authService: AuthService,
        public readonly utilsService: UtilsService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async userLogin(@Body() userLoginDto: UserLoginDto) {
        const user = await this.authService.validateUser(userLoginDto);

        // TODO add JWT token
        return this.utilsService.toDto(UserDto, user);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async userRegister(@Body() userRegisterDto: UserRegisterDto): Promise<UserDto> {
        const user = await this.userService.findUser({ email: userRegisterDto.email });
        if (user) {
            throw new BadRequestException('error.email_already_exists');
        }

        const createdUser = await this.userService.createUser(userRegisterDto);

        return this.utilsService.toDto(UserDto, createdUser);
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getCurrentUser() {
        // jwt.verify(user.passwordHash, process.env.JWT_SECRET);
        // const tokenData = <{ id: string }> jwt.decode(userLoginDto.userToken);
    }
}
