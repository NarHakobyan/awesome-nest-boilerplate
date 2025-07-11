import './boilerplate.polyfill';

import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import compression from 'compression';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module.ts';
import { HttpExceptionFilter } from './filters/bad-request.filter.ts';
import { QueryFailedFilter } from './filters/query-failed.filter.ts';
import { TranslationInterceptor } from './interceptors/translation-interceptor.service.ts';
import { setupSwagger } from './setup-swagger.ts';
import { ApiConfigService } from './shared/services/api-config.service.ts';
import { TranslationService } from './shared/services/translation.service.ts';
import { SharedModule } from './shared/shared.module.ts';

export async function bootstrap(): Promise<NestExpressApplication> {
  initializeTransactionalContext();
  
  // HTTPS Configuration
  const useHttps = process.env.USE_HTTPS === 'true';
  let httpsOptions;
  
  if (useHttps) {
    try {
      const keyPath = join(process.cwd(), process.env.SSL_KEY_PATH || 'ssl/private-key.pem');
      const certPath = join(process.cwd(), process.env.SSL_CERT_PATH || 'ssl/certificate.pem');
      
      httpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      };
      
      console.log('🔐 HTTPS enabled for development');
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Failed to load SSL certificates:', error.message);
      } else {
        console.error('❌ Failed to load SSL certificates:', error);
      }
      console.error('   Run: yarn ssl:generate');
      process.exit(1);
    }
  }
  
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      httpsOptions,
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || [
          useHttps ? 'https://localhost:3443' : 'http://localhost:3000'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
      }
    },
  );
  app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  app.use(helmet());
  // app.setGlobalPrefix('/api'); use api as global prefix if you don't have subdomain
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TranslationInterceptor(
      app.select(SharedModule).get(TranslationService),
    ),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const configService = app.select(SharedModule).get(ApiConfigService);

  // only start nats if it is enabled
  if (configService.natsEnabled) {
    const natsConfig = configService.natsConfig;
    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        url: `nats://${natsConfig.host}:${natsConfig.port}`,
        queue: 'main_service',
      },
    });

    await app.startAllMicroservices();
  }

  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  // Starts listening for shutdown hooks
  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  // Port configuration with HTTPS support
  const port = useHttps 
    ? process.env.HTTPS_PORT || 3443 
    : configService.appConfig.port;

  if ((<any>import.meta).env.PROD) {
    await app.listen(port);
    const protocol = useHttps ? 'https' : 'http';
    console.info(`server running on ${protocol}://localhost:${port}`);
    
    if (configService.documentationEnabled) {
      console.info(`API documentation: ${protocol}://localhost:${port}/documentation`);
    }
  }

  return app;
}

export const viteNodeApp = bootstrap();
