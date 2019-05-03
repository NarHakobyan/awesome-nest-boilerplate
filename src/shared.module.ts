import { JwtModule } from '@nestjs/jwt';
import { Module, Global, HttpModule } from '@nestjs/common';

import { ConfigService } from './shared/services/config.service';
import { ValidatorService } from './shared/services/validator.service';
import { AwsS3Service } from './shared/services/aws-s3.service';
import { GeneratorService } from './shared/services/generator.service';

const providers = [ConfigService, ValidatorService, AwsS3Service, GeneratorService];

@Global()
@Module({
    providers,
    imports: [
        HttpModule,
        JwtModule.registerAsync({
        imports: [
            SharedModule,
        ],
        useFactory: (configService: ConfigService) => {
            return {
                secretOrPrivateKey: configService.get('JWT_SECRET_KEY'),
                // if you want to use token with expiration date
                // signOptions: {
                //     expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
                // },
            };
        },
        inject: [
            ConfigService,
        ],
    })],
    exports: [...providers, HttpModule, JwtModule],
})
export class SharedModule {}
