import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([UserRepository]),
    ],
    controllers: [UserController],
    exports: [UserService],
    providers: [
        UserService,
    ],
})
export class UserModule {}
