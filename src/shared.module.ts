import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';

const providers = [];

@Module({
    providers,
    imports: [ConfigModule],
    exports: [...providers, ConfigModule],
})
export class SharedModule {}
