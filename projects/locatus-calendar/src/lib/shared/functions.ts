import * as dateFns from 'date-fns';

export function validateEvents(events) {
    const warn = (...args: any[]) => console.warn('angular-calendar', ...args);
    return validateEventsWithoutLog(events, warn);
}

export function validateEventsWithoutLog(events, log: (...args: any[]) => void): boolean {
    let isValid = true;

    function isError(msg: any, event): void {
        log(msg, event);
        isValid = false;
    }

    if (!Array.isArray(events)) {
        log('Events must be an array', events);
        return false;
    }

    events.forEach(event => {
        if (!event.start) {
            isError('Event is missing the `start` property', event);
        } else if (!dateFns.isDate(event.start)) {
            isError('Event `start` property should be a javascript date object. Do `new Date(event.start)` to fix it.', event);
        }

        if (event.end) {
            if (!dateFns.isDate(event.end)) {
                isError('Event `end` property should be a javascript date object. Do `new Date(event.end)` to fix it.', event);
            }
            if (event.start > event.end) {
                isError('Event `start` property occurs after the `end`', event);
            }
        }
    });

    return isValid;
}

export function getEventsInPeriod({ events, periodStart, periodEnd }: any) {
    return events.filter((event) =>
        isEventIsPeriod({ event, periodStart, periodEnd })
    );
}

export function isEventIsPeriod({ event, periodStart, periodEnd }): boolean {
    const eventStart: Date = event.start;
    const eventEnd: Date = event.end || event.start;

    if (eventStart > periodStart && eventStart < periodEnd) {
        return true;
    }

    if (eventEnd > periodStart && eventEnd < periodEnd) {
        return true;
    }

    if (eventStart < periodStart && eventEnd > periodEnd) {
        return true;
    }

    if (
        dateFns.isSameSecond(eventStart, periodStart) ||
        dateFns.isSameSecond(eventStart, periodEnd)
    ) {
        return true;
    }

    if (
        dateFns.isSameSecond(eventEnd, periodStart) ||
        dateFns.isSameSecond(eventEnd, periodEnd)
    ) {
        return true;
    }

    return false;
}

export function mergeEvents(events: any[], calendars: any[]) {
    return new Promise((resolve, reject) => {
        let i = 1;
        let evs = events;
        if (calendars.length > 0) {
            for (const calendar of calendars) {
                evs = evs.concat(calendar.events);
                if (i === calendars.length) {
                    resolve(evs);
                } else {
                    i++;
                }
            }
        } else {
            resolve(evs);
        }
    });
}