export interface EventAction {
    label: string;
    cssClass?: string;
    onClick({ event }: { event: CalendarEvent }): any;
}

export interface Calendar {
    id: number;
    name: string;
    url: string;
    isLocal: boolean;
    color: string;
    display: boolean;
    events?: CalendarEvent[];
}

export interface CalendarEvent<MetaType = any> {
    id?: number;
    start: Date;
    end: Date;
    title: string;
    location?: Location;
    description?: string;
    calendar?: Calendar;
    color?: string;
    actions?: EventAction[];
    allDay?: boolean;
    cssClass?: string;
    resizable?: {
        beforeStart?: boolean;
        afterEnd?: boolean;
    };
    draggable?: boolean;
    meta?: MetaType;
}

export interface WeekDay {
    date: Date;
    isPast: boolean;
    isToday: boolean;
    isFuture: boolean;
    isWeekend: boolean;
    cssClass?: string;
}

export interface GetWeekViewHeaderArgs {
    viewDate: Date;
    weekStartsOn: number;
    excluded?: number[];
    weekendDays?: number[];
}

export interface MonthViewDay<MetaType = any> extends WeekDay {
    inMonth: boolean;
    events: any[];
    backgroundColor?: string;
    badgeTotal: number;
    meta?: MetaType;
}

export interface GetMonthViewGridArgs {
    events: any[],
    calendars: any[],
    viewDate: any,
    weekStartsOn: any,
    excluded: any[],
    viewStart?: Date,
    viewEnd?: Date,
    weekendDays: any[]
}