import { Module } from '@nestjs/common';

import { CreateSettingsHandler } from './commands/create-settings.command';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserSettingsEntity } from './user-settings.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';

const handlers = [CreateSettingsHandler];

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity, UserSettingsEntity])],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService, ...handlers],
})
export class UserModule {}
