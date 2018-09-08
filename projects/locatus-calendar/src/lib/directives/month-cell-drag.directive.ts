import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import * as dateFns from 'date-fns';
import { CalendarEvent } from '../shared';

@Directive({
  selector: '[locatusMonthCellDrag]'
})
export class MonthCellDragDirective {

  @Input() day: any;

  @Input() hour;

  @Input() event: CalendarEvent;

  @Input()
  created: boolean;

  @Output()
  eventCreated: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  eventTimeChanged: EventEmitter<{ event: CalendarEvent }> = new EventEmitter<{ event: CalendarEvent; }>();

  constructor() { }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event) {
    event.preventDefault();
    if (!this.event) {
      this.event = {
        id: Math.random(),
        title: 'No title',
        start: this.hour ? dateFns.startOfHour(this.hour.hour) : dateFns.startOfDay(this.day.date),
        end: this.hour ? dateFns.endOfHour(this.hour.hour) : dateFns.endOfDay(this.day.date),
        color: 'red',
        allDay: this.hour ? false : true,
      };
      this.eventTimeChanged.emit({ event: this.event });
      this.created = false;
      this.eventCreated.emit(this.created);
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: Event) {
    if (this.event && !this.created) {
      if (this.hour) {
        if (dateFns.isAfter(this.day.date, this.event.start)) {
          this.event.start = this.hour ? dateFns.startOfHour(this.hour.hour) : dateFns.startOfDay(this.day.date);
        } else {
          this.event.end = this.hour ? dateFns.endOfHour(this.hour.hour) : dateFns.endOfDay(this.day.date);
        }
      } else {
        if (dateFns.isBefore(this.day.date, this.event.start)) {
          this.event.start = this.hour ? dateFns.startOfHour(this.hour.hour) : dateFns.startOfDay(this.day.date);
        } else {
          this.event.end = this.hour ? dateFns.endOfHour(this.hour.hour) : dateFns.endOfDay(this.day.date);
        }
      }
      if (dateFns.differenceInDays(this.event.end, this.event.start) > 1) {
        this.event.allDay = true;
      }
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: Event) {
    if (this.event && !this.created) {
      this.eventCreated.emit(this.created);
    }
  }

}
