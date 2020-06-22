import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

// This should be used as guard class
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AuthGuard = NestAuthGuard('jwt');
