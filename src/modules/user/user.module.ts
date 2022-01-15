import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateSettingsHandler } from './commands/create-settings.command';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserSettingsRepository } from './user-settings.repository';

export const handlers = [CreateSettingsHandler];

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, UserSettingsRepository])],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, ...handlers],
})
export class UserModule {}
