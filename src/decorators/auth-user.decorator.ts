import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export function AuthUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (user?.[Symbol.for('isPublic')]) {
      return;
    }

    return user;
  })();
}
