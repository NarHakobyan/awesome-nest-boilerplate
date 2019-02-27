import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, HttpModule, DynamicModule } from '@nestjs/common';

import { ConfigService } from './providers/config.service';
import { UserEntity } from './entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { FileService } from './providers/file.service';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([
            UserEntity,
        ]),
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        ConfigService,
        FileService,
    ],
    exports: [ConfigService],
})
export class CoreModule {
    static forRoot(): DynamicModule {
        return {
            module: CoreModule,
            providers: [],
        };
    }
}
