import { SetMetadata } from '@nestjs/common';

import type { RoleType } from '../constants/role-type.ts';

export const ROLES_KEY = 'roles';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = (roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
