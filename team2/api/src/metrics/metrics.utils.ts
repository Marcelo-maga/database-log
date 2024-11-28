import { Log } from './@types/log';

export function countActionsByUser(logs: Log[]): Record<string, number> {
    return logs.reduce(
        (counter, log) => {
            counter[log.id_usuario] = (counter[log.id_usuario] || 0) + 1;
            return counter;
        },
        {} as Record<string, number>,
    );
}

export function mostCommonAction(logs: Log[]): {
    action: string;
    count: number;
} {
    const actionCounts = logs.reduce(
        (counter, log) => {
            counter[log.acao] = (counter[log.acao] || 0) + 1;
            return counter;
        },
        {} as Record<string, number>,
    );

    const [action, count] = Object.entries(actionCounts).reduce(
        (mostCommon, current) =>
            current[1] > mostCommon[1] ? current : mostCommon,
    );

    return { action, count };
}

export function mostActiveUser(logs: Log[]): {
    userId: string;
    count: number;
} {
    const userActionCounts = countActionsByUser(logs);

    const [userId, count] = Object.entries(userActionCounts).reduce(
        (mostActive, current) =>
            current[1] > mostActive[1] ? current : mostActive,
    );

    return { userId, count };
}

export function countActionsByDay(logs: Log[]): Record<string, number> {
    return logs.reduce(
        (counter, log) => {
            const day = log.timestamp.split(' ')[0];
            counter[day] = (counter[day] || 0) + 1;
            return counter;
        },
        {} as Record<string, number>,
    );
}
