import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [
                ConfigModule,
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
    ],
})
export class AuthModule { }
