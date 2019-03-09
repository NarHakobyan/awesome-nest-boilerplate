import { Module, Global } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';

const providers = [];

@Global()
@Module({
    providers,
    imports: [ConfigModule],
    exports: [...providers, ConfigModule],
})
export class SharedModule {}
