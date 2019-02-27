import { InjectRepository } from '@nestjs/typeorm';
import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { UserLoginDto } from '../dto/auth/UserLoginDto';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Controller('auth')
export class AuthController {

    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
    ) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    async userLogin(@Body() userLoginDto: UserLoginDto) {
        const user = await this.userRepository.findOne({ email: userLoginDto.email });
        if (!user) {
            throw new UserNotFoundException();
        }
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getCurrentUser() {
        // jwt.verify(user.passwordHash, process.env.JWT_SECRET);
        // const tokenData = <{ id: string }> jwt.decode(userLoginDto.userToken);
    }
}
