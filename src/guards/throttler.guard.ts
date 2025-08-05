import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { ThrottlerLimitDetail } from '@nestjs/throttler';
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';

import { TooManyRequestsException } from '../exceptions/too-many-requests.exception.ts';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new TooManyRequestsException('Too many requests');
  }
}
