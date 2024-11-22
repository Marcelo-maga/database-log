import { Log } from './@types/log';
import { PageTime } from './@types/page-time';

export function groupLogsByUser(logs: Log[]): Record<string, Log[]> {
    const userActions: Record<string, Log[]> = {};
    logs.forEach(log => {
        if (!userActions[log.id_usuario]) {
            userActions[log.id_usuario] = [];
        }
        userActions[log.id_usuario].push(log);
    });
    return userActions;
}

export function calculateTimeDifference(timestamp1: string, timestamp2: string): number {
    const time1 = new Date(timestamp1);
    const time2 = new Date(timestamp2);
    return (time2.getTime() - time1.getTime()) / 1000;
}

export function calculatePageTimes(userActions: Record<string, Log[]>): Record<string, PageTime> {
    const pageTimes: Record<string, PageTime> = {};

    Object.keys(userActions).forEach(userId => {
        const actions = userActions[userId];
        actions.forEach((action, index) => {
            if (action.acao === 'view_page' && actions[index + 1]?.acao === 'logout') {
                const timeSpent = calculateTimeDifference(action.timestamp, actions[index + 1].timestamp);
                if (!pageTimes[action.detalhes]) {
                    pageTimes[action.detalhes] = { total: 0, count: 0 };
                }
                pageTimes[action.detalhes].total += timeSpent;
                pageTimes[action.detalhes].count += 1;
            }
        });
    });

    Object.keys(pageTimes).forEach(page => {
        pageTimes[page].averageTime = pageTimes[page].total / pageTimes[page].count;
    });

    return pageTimes;
}

export function identifyPeakUsageTimes(logs: Log[]): Record<number, number> {
    const usageCounts: Record<number, number> = {};

    logs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        if (!usageCounts[hour]) {
            usageCounts[hour] = 0;
        }
        usageCounts[hour] += 1;
    });

    return usageCounts;
}
