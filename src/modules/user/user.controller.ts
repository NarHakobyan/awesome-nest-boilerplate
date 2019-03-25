'use strict';

import { Get, HttpCode, HttpStatus, Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '@nestjs/swagger';

import { Roles } from '../../decorators/roles.decorator';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthUserInterceptor } from '../../interceptors/auth-user-interceptor.service';
import { UserEntity } from './user.entity';

@Controller('users')
@ApiUseTags('users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuthUserInterceptor)
@ApiBearerAuth()
export class UserController {

    @Get('admin')
    @Roles(RoleType.User)
    @HttpCode(HttpStatus.OK)
    async admin(@AuthUser() user: UserEntity) {
        return 'only for you admin: ' + user.firstName;
    }

    // TODO create best PRACTICE for pagination https://github.com/bashleigh/nestjs-typeorm-paginate/blob/master/src/pagination.ts
}
