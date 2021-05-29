import { Global, HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

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
  {
    provide: 'NATS_SERVICE',
    useFactory: (configService: ConfigService) => {
      const natsConfig = configService.natsConfig;
      return ClientProxyFactory.create({
        transport: Transport.NATS,
        options: {
          name: 'NATS_SERVICE',
          url: `nats://${natsConfig.host}:${natsConfig.port}`,
        },
      });
    },
    inject: [ConfigService],
  },
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
