import { Reflector } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Roles = Reflector.createDecorator<string[]>();
