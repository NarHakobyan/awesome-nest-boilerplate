import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import {
  Catch,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import type { Response } from 'express';
import { STATUS_CODES } from 'http';
import { isArray, isEmpty, snakeCase } from 'lodash';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}

  catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let statusCode = exception.getStatus();
    const r = exception.getResponse() as any;

    if (isArray(r.message) && r.message[0] instanceof ValidationError) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      r.error = STATUS_CODES[statusCode];
      const validationErrors = r.message as ValidationError[];
      this.validationFilter(validationErrors);
    }

    r.statusCode = statusCode;
    r.error = STATUS_CODES[statusCode];

    response.status(statusCode).json(r);
  }

  private validationFilter(validationErrors: ValidationError[]): void {
    for (const validationError of validationErrors) {
      if (!isEmpty(validationError.children)) {
        this.validationFilter(validationError.children);
        return;
      }

      for (const [constraintKey, constraint] of Object.entries(
        validationError.constraints,
      )) {
        // convert default messages
        if (!constraint) {
          // convert error message to error.fields.{key} syntax for i18n translation
          validationError.constraints[
            constraintKey
          ] = `error.fields.${snakeCase(constraintKey)}`;
        }
      }
    }
  }
}
