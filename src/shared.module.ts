import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { MicroserviceModule } from './modules/microservice/microservice.module';

const providers = [];

@Module({
    providers,
    imports: [ConfigModule, MicroserviceModule.forRoot({ autoConnect: true })],
    exports: [...providers, ConfigModule, MicroserviceModule],
})
export class SharedModule {}
