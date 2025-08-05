import { ForbiddenException } from '@nestjs/common';

export class UserForbiddenException extends ForbiddenException {
  constructor(error?: string) {
    super('error.userForbiddenException', error);
  }
}
