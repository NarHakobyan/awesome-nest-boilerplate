import { Observable } from 'rxjs';
import { ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { UserEntity } from '../modules/user/user.entity';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const user = <UserEntity>request.user;
    UserService.setAuthUser(user);

    return call$;
  }
}
