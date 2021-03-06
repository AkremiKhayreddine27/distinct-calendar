import {
  Directive,
  HostListener,
  Input,
  OnInit,
  OnChanges,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Component as IcsComponent, Property } from 'immutable-ics';
import { saveAs } from 'file-saver/FileSaver';
import * as JSzip from 'jszip';

@Directive({
  selector: '[locatusCalendarExport]'
})
export class CalendarExportDirective implements OnInit, OnChanges {

  @Input()
  calendars: any[];

  @Input()
  events: any[];

  @Input() refresh: Subject<any>;

  icsCalendars: any[] = [];

  zip: JSzip;

  refreshSubscription: Subscription;

  constructor() { }

  ngOnInit() {
    if (this.refresh) {
      this.refreshSubscription = this.refresh.subscribe(() => {
        this.refreshCalendars();
      });
    }
  }

  ngOnChanges(changes: any): void {
    if (changes.events) {
      this.refreshCalendars();
    }
  }

  export() {
    this.zip.generateAsync({ type: 'blob' }).then(b => {
      saveAs(b, 'calendars.zip');
    }, function (err) {
      console.log(err);
    });
  }

  refreshCalendars() {
    this.zip = new JSzip();
    this.icsCalendars = this.calendars.map(calendar => {
      calendar.events = this.events.filter(event => {
        return event.calendar.id === calendar.id;
      });
      const ics = new IcsComponent({
        name: 'VCALENDAR',
        properties: [
          new Property({ name: 'VERSION', value: 2 }),
          new Property({ name: 'PRODID', value: 'EasyLocatus' })
        ],
        components: this.refreshEvents(calendar)
      });
      this.zip.file(calendar.name + '.ics', ics.toString());
    });
  }

  refreshEvents(calendar) {
    return calendar.events.map(event => {
      return new IcsComponent({
        name: 'VEVENT',
        properties: [
          new Property({
            name: 'DTSTART',
            value: event.start
          }),
          new Property({
            name: 'DTEND',
            value: event.end
          }),
          new Property({
            name: 'SUMMARY',
            value: event.title
          }),
        ]
      });
    });
  }


  /**
  * @hidden
  */
  @HostListener('click')
  onClick(): void {
    this.export();
  }
}
