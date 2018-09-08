import { Component, OnInit, Input, Output, ViewChild, ElementRef, EventEmitter, OnChanges, ChangeDetectorRef } from '@angular/core';
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
import { CellComponent } from '../cell/cell.component';

@Component({
  selector: 'locatus-calendar-month-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit, OnChanges {

  @ViewChild('container')
  container: ElementRef;

  @ViewChild('cell')
  cell: ElementRef;

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

  /**
  * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
  */
  @Input() excludeDays: number[] = [];

  /**
  * The start number of the week
  */
  @Input() weekStartsOn: number;

  /**
  * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
  */
  @Input() weekendDays: number[];

  /**
  * Whether the events list for the day of the `viewDate` option is visible or not
  */
  @Input() activeDayIsOpen = false;

  /**
  * An observable that when emitted on will re-render the current view
  */
  @Input() refresh: Subject<any>;

  /**
* @hidden
*/
  refreshSubscription: Subscription;

  /**
  * An output that will be called before the view is rendered for the current month.
  * If you add the `cssClass` property to a day in the body it will add that class to the cell element in the template
  */
  @Output()
  beforeViewRender: EventEmitter<{ header: WeekDay[]; body: MonthViewDay[]; }> = new EventEmitter();

  /**
  * Called when the event title is clicked
  */
  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  cellClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  monthDayNumberClicked: EventEmitter<any> = new EventEmitter<any>();

  /**
 * Called when an event is dragged and dropped
 */
  @Output()
  eventTimesChanged = new EventEmitter<any>();

  @Output()
  newEventCreated: EventEmitter<any> = new EventEmitter<any>();

  /**
  * @hidden
  */
  view: any;

  /**
   * @hidden
   */
  columnHeaders: any;

  /**
   * @hidden
   */
  openRowIndex: any;

  /**
  * @hidden
  */
  openDay: any;

  createdEvent;

  isCreatedEvent: boolean;

  dragCursor: string = 'pointer';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  refreshAll() {
    this.columnHeaders = null;
    this.view = null;
    this.refreshHeader();
    this.refreshBody();
  }

  /**
 * @hidden
 */
  ngOnChanges(changes: any): void {
    if (changes.viewDate || changes.excludeDays || changes.weekendDays) {
      this.refreshHeader();
    }

    if (changes.events) {
      validateEvents(this.events);
    }

    if (changes.calendars) {
      for (const calendar of this.calendars) {
        validateEvents(calendar.events);
        this.refreshBody();
      }
    }

    if (changes.viewDate || changes.events || changes.calendars || changes.excludeDays || changes.weekendDays) {
      this.refreshBody();
    }

    if (changes.activeDayIsOpen || changes.viewDate || changes.events || changes.excludeDays) {
      this.checkActiveDayIsOpen();
    }
  }

  private checkActiveDayIsOpen(): void {
    if (this.activeDayIsOpen === true) {
      this.openDay = this.view.days.find((day: any) =>
        dateFns.isSameDay(day.date, this.viewDate)
      );
      const index: number = this.view.days.indexOf(this.openDay);
      this.openRowIndex =
        Math.floor(index / this.view.totalDaysVisibleInWeek) *
        this.view.totalDaysVisibleInWeek;
    } else {
      this.openRowIndex = null;
      this.openDay = null;
    }
  }

  private emitBeforeViewRender(): void {
    if (this.columnHeaders && this.view) {
      this.beforeViewRender.emit({ header: this.columnHeaders, body: this.view.days });
    }
  }

  private refreshHeader(): void {
    this.columnHeaders = this.getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays
    });
    this.emitBeforeViewRender();
  }

  private getWeekViewHeader({ viewDate, weekStartsOn, excluded = [], weekendDays = [] }: GetWeekViewHeaderArgs) {
    const start: Date = dateFns.startOfWeek(viewDate, { weekStartsOn });
    const days = [];
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
      const date: Date = dateFns.addDays(start, i);
      if (!excluded.some(e => date.getDay() === e)) {
        days.push(this.getWeekDay({ date, weekendDays }));
      }
    }

    return days;
  }

  private refreshBody(): void {
    this.view = this.getMonthViewGrid({
      events: this.events,
      calendars: this.calendars,
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays
    });
    this.emitBeforeViewRender();
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
      rowOffsets: weeks
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
    }).sort((a, b) => {
      return a.start - b.start;
    }).map(event => {
      let top = 25;
      let hidden = false;
      width = this.getWidth(event, endWeek, start);
      left = this.getLeft(event, start);
      top = this.getTop(event, eventsInWeek, top);
      if (top > 50) {
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

  monthEventClicked(event: CalendarEvent) {
    this.eventClicked.emit(event);
  }

  monthCellClicked(day) {
    this.cellClicked.emit(day);
  }

  changeIsCreatedEvent($event) {
    this.isCreatedEvent = $event;
    if (this.createdEvent) {
      this.newEventCreated.emit({ event: this.createdEvent, terminated: this.isCreatedEvent });
    }
    if (this.isCreatedEvent) {
      this.createdEvent = null;
    }
  }

  cellEventTimeChanged(event) {
    this.createdEvent = { ...event };
  }

  dragEnd($event, event) {
    if ($event.x === 0 && $event.y === 0) {
      //this.monthEventClicked(event);
    } else {
      let left = $event.x / this.container.nativeElement.offsetWidth;
      let top = Math.round($event.y / this.cell.nativeElement.offsetHeight);
      const hours = Math.round(left * 168);
      const newStart = dateFns.addWeeks(dateFns.addHours(event.start, hours), top);
      const newEnd = dateFns.addWeeks(dateFns.addHours(event.end, hours), top);
      this.eventTimesChanged.emit({ event, newStart, newEnd });
    }
  }

  onResizeStop($event, event) {
    if ($event.position.left === 0) {
      let width = $event.size.width / this.container.nativeElement.offsetWidth;
      const hours = Math.round(width * 168);
      const previous = (event.width / 100) * 168;
      const newEnd = dateFns.addHours(event.event.end, hours - previous);
      this.eventTimesChanged.emit({ event: event.event, newStart: event.event.start, newEnd: newEnd });

    } else {
      let left = ($event.position.left / this.container.nativeElement.offsetWidth);
      const hours = Math.round(left * 168);
      const previous = (event.left / 100) * 168;
      const newStart = dateFns.addHours(event.event.start, hours - previous);
      this.eventTimesChanged.emit({ event: event.event, newStart, newEnd: event.event.end });
    }
  }
}
