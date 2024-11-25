import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { PrismaService } from '../services/prisma.service';
import { Log } from './@types/log';
import {
    calculatePageTimes,
    groupLogsByUser,
    identifyPeakUsageTimes,
} from './metrics.utils';

@Injectable()
export class MetricsService {
    constructor(private readonly prisma: PrismaService) {}

    async getRawLogsFile() {
        const fileContent = await fs.readFile(
            '/home/marcelomaga/repositories/database-log/logs_uso.json',
            'utf-8',
        );

        const jsonData = JSON.parse(fileContent) as Log[];

        await this.processMetrics(jsonData);
    }

    async processMetrics(logs: Log[]): Promise<void> {
        const userActions = groupLogsByUser(logs);
        const pageTimes = calculatePageTimes(userActions);
        const peakUsageTimes = identifyPeakUsageTimes(logs);

        await this.saveMetrics(pageTimes, peakUsageTimes);
    }

    private async saveMetrics(
        pageTimes: any,
        peakUsageTimes: any,
    ): Promise<void> {
        await this.prisma.metric.create({
            data: {
                pageTimes: pageTimes,
                peakUsageTimes: peakUsageTimes,
                createdAt: new Date(),
            },
        });
        console.log('Metrics saved to MongoDB');
    }

    // Retorna métricas tratadas
    async getMetrics() {
        return await this.prisma.metric.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}
