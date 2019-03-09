import { createParamDecorator } from '@nestjs/common';

export const AuthUser = createParamDecorator((_data, request) => request.user);
