import { ReflectMetadata } from '@nestjs/common';
import { RoleType } from '../constants/role-type';

export const Roles = (...roles: RoleType[]) => ReflectMetadata('roles', roles);
