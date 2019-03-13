import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
    BadRequestException,
    UseInterceptors,
    ClassSerializerInterceptor,
    UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UserLoginDto } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { UserDto } from './dto/UserDto';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UserEntity } from '../user/user.entity';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUserInterceptor } from '../../interceptors/auth-user-interceptor.service';

@Controller('auth')
@ApiUseTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {

    constructor(
        public readonly userService: UserService,
        public readonly authService: AuthService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: LoginPayloadDto, description: 'User info with access token' })
    async userLogin(@Body() userLoginDto: UserLoginDto): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateUser(userLoginDto);

        const [user, token] = await Promise.all([userEntity.toDto(), this.authService.createToken(userEntity)]);
        return new LoginPayloadDto(user, token);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: UserDto, description: 'successfully loggedIn' })
    @ApiBadRequestResponse({ description: 'unique email exeption' })
    async userRegister(@Body() userRegisterDto: UserRegisterDto): Promise<UserDto> {
        const user = await this.userService.findUser({ email: userRegisterDto.email });
        if (user) {
            throw new BadRequestException('error.email_already_exists');
        }

        const createdUser = await this.userService.createUser(userRegisterDto);

        return createdUser.toDto();
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @UseInterceptors(AuthUserInterceptor)
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserDto, description: 'current user info' })
    getCurrentUser(@AuthUser() user: UserEntity) {
        return user.toDto();
    }
}
