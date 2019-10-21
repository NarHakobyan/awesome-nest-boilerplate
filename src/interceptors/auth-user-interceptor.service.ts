import { Observable } from 'rxjs';
import {
    ExecutionContext,
    Injectable,
    NestInterceptor,
    CallHandler,
} from '@nestjs/common';

import { UserEntity } from '../modules/user/user.entity';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        const user = <UserEntity>request.user;
        AuthService.setAuthUser(user);

        return next.handle();
    }
}
