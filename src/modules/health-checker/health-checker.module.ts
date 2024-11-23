import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCheckerController } from './health-checker.controller.ts';
import { ServiceHealthIndicator } from './health-indicators/service.indicator.ts';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckerController],
  providers: [ServiceHealthIndicator],
})
export class HealthCheckerModule {}
