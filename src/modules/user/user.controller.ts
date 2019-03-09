'use strict';

import { Get, HttpCode, HttpStatus, Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthUserInterceptor } from '../../interceptors/auth-user-interceptor.service';
import { UserEntity } from './user.entity';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuthUserInterceptor)
export class UserController {

    @Get('admin')
    @Roles(RoleType.Admin)
    @HttpCode(HttpStatus.OK)
    async admin(@AuthUser() user: UserEntity) {
        return 'only for you admin: ' + user.firstName;
    }
}
