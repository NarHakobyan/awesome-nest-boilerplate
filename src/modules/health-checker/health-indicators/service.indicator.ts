import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class ServiceHealthIndicator extends HealthIndicator {
  constructor(
    @Optional()
    @Inject('NATS_SERVICE')
    private readonly clientProxy?: ClientProxy,
  ) {
    super();
  }

  async isHealthy(eventName: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.clientProxy) {
        return {
          [eventName]: {
            status: 'down',
          },
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await firstValueFrom(
        this.clientProxy.send(eventName, { check: true }).pipe(timeout(10_000)),
        {
          defaultValue: undefined,
        },
      );

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [eventName]: result,
      };
    } catch (error) {
      throw new HealthCheckError(`${eventName} failed`, {
        [eventName]: error,
      });
    }
  }
}
