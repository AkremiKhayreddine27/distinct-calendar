export const DAYS_IN_WEEK = 7;

export const HOURS_IN_DAY = 24;

export const MINUTES_IN_HOUR = 60;

export const SECONDS_IN_DAY: number = 60 * 60 * 24;

export const SECONDS_IN_WEEK: number = SECONDS_IN_DAY * DAYS_IN_WEEK;

export enum DAYS_OF_WEEK {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}

export const DEFAULT_WEEKEND_DAYS: number[] = [
    DAYS_OF_WEEK.SUNDAY,
    DAYS_OF_WEEK.SATURDAY
];

