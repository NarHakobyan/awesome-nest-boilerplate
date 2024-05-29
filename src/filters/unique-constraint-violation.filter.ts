import { STATUS_CODES } from 'node:http';

import { UniqueConstraintViolationException } from '@mikro-orm/core';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';

@Catch(UniqueConstraintViolationException)
export class UniqueConstraintViolationFilter
  implements ExceptionFilter<UniqueConstraintViolationException>
{
  constructor(public reflector: Reflector) {}

  catch(
    exception: UniqueConstraintViolationException & { constraint: string },
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
      message: `error.${exception.constraint}`,
    });
  }
}
