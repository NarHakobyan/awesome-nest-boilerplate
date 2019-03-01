import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, HttpModule } from '@nestjs/common';

import { ConfigService } from './modules/config/config.service';
import { UserEntity } from './modules/user/user.entity';
import { UtilsService } from './providers/utils.service';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([
            UserEntity,
        ]),
    ],
    providers: [
        ConfigService,
        UtilsService,
    ],
    exports: [ConfigService, UtilsService],
})
export class SharedModule {}
