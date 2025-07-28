import type { Request } from 'express';

import type { UserEntity } from '../modules/user/user.entity.ts';

export interface IAuthenticatedRequest extends Request {
  user?: UserEntity;
}
