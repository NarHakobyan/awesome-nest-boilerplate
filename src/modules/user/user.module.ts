import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [
        UserService,
    ],
})
export class UserModule {}
