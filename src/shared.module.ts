import { Module, Global } from '@nestjs/common';
import { ConfigService } from './shared/services/config.service';

const providers = [ConfigService];

@Global()
@Module({
    providers,
    imports: [],
    exports: [...providers],
})
export class SharedModule {}
