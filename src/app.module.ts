import './boilerplate.polyfill';

import { MikroOrmModule, InjectEntityManager, InjectMikroORM } from '@mikro-orm/nestjs';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { I18nModule } from 'nestjs-i18n';
import path from 'path';

import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { AuthModule } from './modules/auth/auth.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { UserModule } from './modules/user/user.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';
import { EntityManager, MikroORM } from '@mikro-orm/core';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.mikroOrmConfig,
      inject: [ApiConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ApiConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: configService.isDevelopment,
        },
      }),
      imports: [SharedModule],
      inject: [ApiConfigService],
    }),
    HealthCheckerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  logger = new Logger(AppModule.name);
  constructor(
    private readonly orm: MikroORM,
  ) {
    this.runMigrations();
  }

  async runMigrations() {
    const migrator = this.orm.getMigrator();

    const pendingMigrations = await migrator.getPendingMigrations();

    this.logger.log(`Pending migrations: ${pendingMigrations.map(m => m.name).join(', ')}`);

    await migrator.up();
  }
}
