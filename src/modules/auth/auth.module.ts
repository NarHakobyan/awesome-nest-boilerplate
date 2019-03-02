import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { ConfigService } from '../config/config.service';
import { ConfigModule } from '../config/config.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => UserModule),
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
        AuthService,
    ],
})
export class AuthModule { }
