import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../entities/user.entity';
import { UserLoginDto } from '../dto/auth/UserLoginDto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        public readonly userRepository: Repository<UserEntity>,
    ) {}

    async login(loginData: UserLoginDto) {
    }
}
