/* eslint-disable @typescript-eslint/tslint/config */
import {
    applyDecorators,
    Param,
    ParseUUIDPipe,
    PipeTransform,
    SetMetadata,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { RoleType } from '../common/constants/role-type';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthUserInterceptor } from '../interceptors/auth-user-interceptor.service';

export function Auth(...roles: RoleType[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AuthGuard, RolesGuard),
        ApiBearerAuth(),
        UseInterceptors(AuthUserInterceptor),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    );
}

export function UUIDParam(
    property: string,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
    return Param(property, new ParseUUIDPipe({ version: '4' }), ...pipes);
}
