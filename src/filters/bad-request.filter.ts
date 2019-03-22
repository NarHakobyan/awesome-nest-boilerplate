import * as _ from 'lodash';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class HttpExceptionFilter implements ExceptionFilter {

    constructor(public reflector: Reflector) {}

    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        if (_.isArray(exception.message.message) && exception.message.message[0] instanceof ValidationError) {
            const validationErrors = <ValidationError[]> exception.message.message;
            this._validationFilter(validationErrors);
        }

        response
            .status(status)
            .json(exception.message);
    }

    private _validationFilter(validationErrors: ValidationError[]) {
        for (const validationError of validationErrors) {
            for (const [constraintKey, constraint] of Object.entries(validationError.constraints)) {
                // convert default messages
                if (!constraint) {
                    // convert error message to error.fields.{key} syntax for i18n translation
                    validationError.constraints[constraintKey] = 'error.fields.' + _.snakeCase(constraintKey);
                }
            }
            if (!_.isEmpty(validationError.children)) {
                this._validationFilter(validationError.children);
            }
        }
    }
}
