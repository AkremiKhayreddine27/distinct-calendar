import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MINUTES_IN_HOUR, HOURS_IN_DAY, CalendarEvent, getEventsInPeriod, validateEvents, mergeEvents } from '../../shared';
import * as dateFns from 'date-fns';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'locatus-calendar-day-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class DayViewComponent implements OnInit {

  @ViewChild('container')
  container: ElementRef;

  @ViewChild('eventsContainer')
  eventsContainer: ElementRef;

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
   * An array of events to display on view
  */
  @Input() calendars: any[] = [];

  /**
   * The number of segments in an hour. Must be <= 6
  */
  @Input() hourSegments = 2;

  /**
   * The height in pixels of each hour segment
  */
  @Input() hourSegmentHeight = 30;

  /**
   * The day start hours in 24 hour time. Must be 0-23
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
   * The width in pixels of each event on the view
  */
  @Input() eventWidth = 150;

  /**
  * An observable that when emitted on will re-render the current view
  */
  @Input() refresh: Subject<any>;

  /**
  * @hidden
  */
  refreshSubscription: Subscription;

 
  /**
  * Called when an event title is clicked
 */
  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Called when an hour segment is clicked
  */
  @Output()
  hourSegmentClicked: EventEmitter<any> = new EventEmitter<any>();

  /**
  * Called when an event is dragged and dropped
  */
  @Output()
  eventTimesChanged = new EventEmitter<any>();

  /**
   * An output that will be called before the view is rendered for the current day.
   * If you add the `cssClass` property to a segment it will add that class to the hour segment in the template
  */
  @Output()
  beforeViewRender: EventEmitter<any> = new EventEmitter<any>();

  /**
 * @hidden
*/
  hours: any[] = [];

  /**
   * @hidden
  */
  view: any;

  /**
   * @hidden
  */
  width = 0;

  height;

  constructor(public cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshAll();
        this.cdr.markForCheck();
      });
    }
  }

  setContainerHeight(height) {
    this.height = height;
  }

  ngOnChanges(changes: any): void {
    if (
      changes.viewDate ||
      changes.dayStartHour ||
      changes.dayStartMinute ||
      changes.dayEndHour ||
      changes.dayEndMinute
    ) {
      this.refreshHourGrid();
    }

    if (changes.events) {
      validateEvents(this.events);
    }

    if (changes.calendars) {
      for (const calendar of this.calendars) {
        validateEvents(calendar.events);
        this.refreshView();
      }
    }

    if (
      changes.viewDate ||
      changes.events ||
      changes.calendars ||
      changes.dayStartHour ||
      changes.dayStartMinute ||
      changes.dayEndHour ||
      changes.dayEndMinute ||
      changes.eventWidth
    ) {
      this.refreshView();
    }
  }

  refreshAll() {
    this.refreshHourGrid();
    this.refreshView();
  }

  private refreshHourGrid(): void {
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
      body: this.hours
    });
  }

  private refreshView(): void {
    this.view = this.getDayView({
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
      eventWidth: this.eventWidth,
      segmentHeight: this.hourSegmentHeight
    });
  }

  getDayViewHourGrid({
    viewDate,
    hourSegments,
    dayStart,
    dayEnd
  }: any): any[] {
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

  getDayView({
    events = [],
    calendars = [],
    viewDate,
    hourSegments,
    dayStart,
    dayEnd,
    eventWidth,
    segmentHeight
  }: any): any {
    if (!events) {
      events = [];
    }

    const startOfView: Date = dateFns.setMinutes(
      dateFns.setHours(dateFns.startOfDay(viewDate), dayStart.hour),
      dayStart.minute
    );
    const endOfView: Date = dateFns.setMinutes(
      dateFns.setHours(dateFns.startOfMinute(dateFns.endOfDay(viewDate)), dayEnd.hour),
      dayEnd.minute
    );
    const previousDayEvents: any[] = [];
    let dayViewEvents: any[] = [];
    let width: number;
    const allDayEvents: CalendarEvent[] = [];
    mergeEvents(events, calendars).then((evs: CalendarEvent[]) => {
      getEventsInPeriod({
        events: evs.filter((event: CalendarEvent) => event.allDay),
        periodStart: dateFns.startOfDay(startOfView),
        periodEnd: dateFns.endOfDay(endOfView)
      }).filter(event => {
        return !dateFns.isEqual(event.end, dateFns.startOfDay(this.viewDate));
      }).map((event: CalendarEvent) => {
        allDayEvents.push(event);
      });
      getEventsInPeriod({
        events: evs.filter((event: CalendarEvent) => !event.allDay),
        periodStart: startOfView,
        periodEnd: endOfView
      })
        .sort((eventA: CalendarEvent, eventB: CalendarEvent) => {
          return eventA.start.valueOf() - eventB.start.valueOf();
        })
        .map((event: CalendarEvent) => {
          const eventStart: Date = event.start;
          const eventEnd: Date = event.end || eventStart;
          const startsBeforeDay: boolean = eventStart < startOfView;
          const endsAfterDay: boolean = eventEnd > endOfView;
          const hourHeightModifier: number =
            hourSegments * segmentHeight / MINUTES_IN_HOUR;

          let top = 0;
          if (eventStart > startOfView) {
            top += dateFns.differenceInMinutes(eventStart, startOfView);
          }
          top *= hourHeightModifier;

          const startDate: Date = startsBeforeDay ? startOfView : eventStart;
          const endDate: Date = endsAfterDay ? endOfView : eventEnd;
          let height: number = dateFns.differenceInMinutes(endDate, startDate);
          if (!event.end) {
            height = segmentHeight;
          } else {
            height *= hourHeightModifier;
          }

          const bottom: number = top + height;

          const overlappingPreviousEvents: any[] = previousDayEvents.filter(
            (previousEvent: any) => {
              const previousEventTop: number = previousEvent.top;
              const previousEventBottom: number =
                previousEvent.top + previousEvent.height;

              if (top < previousEventBottom && previousEventBottom < bottom) {
                return true;
              } else if (previousEventTop <= top && bottom <= previousEventBottom) {
                return true;
              }
              return false;
            }
          );
          let left = 0;
          while (
            overlappingPreviousEvents.some(
              previousEvent => previousEvent.left === left
            )
          ) {
            left += eventWidth;
          }
          const dayEvent: any = {
            event,
            height,
            width: eventWidth,
            top,
            left,
            startsBeforeDay,
            endsAfterDay
          };
          if (height > 0) {
            previousDayEvents.push(dayEvent);
          }
          dayViewEvents.push(dayEvent);
        });
      dayViewEvents = dayViewEvents.filter((dayEvent: any) => dayEvent.height > 0);
      width = Math.max(
        ...dayViewEvents.map((event: any) => event.left + event.width)
      );
    });

    return {
      events: dayViewEvents,
      width,
      allDayEvents
    };
  }

  dragEnd($event, event) {
    if ($event.x === 0 && $event.y === 0) {
      //this.eventClicked.emit(event);
    } else {
      let left = $event.x / this.container.nativeElement.offsetWidth;
      let top = Math.round($event.y / this.container.nativeElement.offsetHeight);
      const hours = Math.round($event.y / 60);
      const newStart = dateFns.addHours(event.start, hours);
      const newEnd = dateFns.addHours(event.end, hours);
      this.eventTimesChanged.emit({ event, newStart, newEnd });
    }
  }

  onResizeStop($event, event) {
    if ($event.position.top === 0) {
      let height = $event.size.height;
      const newEnd = dateFns.addHours(event.event.end, (height - event.height) / 60);
      this.eventTimesChanged.emit({ event: event.event, newStart: event.event.start, newEnd: newEnd });

    } else {
      let top = $event.position.top;
      const newStart = dateFns.addHours(event.event.start, top / 60);
      this.eventTimesChanged.emit({ event: event.event, newStart, newEnd: event.event.end });
    }
  }

}
