import * as morgan from 'morgan';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { setupSwagger } from './viveo-swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.set('trust proxy', true);
    app.use(morgan('combined'));

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }));

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            port: +process.env.TRANSPORT_PORT,
        },
    });

    await app.startAllMicroservicesAsync();

    if (['development', 'staging'].includes(process.env.NODE_ENV || 'development')) {
        setupSwagger(app);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.info(`server running on port ${port}`);
}

bootstrap();
