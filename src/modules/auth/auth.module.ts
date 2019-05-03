import { PassportModule } from '@nestjs/passport';
import { Module, forwardRef } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        PassportModule.register({ defaultStrategy: 'jwt' }),
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
