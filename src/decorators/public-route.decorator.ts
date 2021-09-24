import type { CustomDecorator } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'public_route';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PublicRoute = (isPublic = false): CustomDecorator =>
  SetMetadata(PUBLIC_ROUTE_KEY, isPublic);
