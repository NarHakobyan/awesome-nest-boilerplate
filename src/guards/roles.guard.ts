import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RoleType } from '../constants/role-type.ts';
import { ROLES_KEY } from '../decorators/roles.decorator.ts';
import { UserForbiddenException } from '../exceptions/user-forbidden.exception.ts';
import type { IAuthenticatedRequest } from '../interfaces/i-authenticated-request.ts';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RoleType[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UserForbiddenException('User not authenticated');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UserForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
