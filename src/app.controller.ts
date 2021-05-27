import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import type { HealthCheckResult } from '@nestjs/terminus';
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ConfigService } from './shared/services/config.service';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private configService: ConfigService,
    private microserviceHealthIndicator: MicroserviceHealthIndicator,
  ) {}

  @Get('health-check')
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      () =>
        this.microserviceHealthIndicator.pingCheck('auth-service', {
          transport: Transport.NATS,
          options: {
            url: `nats://${this.configService.natsConfig.host}:${this.configService.natsConfig.port}`,
            queue: 'main_service',
          },
        }),
    ]);
  }
}
