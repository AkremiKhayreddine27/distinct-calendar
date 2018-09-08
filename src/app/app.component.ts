import { Component, HostListener, OnInit } from '@angular/core';
import * as dateFns from 'date-fns';
import { Subject } from 'rxjs';

import { MatDialog, MatDialogConfig } from '@angular/material';

import { EventFormComponent } from './event-form/event-form.component';
import { CalendarFormComponent } from './calendar-form/calendar-form.component';
import { CalendarImportFormComponent } from './calendar-import-form/calendar-import-form.component';

import { CalendarService } from '../../projects/locatus-calendar/src/public_api';
import { CalendarImportUrlComponent } from './calendar-import-url/calendar-import-url.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isCalendarsCollapsed = false;

  currentDate = new Date();

  isCollapsed = true;

  view: string = 'Month';

  views: string[] = [
    'Day',
    'Week',
    'Month',
    'Year'
  ]

  refresh: Subject<any> = new Subject();

  local = {
    id: 1,
    name: 'Local Calendar',
    url: '',
    color: '#f4511e',
    isLocal: true,
    display: true,
    loaded: true,
    loading: false,
  };

  google = {
    id: 2,
    name: 'Google Calendar',
    url: '',
    color: '#000000',
    isLocal: false,
    display: true,
    loaded: true,
    loading: false,
  };

  events = [
    {
      id: 1,
      title: 'event 5',
      start: dateFns.subDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 0), 25),
      end: dateFns.subDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 0), 17),
      allDay: true,
      isReservation: false,
      calendar: this.local,
      draggable: true,
      location: {
        latitude: 36.36960414512363,
        longitude: 10.52438735961914,
        address: 'RN1, Yasmine Hammamet, Tunisia'
      }
    },
    {
      id: 2,
      title: 'Lorem ipsum dolor sit gg amet',
      start: dateFns.subDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 0), 8),
      end: dateFns.subDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 23), 6),
      allDay: true,
      isReservation: false,
      calendar: this.local,
      draggable: true,
      location: {
        latitude: 36.361586786517776,
        longitude: 10.527820587158203,
        address: 'Unnamed Road, Yasmine Hammamet, Tunisia'
      }
    },
    {
      id: 3,
      title: 'Lorem ipsum dolor sit amet',
      start: dateFns.setHours(dateFns.setMinutes(new Date(), 0), 22),
      end: dateFns.setHours(dateFns.setMinutes(new Date(), 0), 23),
      allDay: false,
      isReservation: false,
      calendar: this.google,
      draggable: true,
      location: {
        latitude: 36.361586786517776,
        longitude: 10.527820587158203,
        address: 'Unnamed Road, Yasmine Hammamet, Tunisia'
      }
    },
    {
      id: 4,
      title: 'event 5',
      start: dateFns.addDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 20), 2),
      end: dateFns.addDays(dateFns.setHours(dateFns.setMinutes(new Date(), 0), 20), 4),
      allDay: true,
      draggable: true,
      isReservation: false,
      calendar: this.google,
      location: {
        latitude: 36.36960414512363,
        longitude: 10.52438735961914,
        address: 'RN1, Yasmine Hammamet, Tunisia'
      }
    }
  ];

  holidaysInFrance = {
    id: 3,
    name: 'Holidays in France',
    color: '#0b8043',
    isLocal: false,
    url: 'https://calendar.google.com/calendar/ical/fr.french%23holiday%40group.v.calendar.google.com/public/basic.ics',
    display: true,
    loaded: false,
    loading: false,
  };

  holidaysInTunisia = {
    id: 4,
    name: 'Holidays in Tunisia',
    color: '#039be5',
    isLocal: false,
    url: 'https://calendar.google.com/calendar/ical/en.tn%23holiday%40group.v.calendar.google.com/public/basic.ics',
    display: true,
    loaded: false,
    loading: false,
  };

  calendars = [
    this.local,
    this.google,
    this.holidaysInFrance,
    this.holidaysInTunisia
  ];

  title = 'app';

  isMobileView = false;

  constructor(public dialog: MatDialog, private calendarService: CalendarService) {

  }

  ngOnInit() {
    if (window.innerWidth < 576) {
      this.isMobileView = true;
    }
    this.holidaysInFrance.loading = true;
    this.holidaysInTunisia.loading = true;
    this.calendarService.synchronize(this.holidaysInFrance.url, this.holidaysInFrance).subscribe(events => {
      this.events = this.events.concat(events);
      this.holidaysInFrance.loaded = true;
      this.holidaysInFrance.loading = false;
    }, error => {
      this.holidaysInFrance.loading = true;
    });
    this.calendarService.synchronize(this.holidaysInTunisia.url, this.holidaysInTunisia).subscribe(events => {
      this.events = this.events.concat(events);
      this.holidaysInTunisia.loading = false;
      this.holidaysInTunisia.loaded = true;
    }, error => {
      this.holidaysInFrance.loading = true;
    });
  }

  refreshCalendar(calendar) {
    calendar.loaded = false;
    calendar.loading = true;
    this.calendarService.synchronize(calendar.url, calendar).subscribe(events => {
      this.events = this.events.filter(event => {
        return event.calendar.id !== calendar.id;
      });
      this.events = this.events.concat(events);
      calendar.loaded = true;
      calendar.loading = false;
    }, error => {
      calendar.loading = false;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.currentTarget.innerWidth < 576) {
      this.isMobileView = true;
    }
  }

  setDate(date) {
    this.currentDate = date;
  }

  isToday(date) {
    const day = new Date(date.year, date.month - 1, date.day);
    const currentDay = new Date();
    if (day.getDate() === currentDay.getDate() && day.getFullYear() === currentDay.getFullYear() && day.getMonth() == currentDay.getMonth()) {
      return true;
    } else {
      return false;
    }
  }

  setViewDate(event: string) {
    switch (event) {
      case 'previous':
        const subFn: any = {
          Day: dateFns.subDays,
          Week: dateFns.subWeeks,
          Month: dateFns.subMonths,
          Schedule: dateFns.subDays,
          Year: dateFns.subYears
        }[this.view];
        this.currentDate = subFn(this.currentDate, 1);
        break;
      case 'today':
        this.currentDate = new Date();
        break;
      case 'next':
        const addFn: any = {
          Day: dateFns.addDays,
          Week: dateFns.addWeeks,
          Month: dateFns.addMonths,
          Schedule: dateFns.addDays,
          Year: dateFns.addYears
        }[this.view];
        this.currentDate = addFn(this.currentDate, 1);
        break;
    }
  }

  navigate(view: string, date: Date) {
    this.currentDate = date;
    this.view = view;
  }

  setView(view: string) {
    this.view = view;
  }

  eventClicked(event) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { event: event, calendars: this.calendars };
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result && !result.delete) {
        if (dateFns.differenceInDays(result.end, result.start) > 1) {
          result.allDay = true;
        }
        Object.keys(result).map(key => {
          event[key] = result[key];
        });
        this.refresh.next();
      }
      if (result && result.delete) {
        this.events = this.events.filter(e => {
          return e.id !== event.id;
        })
      }
    });
  }

  weekDayHourClicked($event) {
    const hours: number = dateFns.getHours($event.hour.hour);
    const start: Date = dateFns.setHours($event.day.date, hours);
    const event = {
      id: Math.random(),
      title: 'No title',
      start: start,
      end: dateFns.addHours(start, 1),
      allDay: false,
      isReservation: false,
      draggable: true,
      color: 'red',
      calendar: this.local,
      location: null
    };
    this.events.push(event);
    this.refresh.next();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { event: event, calendars: this.calendars };
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result && !result.delete) {
        if (dateFns.differenceInDays(result.end, result.start) > 1) {
          result.allDay = true;
        }
        Object.keys(result).map(key => {
          event[key] = result[key];
        });
        this.refresh.next();
      }
      if (result && result.delete) {
        this.events = this.events.filter(e => {
          return e.id !== event.id;
        })
      }
      if (!result) {
        this.events = this.events.filter(e => {
          return e.id !== event.id;
        })
      }
    });
  }

  cellClicked(day) {
    this.currentDate = day.date;
    this.setView('Day');
  }

  eventTimesChanged({ event, newStart, newEnd }): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
  }

  addCalendar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(CalendarFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.calendars.push(result);
      }
    });
  }

  importCalendar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(CalendarImportFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.calendars.push(result.calendar);
        this.events = this.events.concat(result.events);
      }
    });
  }

  importCalendarUrl() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(CalendarImportUrlComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.calendar.loading = false;
        result.calendar.loaded = true;
        this.calendars.push(result.calendar);
        this.events = this.events.concat(result.events);
      }
    });
  }

  newEventCreated(data: { event: any, terminated: boolean }) {
    data.event.calendar = this.local;
    this.events = this.events.filter(e => {
      return e.id !== data.event.id;
    });

    this.events.push(data.event);
    this.refresh.next();
    if (data.terminated) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = { event: data.event, calendars: this.calendars };
      dialogConfig.panelClass = 'custom-mat-dialog';
      const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          this.events = this.events.filter(e => {
            return e.id !== data.event.id;
          });
          this.refresh.next();
        }
        if (result && !result.delete) {
          if (dateFns.differenceInDays(result.end, result.start) > 1) {
            result.allDay = true;
          }
          Object.keys(result).map(key => {
            data.event[key] = result[key];
          });
          this.refresh.next();
        }
        if (result && result.delete) {
          this.events = this.events.filter(e => {
            return e.id !== data.event.id;
          });
          this.refresh.next();
        }
      });
    }
  }

  addEvent() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { calendars: this.calendars };
    dialogConfig.panelClass = 'custom-mat-dialog';
    const dialogRef = this.dialog.open(EventFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (dateFns.differenceInDays(result.end, result.start) > 1) {
          result.allDay = true;
        }
        this.events.push(result);
        this.refresh.next();
      }
    });
  }

  setCalendarDisplay(event) {
    this.refresh.next();
  }
}
