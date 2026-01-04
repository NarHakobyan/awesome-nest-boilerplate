import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateSettingsHandler } from './commands/create-settings.command.ts';
import { UserController } from './user.controller.ts';
import { UserEntity } from './user.entity.ts';
import { UserService } from './user.service.ts';
import { UserSettingsEntity } from './user-settings.entity.ts';
import { SharedModule } from '../../shared/shared.module.ts';

const handlers = [CreateSettingsHandler];

@Module({
	imports: [
        SharedModule,
		TypeOrmModule.forFeature([
			UserEntity, UserSettingsEntity
		]),
	],
	controllers: [UserController],
	providers: [UserService, ...handlers],
	exports: [UserService],
})
export class UserModule { }
