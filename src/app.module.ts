import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import { AuthController } from './controllers/auth.controller';
import { ConfigService } from './providers/config.service';
import { contextMiddleware } from './middlewares';
import { CoreModule } from './core.module';

@Module({
    imports: [
        CoreModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [CoreModule],
            useFactory: (configService: ConfigService) => configService.typeOrmConfig,
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
        consumer.apply(contextMiddleware).forRoutes('*');
    }
}
