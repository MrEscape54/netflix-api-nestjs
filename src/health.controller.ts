// src/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      ok: true,
      service: 'netflix-api',
      timestamp: new Date().toISOString(),
    };
  }
}
