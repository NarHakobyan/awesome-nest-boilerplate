import { BadRequestException } from '@nestjs/common';

export class PageTypeException extends BadRequestException {
  constructor() {
    super('error.pageType');
  }
}
