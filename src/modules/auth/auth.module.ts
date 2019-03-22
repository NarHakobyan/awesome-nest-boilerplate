import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Module, forwardRef } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { ConfigService } from '../../shared/services/config.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        SharedModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [
                SharedModule,
            ],
            useFactory: async (configService: ConfigService) => {
                return {
                    secretOrPrivateKey: configService.get('JWT_SECRET_KEY'),
                    signOptions: {
                        expiresIn: configService.getNumber('JWT_EXPIRATION_TIME'),
                    },
                };
            },
            inject: [
                ConfigService,
            ],
        }),
    ],
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService,
        JwtStrategy,
    ],
    exports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        AuthService,
    ],
})
export class AuthModule { }
