import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as dateFns from 'date-fns';

import { HOURS_IN_DAY, DEFAULT_WEEKEND_DAYS, DAYS_IN_WEEK, MINUTES_IN_HOUR, SECONDS_IN_DAY, SECONDS_IN_WEEK, mergeEvents, getEventsInPeriod } from '../../shared';
import { Subject, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'locatus-calendar-week-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class WeekViewComponent implements OnInit, OnChanges {

  @ViewChild('container')
  container: ElementRef;

  @ViewChild('weekheader')
  weekheader: any;

  @ViewChild('cell')
  cell: ElementRef;

  /**
   * The current view date
   */
  @Input() viewDate: Date;

  /**
 * An array of events to display on view
 */
  @Input() events: any[] = [];

  /**
  * An array of calendars to display on view.
  */
  @Input() calendars: any[] = [];

  /**
   * @hidden
   */
  view: any;

  /**
  * The number of segments in an hour. Must be <= 6
  */
  @Input() hourSegments = 2;

  /**
  * The height in pixels of each hour segment
  */
  @Input() hourSegmentHeight = 30;

  /**
  * The day start hours in 24 hour time.Must be 0 - 23
  */
  @Input() dayStartHour = 0;

  /**
  * The day start minutes. Must be 0-59
  */
  @Input() dayStartMinute = 0;

  /**
  * The day end hours in 24 hour time. Must be 0-23
  */
  @Input() dayEndHour = 23;

  /**
  * The day end minutes. Must be 0-59
  */
  @Input() dayEndMinute = 59;

  /**
   * The start number of the week
   */
  @Input() weekStartsOn: number;

  /**
   * An array of day indexes (0 = sunday, 1 = monday etc) that will be hidden on the view
   */
  @Input() excludeDays: number[] = [];

  /**
  * An array of day indexes (0 = sunday, 1 = monday etc) that indicate which days are weekends
  */
  @Input() weekendDays: number[];

  /**
  * An observable that when emitted on will re-render the current view
  */
  @Input() refresh: Subject<any>;

  /**
 * @hidden
 */
  refreshSubscription: Subscription;

  /**
   * An output that will be called before the view is rendered for the current week.
   * If you add the `cssClass` property to a day in the header it will add that class to the cell element in the template
   */
  @Output()
  beforeViewRender: EventEmitter<{ header: any[], body: any[] }> = new EventEmitter();

  /**
  * Called when an event title is clicked
  */
  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter<any>();


  @Output()
  weekDayHourClicked: EventEmitter<any> = new EventEmitter<any>();

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
  days: any[];

  /**
  * @hidden
  */
  hours: any[] = [];

  currentTime = this.getCurrentTime();

  createdEvent;

  isCreatedEvent: boolean;

  height;

  constructor(public cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.height = window.innerHeight;
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  ngOnChanges(changes: any): void {
    if (changes.viewDate || changes.excludeDays || changes.weekendDays) {
      this.refreshHeader();
    }
    if (changes.events || changes.calendars || changes.viewDate || changes.excludeDays) {
      this.refreshBody();
    }
  }

  refreshAll() {
    this.refreshHeader();
    this.refreshBody();
  }

  public getCurrentTime() {
    const time = new Date();
    const top = dateFns.differenceInMinutes(time, dateFns.startOfDay(time));
    return top;
  }

  setContainerHeight(height) {
    this.height = height;
  }

  private refreshBody(): void {
    this.view = this.getWeekView({
      events: this.events,
      calendars: this.calendars,
      viewDate: this.viewDate,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      },
      segmentHeight: this.hourSegmentHeight,
      weekStartsOn: this.weekStartsOn,
    });
  }

  private refreshHeader(): void {
    this.days = this.getWeekViewHeader({
      viewDate: this.viewDate,
      weekStartsOn: this.weekStartsOn,
      excluded: this.excludeDays,
      weekendDays: this.weekendDays
    });
    this.hours = this.getDayViewHourGrid({
      viewDate: this.viewDate,
      hourSegments: this.hourSegments,
      dayStart: {
        hour: this.dayStartHour,
        minute: this.dayStartMinute
      },
      dayEnd: {
        hour: this.dayEndHour,
        minute: this.dayEndMinute
      }
    });
    this.beforeViewRender.emit({
      header: this.days,
      body: this.hours
    });
  }

  getDayViewHourGrid({
    viewDate,
    hourSegments,
    dayStart,
    dayEnd
  }): any[] {
    const hours: any[] = [];

    const startOfView: Date = dateFns.setMinutes(
      dateFns.setHours(dateFns.startOfDay(viewDate), dayStart.hour),
      dayStart.minute
    );
    const endOfView: Date = dateFns.setMinutes(
      dateFns.setHours(dateFns.startOfMinute(dateFns.endOfDay(viewDate)), dayEnd.hour),
      dayEnd.minute
    );
    const segmentDuration: number = MINUTES_IN_HOUR / hourSegments;
    const startOfViewDay: Date = dateFns.startOfDay(viewDate);

    for (let i = 0; i < HOURS_IN_DAY; i++) {
      const segments: any[] = [];
      for (let j = 0; j < hourSegments; j++) {
        const date: Date = dateFns.addMinutes(
          dateFns.addHours(startOfViewDay, i),
          j * segmentDuration
        );
        if (date >= startOfView && date < endOfView) {
          segments.push({
            date,
            isStart: j === 0
          });
        }
      }
      if (segments.length > 0) {
        hours.push({ segments });
      }
    }

    return hours;
  }

  getWeekViewHeader(
    { viewDate, weekStartsOn, excluded = [], weekendDays = [] }: {
      viewDate: Date,
      weekStartsOn: number,
      excluded: number[],
      weekendDays: number[]
    }) {
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

  getWeekView({
    events = [],
    calendars = [],
    viewDate,
    hourSegments,
    dayStart,
    dayEnd,
    segmentHeight,
    weekStartsOn,
  }: {
      events: any[];
      calendars?: any[];
      viewDate: any;
      hourSegments: any;
      dayStart: any;
      dayEnd: any;
      segmentHeight: any;
      weekStartsOn: number
    }) {
    const startOfViewWeek: Date = dateFns.startOfWeek(viewDate, { weekStartsOn });
    const endOfViewWeek: Date = dateFns.endOfWeek(viewDate, { weekStartsOn });
    const weekCols = dateFns.differenceInDays(endOfViewWeek, startOfViewWeek) + 1;
    let days = [];
    let allDayEventsMapped = [];
    days = this.getMonthDays(events, calendars, startOfViewWeek, weekCols);
    allDayEventsMapped = this.getAllDayEvents(events, calendars, startOfViewWeek, endOfViewWeek);
    return {
      days: days,
      allDays: allDayEventsMapped
    };
  }

  getAllDayEvents(events: any[], calendars: any[], startOfViewWeek: Date, endOfViewWeek: Date) {
    const allDayWeekEventsMapped = [];
    mergeEvents(events, calendars).then((evs: any[]) => {
      const allDayWeekEvents = getEventsInPeriod({
        events: evs.filter((event) => event.allDay),
        periodStart: startOfViewWeek,
        periodEnd: endOfViewWeek
      });
      allDayWeekEvents.map(event => {
        const eventStart: Date = event.start;
        const eventEnd: Date = event.end || eventStart;
        const startsBeforeWeek: boolean = eventStart < startOfViewWeek;
        const endsAfterWeek: boolean = eventEnd > endOfViewWeek;

        const offset: number = this.getWeekViewEventOffset({
          event,
          startOfWeek: startOfViewWeek,
          excluded: [],
          precision: 'days'
        });
        const span: number = this.getWeekViewEventSpan({
          event,
          offset,
          startOfWeekDate: startOfViewWeek,
          excluded: [],
          precision: 'days'
        });
        allDayWeekEventsMapped.push({
          event: event,
          span: span,
          offset: offset,
          startsBeforeWeek: startsBeforeWeek,
          endsAfterWeek: endsAfterWeek
        });
      });
    });
    return allDayWeekEventsMapped;
  }

  getWeekViewEventSpan({
    event,
    offset,
    startOfWeekDate,
    excluded,
    precision = 'days'
  }: {
      event: any;
      offset: number;
      startOfWeekDate: Date;
      excluded: number[];
      precision?: 'minutes' | 'days';
    }): number {
    let span: number = SECONDS_IN_DAY;
    const begin: Date = dateFns.max(event.start, startOfWeekDate);

    if (event.end) {
      switch (precision) {
        case 'minutes':
          span = dateFns.differenceInSeconds(event.end, begin);
          break;
        default:
          span = dateFns.differenceInHours(event.end, begin) * 60 * 60;
          break;
      }
    }

    const offsetSeconds: number = offset * SECONDS_IN_DAY;
    const totalLength: number = offsetSeconds + span;

    // the best way to detect if an event is outside the week-view
    // is to check if the total span beginning (from startOfWeekDay or event start) exceeds 7days
    if (totalLength > SECONDS_IN_WEEK) {
      span = SECONDS_IN_WEEK - offsetSeconds;
    }

    span -= this.getExcludedSeconds({
      startDate: begin,
      seconds: span,
      excluded,
      precision
    });

    return span / SECONDS_IN_DAY;
  }

  getMonthDays(events: any[], calendars: any[], startOfViewWeek: Date, weekCols: number) {
    const days = [];
    const dayEvents: any[] = [];
    let previousDate: Date = startOfViewWeek;
    for (let day = 0; day < weekCols; day++) {
      mergeEvents(events, calendars).then((evs: any[]) => {
        const startDay = dateFns.startOfDay(previousDate);
        const endDay = dateFns.endOfDay(previousDate);
        const dayCols = dateFns.differenceInHours(endDay, startDay) + 1;
        let previousHour = startDay;
        const hours = [];
        for (let hour = 0; hour < dayCols; hour++) {
          const eventsInHour = getEventsInPeriod({
            events: evs,
            periodStart: dateFns.startOfHour(previousHour),
            periodEnd: dateFns.endOfHour(previousHour)
          });
          hours.push({
            hour: previousHour,
            events: eventsInHour
          });
          previousHour = dateFns.startOfHour(dateFns.addMinutes(previousHour, MINUTES_IN_HOUR + 1));
        }
        const eventsInDay = getEventsInPeriod({
          events: evs.filter((event) => !event.allDay),
          periodStart: startDay,
          periodEnd: endDay
        }).map(event => {
          let top;
          let height;
          if (dateFns.isBefore(event.start, startDay)) {
            top = 0;
            height = dateFns.differenceInMinutes(event.end, startDay);
          } else {
            top = dateFns.differenceInMinutes(event.start, startDay);
            height = dateFns.differenceInMinutes(event.end, event.start);
          }
          if (dateFns.isAfter(event.end, endDay)) {
            height = dateFns.differenceInMinutes(endDay, event.start);
          }
          dayEvents.push({
            event,
            top,
            height
          });
          return {
            event,
            top,
            height
          };
        });
        days.push({
          date: previousDate,
          isToday: dateFns.isSameDay(previousDate, new Date()),
          hours: hours,
          events: eventsInDay
        });
        previousDate = dateFns.startOfDay(dateFns.addHours(previousDate, HOURS_IN_DAY + 1));
      });
    }
    return days;
  }

  getWeekViewEventOffset({
    event,
    startOfWeek: startOfWeekDate,
    excluded = [],
    precision = 'days'
  }: {
      event: any;
      startOfWeek: Date;
      excluded?: number[];
      precision?: 'minutes' | 'days';
    }): number {
    if (event.start < startOfWeekDate) {
      return 0;
    }

    let offset = 0;

    switch (precision) {
      case 'days':
        offset =
          dateFns.differenceInDays(dateFns.startOfDay(event.start), startOfWeekDate) *
          SECONDS_IN_DAY;
        break;
      case 'minutes':
        offset = dateFns.differenceInSeconds(event.start, startOfWeekDate);
        break;
    }

    offset -= this.getExcludedSeconds({
      startDate: startOfWeekDate,
      seconds: offset,
      excluded,
      precision
    });

    return offset / SECONDS_IN_DAY;
  }

  getExcludedSeconds({
    startDate,
    seconds,
    excluded,
    precision = 'days'
  }: {
      startDate: Date;
      seconds: number;
      excluded: number[];
      precision?: 'minutes' | 'days';
    }): number {
    if (excluded.length < 1) {
      return 0;
    }
    const endDate: Date = dateFns.addSeconds(startDate, seconds - 1);
    const dayStart: number = dateFns.getDay(startDate);
    const dayEnd: number = dateFns.getDay(dateFns.addSeconds(endDate, 0));
    let result = 0; // Calculated in seconds
    let current: Date = startDate;

    while (current < endDate) {
      const day: number = dateFns.getDay(current);

      if (excluded.some(excludedDay => excludedDay === day)) {
        result += this.calculateExcludedSeconds({
          dayStart,
          dayEnd,
          day,
          precision,
          startDate,
          endDate
        });
      }

      current = dateFns.addDays(current, 1);
    }

    return result;
  }

  calculateExcludedSeconds({
    precision,
    day,
    dayStart,
    dayEnd,
    startDate,
    endDate
  }: {
      day: number;
      startDate: Date;
      endDate: Date;
      dayStart: number;
      dayEnd: number;
      precision?: 'minutes' | 'days';
    }): number {
    if (precision === 'minutes') {
      if (day === dayStart) {
        return dateFns.differenceInSeconds(dateFns.endOfDay(startDate), startDate) + 1;
      } else if (day === dayEnd) {
        return dateFns.differenceInSeconds(endDate, dateFns.startOfDay(endDate)) + 1;
      }
    }
    return SECONDS_IN_DAY;
  }

  onDrop($event, day, hour) {
    const year: number = dateFns.getYear(day.date);
    const month: number = dateFns.getMonth(day.date);
    const date: number = dateFns.getDate(day.date);
    const hours: number = dateFns.getHours(hour.hour);
    const newStart: Date = dateFns.setHours(dateFns.setDate(
      dateFns.setMonth(dateFns.setYear($event.dropData.event.start, year), month),
      date
    ), hours);
    let newEnd: Date;
    if ($event.dropData.event.end) {
      const secondsDiff: number = dateFns.differenceInSeconds(newStart, $event.dropData.event.start);
      newEnd = dateFns.addSeconds($event.dropData.event.end, secondsDiff);
    }
    const event = $event.dropData.event;
    this.eventTimesChanged.emit({ event, newStart, newEnd, day });
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
      //this.eventClicked.emit(event);
    } else {
      let left = $event.x / this.container.nativeElement.offsetWidth;
      let top = Math.round($event.y / this.cell.nativeElement.offsetHeight);
      const hours = Math.round(left * 168);
      const newStart = dateFns.addHours(dateFns.addHours(event.start, top), hours);
      const newEnd = dateFns.addHours(dateFns.addHours(event.end, top), hours);
      this.eventTimesChanged.emit({ event, newStart, newEnd });
    }
  }

  onResizeStop($event, event) {
    if ($event.position.top === event.top) {
      let height = $event.size.height;
      const newEnd = dateFns.addHours(event.event.end, (height - event.height) / 60);
      this.eventTimesChanged.emit({ event: event.event, newStart: event.event.start, newEnd: newEnd });

    } else {
      let top = $event.position.top;
      const previous = event.top;
      const newStart = dateFns.addHours(event.event.start, (top - previous) / 60);
      this.eventTimesChanged.emit({ event: event.event, newStart, newEnd: event.event.end });
    }
  }

}
