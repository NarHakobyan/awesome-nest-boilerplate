import { Controller, Get } from '@nestjs/common';
import type { HealthCheckResult } from '@nestjs/terminus';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthCheckerController {
  constructor(
    private healthCheckService: HealthCheckService,
    private ormIndicator: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.ormIndicator.pingCheck('database', { timeout: 1500 }),
    ]);
  }
}
