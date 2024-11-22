import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { groupLogsByUser, calculatePageTimes, identifyPeakUsageTimes } from './metrics.utils';

@Injectable()
export class MetricsService {
    private logs = [
        { id_log: 'LOG_0000', id_usuario: 'USR_0000', acao: 'login', timestamp: '2024-10-27 19:26:25', detalhes: 'click_button' },
        { id_log: 'LOG_0001', id_usuario: 'USR_0003', acao: 'click_button', timestamp: '2024-10-25 09:54:47', detalhes: 'view_page' },
        { id_log: 'LOG_0002', id_usuario: 'USR_0007', acao: 'login', timestamp: '2024-10-29 07:26:00', detalhes: 'purchase' },
        { id_log: 'LOG_0003', id_usuario: 'USR_0004', acao: 'logout', timestamp: '2024-10-25 16:23:20', detalhes: 'purchase' },
        { id_log: 'LOG_0004', id_usuario: 'USR_0006', acao: 'view_page', timestamp: '2024-10-29 03:58:44', detalhes: 'logout' },
    ];

    private metrics: any[] = [];

    // @Cron('*/30 * * * * *')
    async getRawLogs(): Promise<void> {
        await this.processMetrics(this.logs);
    }

    async processMetrics(logs: any[]): Promise<void> {
        const userActions = groupLogsByUser(logs);
        const pageTimes = calculatePageTimes(userActions);
        const peakUsageTimes = identifyPeakUsageTimes(logs);

        this.saveMetrics(pageTimes, peakUsageTimes);
    }

    private saveMetrics(pageTimes: any, peakUsageTimes: any): void {
        const newMetrics = {
            pageTimes,
            peakUsageTimes,
            createdAt: new Date(),
        };
        this.metrics.push(newMetrics);
        console.log('Metrics saved in memory:', newMetrics);
    }

    async getMetrics() {
        return this.metrics;
    }
}
