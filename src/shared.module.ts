import { Module, Global } from '@nestjs/common';

const providers = [];

@Global()
@Module({
    providers,
    imports: [],
    exports: [...providers],
})
export class SharedModule {}
