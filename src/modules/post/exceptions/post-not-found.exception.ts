import { NotFoundException } from '@nestjs/common';

export class PostNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.postNotFound', error);
  }
}
