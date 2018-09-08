import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import * as dateFns from 'date-fns';

import {
  DAYS_IN_WEEK,
  DEFAULT_WEEKEND_DAYS,
  HOURS_IN_DAY,

  GetWeekViewHeaderArgs,
  GetMonthViewGridArgs,
  MonthViewDay,
  WeekDay,
  CalendarEvent,

  getEventsInPeriod,
  validateEvents
} from '../../shared';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'locatus-calendar-year-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnChanges {

  /**
* The current view date
*/
  @Input() viewDate: Date;

  /**
 * An array of calendars to display on view.
 */
  @Input() calendars = [];

  /**
  * An array of events to display on view.
  */
  @Input() events = [];

  @Output() yearDayClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output() yearMonthClicked: EventEmitter<any> = new EventEmitter<any>();

  /**
  * An observable that when emitted on will re-render the current view
  */
  @Input() refresh: Subject<any>;

  /**
   * @hidden
   */
  refreshSubscription: Subscription;

  view = { months: [] };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.getView();
        this.cdr.markForCheck();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.events || changes.viewDate) {
      this.getView();
    }
  }

  dayClicked(day) {
    this.yearDayClicked.emit(day);
  }

  monthClicked(month) {
    const date = month.weeks[0].days.find(day => day.inMonth).date;
    this.yearMonthClicked.emit(date);
  }

  getView() {
    this.view.months = [];
    for (let date = dateFns.startOfYear(this.viewDate); date < dateFns.endOfYear(this.viewDate); date = dateFns.addMonths(date, 1)) {
      this.view.months.push(this.getMonthViewGrid({
        events: this.events,
        calendars: this.calendars,
        viewDate: date,
        weekStartsOn: 1,
        excluded: [],
        weekendDays: []
      }));
    }
  }

  getMonthViewGrid({
    events,
    calendars,
    viewDate,
    weekStartsOn,
    excluded = [],
    viewStart = dateFns.startOfMonth(viewDate),
    viewEnd = dateFns.endOfMonth(viewDate),
    weekendDays
  }: GetMonthViewGridArgs) {
    let start: Date = dateFns.startOfWeek(viewStart, { weekStartsOn });
    const end: Date = dateFns.endOfWeek(viewEnd, { weekStartsOn });
    const monthRows = (dateFns.differenceInDays(end, start) + 1) / 7;
    const weeks = [];
    for (let week = 0; week < monthRows; week++) {
      this.mergeEvents(events, calendars).then(evs => {
        const endWeek: Date = dateFns.addDays(start, DAYS_IN_WEEK);
        const eventsInPeriod = this.getMonthEventsInPeriod(evs, start, endWeek);
        const weekDays = this.getMonthWeekDays(evs, viewDate, endWeek, start, excluded);
        weeks.push({
          events: eventsInPeriod,
          days: weekDays
        });
        start = dateFns.addHours(start, (DAYS_IN_WEEK * HOURS_IN_DAY));
      });
    }
    return {
      name: [dateFns.format(viewDate, 'MMMM')],
      weeks: weeks
    };
  }

  getWeekDay({ date, weekendDays = DEFAULT_WEEKEND_DAYS }: { date: Date; weekendDays: number[]; }) {
    const today: Date = dateFns.startOfDay(new Date());
    return {
      date,
      isPast: date < today,
      isToday: dateFns.isSameDay(date, today),
      isFuture: date > today,
      isWeekend: weekendDays.indexOf(dateFns.getDay(date)) > -1
    };
  }

  getMonthWeekDays(events, viewDate, endWeek, start, excluded) {
    let previousDate = null;
    const weekDays = [];
    for (let i = 0; i < dateFns.differenceInDays(endWeek, start); i++) {
      let date: Date;
      if (previousDate) {
        date = dateFns.startOfDay(dateFns.addHours(previousDate, HOURS_IN_DAY));
        if (previousDate.getTime() === date.getTime()) {
          date = dateFns.startOfDay(dateFns.addHours(previousDate, HOURS_IN_DAY + 1));
        }
        previousDate = date;
      } else {
        date = previousDate = start;
      }
      if (!excluded.some(e => date.getDay() === e)) {

        const day: MonthViewDay = this.getWeekDay({
          date,
          weekendDays: []
        }) as MonthViewDay;

        const dayEvents = getEventsInPeriod({
          events,
          periodStart: dateFns.startOfDay(date),
          periodEnd: dateFns.endOfDay(date),
        });
        day.inMonth = dateFns.isSameMonth(date, viewDate);
        day.badgeTotal = dayEvents.length;
        day.events = dayEvents;
        weekDays.push(day);
      }
    }
    return weekDays;
  }

  mergeEvents(events: any[], calendars: any[]) {
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

  getMonthEventsInPeriod(events, start, endWeek) {
    let width;
    let left;
    const eventsInWeek: any[] = [];
    const eventsInPeriod: any[] = getEventsInPeriod({
      events,
      periodStart: start,
      periodEnd: endWeek
    }).map(event => {
      let top = 25;
      let hidden = false;
      width = this.getWidth(event, endWeek, start);
      left = this.getLeft(event, start);
      top = this.getTop(event, eventsInWeek, top);
      if (top > 60) {
        hidden = true;
      }
      eventsInWeek.push({
        event: event,
        left: left,
        width: width,
        top: top,
        hidden: hidden
      });
      return {
        event: event,
        left: left,
        width: width,
        top: top,
        hidden: hidden
      };
    });
    return eventsInPeriod;
  }

  getLeft(event, start) {
    let left;
    if (dateFns.isBefore(event.start, start)) {
      left = 0;
    } else {
      left = (dateFns.differenceInHours(event.start, start) / 168) * 100;
    }

    if (!event.allDay) {
      left = (dateFns.differenceInHours(dateFns.startOfDay(event.start), start) / 168) * 100;
    }

    return left;
  }

  getWidth(event, endWeek, start) {
    let width;
    if (dateFns.differenceInHours(event.end, event.start) > dateFns.differenceInHours(endWeek, event.start)) {
      width = (dateFns.differenceInHours(endWeek, event.start) / 168) * 100;
    } else {
      width = (dateFns.differenceInHours(event.end, event.start) / 168) * 100;
    }

    if (dateFns.isBefore(event.start, start)) {
      width = (dateFns.differenceInHours(event.end, start) / 168) * 100;
    }
    if (width > 100) {
      width = 100;
    }
    return width;
  }

  getTop(event: any, events: any[], top: any) {
    const over = [];
    const tops: number[] = [25, 50, 75];
    for (const e of events) {
      if (
        event.allDay && (
          (dateFns.isSameDay(event.start, e.event.start) || dateFns.isSameDay(event.end, e.event.end)) ||
          dateFns.isWithinRange(event.start, e.event.start, e.event.end) ||
          dateFns.isWithinRange(event.end, e.event.start, e.event.end) ||
          dateFns.isWithinRange(e.event.start, event.start, event.end) ||
          dateFns.isWithinRange(e.event.end, event.start, event.end))
      ) {
        top = e.top + 25;
        over.push(e);
      } else if (
        !event.allDay && (
          dateFns.isSameDay(event.start, e.event.start) ||
          dateFns.isWithinRange(event.start, e.event.start, e.event.end) ||
          dateFns.isWithinRange(event.end, e.event.start, e.event.end) ||
          dateFns.isWithinRange(e.event.start, event.start, event.end) ||
          dateFns.isWithinRange(e.event.end, event.start, event.end))
      ) {
        top = e.top + 25;
        over.push(e);
      }
    }
    for (const o of over) {
      for (const t of tops) {
        if (o.top === t) {
          const index = tops.indexOf(t);
          tops.splice(index, 1);
        }
      }
    }
    if (tops.length > 0) {
      top = tops[0];
    }
    return top;
  }

}
