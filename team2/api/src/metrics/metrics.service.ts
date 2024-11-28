import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Log } from './@types/log';
import {
    countActionsByDay,
    countActionsByUser,
    mostCommonAction,
} from './metrics.utils';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MetricsService {
    constructor(private readonly prisma: PrismaService) {}

    @Cron('*/30 * * * * *')
    async getLogs() {
        console.log('Processando logs');

        const result = await fetch('http://localhost:3001/logs');

        const response = await result.json();

        if (response.message) {
            console.log('Nenhum novo log para processar');
            return;
        }

        const logsArray = response as Log[];

        await this.processMetrics(logsArray);

        console.log('Logs processados com sucesso');
    }

    async processMetrics(logs: Log[]): Promise<void> {
        const userActions = countActionsByUser(logs);
        const dailyActions = countActionsByDay(logs);
        const commonAction = mostCommonAction(logs);

        await this.saveMetrics(userActions, dailyActions, commonAction);
    }

    private async saveMetrics(
        userActions: Record<string, number>,
        dailyActions: Record<string, number>,
        commonAction: { action: string; count: number },
    ): Promise<void> {
        await this.prisma.metric.create({
            data: {
                createdAt: new Date(),
                type: 'Metrics',
                details: {
                    create: [
                        ...Object.entries(userActions).map(
                            ([userId, count]) => ({
                                key: `Ação por Usuário: ${userId}`,
                                value: `${count} ações`,
                            }),
                        ),

                        ...Object.entries(dailyActions).map(([day, count]) => ({
                            key: `Ação no Dia: ${day}`,
                            value: `${count} ações`,
                        })),

                        {
                            key: `Ação Mais Comum: ${commonAction.action}`,
                            value: `${commonAction.count} ocorrências`,
                        },
                    ],
                },
            },
        });

        console.log('Métricas salvas com sucesso');
    }

    async getMetrics() {
        const metrics = await this.prisma.metric.findMany({
            orderBy: { createdAt: 'desc' },
            include: { details: true },
        });

        const formattedMetrics = metrics.map((metric) => {
            const date = new Date(metric.createdAt);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

            const actionsByUser: Record<string, number> = {};
            const actionsByDay: Record<string, number> = {};
            let commonAction = { action: '', count: 0 };

            metric.details.forEach((detail) => {
                const [type, info] = detail.key.split(': ');

                if (type === 'Ação por Usuário') {
                    actionsByUser[info] = parseInt(detail.value);
                } else if (type === 'Ação no Dia') {
                    const day = info.split('T')[0]; // Pega apenas a data (ignora hora)
                    actionsByDay[day] = parseInt(detail.value);
                } else if (type === 'Ação Mais Comum') {
                    commonAction = {
                        action: info,
                        count: parseInt(detail.value),
                    };
                }
            });

            return {
                id: metric.id,
                date: formattedDate,
                type: metric.type,
                actionsByUser,
                actionsByDay,
                commonAction,
            };
        });

        return { metrics: formattedMetrics };
    }
}
