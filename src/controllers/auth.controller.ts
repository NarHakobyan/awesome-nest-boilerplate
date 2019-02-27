import { InjectRepository } from '@nestjs/typeorm';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserLoginDto } from '../dto/auth/UserLoginDto';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Controller('auth')
export class AuthController {

    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
    ) {}

    // @Post()
    // @HttpCode(HttpStatus.ACCEPTED)
    // async migrateInstagram(@Body() createInstagramJobDto: UserLoginDto) {
    //   jwt.verify(createInstagramJobDto.userToken, process.env.JWT_SECRET);
    //   const tokenData = <{ id: string }> jwt.decode(createInstagramJobDto.userToken);
    //
    //   console.info(tokenData);
    // }

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    async migrateInstagram(@Body() userLoginDto: UserLoginDto) {

    }
}
