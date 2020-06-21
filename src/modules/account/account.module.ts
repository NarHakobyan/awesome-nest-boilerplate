import { Module } from '@nestjs/common';

import { AccountController } from './account.controller';

@Module({
    controllers: [AccountController],
})
export class AccountModule {}
