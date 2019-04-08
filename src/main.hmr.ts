import * as morgan from 'morgan';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as RateLimit from 'express-rate-limit';
import { Transport } from '@nestjs/microservices';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';

import { AppModule } from './app.module';
import { setupSwagger } from './viveo-swagger';
import { ConfigService } from './shared/services/config.service';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { SharedModule } from './shared.module';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, bodyParser: true });
    app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    app.use(helmet());
    app.use(new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
    }));
    app.use(compression());
    app.use(morgan('combined'));

    const reflector = app.get(Reflector);

    app.useGlobalFilters(new HttpExceptionFilter(reflector));

    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        dismissDefaultMessages: true,
        validationError: {
            target: false,
        },
    }));

    const configService = app.select(SharedModule).get(ConfigService);

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            port: configService.getNumber('TRANSPORT_PORT'),
            retryAttempts: 5,
            retryDelay: 3000,
        },
    });

    await app.startAllMicroservicesAsync();

    if (['development', 'staging'].includes(configService.nodeEnv)) {
        setupSwagger(app);
    }

    const port = configService.getNumber('PORT');
    await app.listen(port);

    console.info(`server running on port ${port}`);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

bootstrap();
