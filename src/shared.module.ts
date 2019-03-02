import { Module, Global } from '@nestjs/common';
import { UtilsService } from './providers/utils.service';

const providers = [
    UtilsService,
];

@Global()
@Module({
    providers,
    imports: [],
    exports: [...providers],
})
export class SharedModule {}
