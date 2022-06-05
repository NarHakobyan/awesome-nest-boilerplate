import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { HealthCheckResult } from '@nestjs/terminus';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { ServiceHealthIndicator } from './health-indicators/service.indicator';

@Controller('health')
@ApiTags('health')
export class HealthCheckerController {
  constructor(
    private healthCheckService: HealthCheckService,
    private serviceIndicator: ServiceHealthIndicator,
  ) {}

  @Get()
  @ApiOkResponse()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      () => this.serviceIndicator.isHealthy('search-service-health'),
    ]);
  }
}
