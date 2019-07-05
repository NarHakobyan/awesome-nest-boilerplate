'use strict';

import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Query,
    UseGuards,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';

import { Roles } from '../../decorators/roles.decorator';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthUserInterceptor } from '../../interceptors/auth-user-interceptor.service';
import { UserEntity } from './user.entity';
import { UsersPageOptionsDto } from './dto/users-page-options.dto';
import { UserService } from './user.service';
import { UsersPageDto } from './dto/users-page.dto';

@Controller('users')
@ApiUseTags('users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuthUserInterceptor)
@ApiBearerAuth()
export class UserController {

    constructor(private _userService: UserService) {}

    @Get('admin')
    @Roles(RoleType.User)
    @HttpCode(HttpStatus.OK)
    async admin(@AuthUser() user: UserEntity) {
        return 'only for you admin: ' + user.firstName;
    }

    @Get('users')
    @Roles(RoleType.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Get users list', type: UsersPageDto })
    getUsers(
        @Query(new ValidationPipe({ transform: true }))
            pageOptionsDto: UsersPageOptionsDto,
    ): Promise<UsersPageDto> {
        return this._userService.getUsers(pageOptionsDto);
    }
}
