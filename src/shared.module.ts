import { Module } from '@nestjs/common';
import { ConfigService } from './shared/services/config.service';

const providers = [ConfigService];

@Module({
    providers,
    imports: [],
    exports: [...providers],
})
export class SharedModule {}
