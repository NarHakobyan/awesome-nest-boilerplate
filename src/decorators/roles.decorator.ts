import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../constants/role-type';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
