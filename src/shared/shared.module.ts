import { Global, HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AwsS3Service } from './services/aws-s3.service';
import { ConfigService } from './services/config.service';
import { GeneratorService } from './services/generator.service';
import { TranslationService } from './services/translation.service';
import { ValidatorService } from './services/validator.service';

const providers = [
    ConfigService,
    ValidatorService,
    AwsS3Service,
    GeneratorService,
    TranslationService,
];

@Global()
@Module({
    providers,
    imports: [
        HttpModule,
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secretOrPrivateKey: configService.get('JWT_SECRET_KEY'),
                // if you want to use token with expiration date
                // signOptions: {
                //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
                // },
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [...providers, HttpModule, JwtModule],
})
export class SharedModule {}
