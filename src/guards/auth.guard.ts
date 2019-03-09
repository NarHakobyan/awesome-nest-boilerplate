import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

export const AuthGuard = NestAuthGuard('jwt');
