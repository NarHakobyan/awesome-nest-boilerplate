import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { Class } from 'type-fest';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  logger: Logger;

  constructor(@Inject(INQUIRER) private parentClass: Class<unknown>) {
    this.logger = new Logger(this.parentClass.constructor.name);
  }
}
