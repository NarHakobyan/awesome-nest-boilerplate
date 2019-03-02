import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
    ],
    exports: [UserService],
    providers: [
        UserService,
    ],
})
export class UserModule {}
