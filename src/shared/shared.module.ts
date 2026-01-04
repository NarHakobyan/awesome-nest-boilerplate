import type { Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { ApiConfigService } from './services/api-config.service.ts';
import { AwsS3Service } from './services/aws-s3.service.ts';
import { GeneratorService } from './services/generator.service.ts';
import { TranslationService } from './services/translation.service.ts';
import { ValidatorService } from './services/validator.service.ts';

const providers: Provider[] = [
    ApiConfigService,
    ValidatorService,
    GeneratorService,
    AwsS3Service,
    TranslationService,
];

@Global()
@Module({
    imports: [
        CqrsModule,
        ConfigModule,
    ],
    providers,
    exports: [
        CqrsModule,
        ...providers,
    ],
})
export class SharedModule { }