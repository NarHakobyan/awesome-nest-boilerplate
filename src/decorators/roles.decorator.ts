import { Reflector } from '@nestjs/core';

/* eslint-disable @typescript-eslint/naming-convention */
// biome-ignore lint/style/useNamingConvention: decorator names use PascalCase by NestJS convention
export const Roles = Reflector.createDecorator<string[]>({ key: 'roles' });
/* eslint-enable @typescript-eslint/naming-convention */
