import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) {}

    @Get('logs')
    async getLogs() {
        return await this.metricsService.getLogs();
    }

    @Get()
    async getMetrics() {
        return await this.metricsService.getMetrics();
    }
}
