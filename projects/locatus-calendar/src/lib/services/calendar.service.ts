import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { map } from 'rxjs/operators';

import * as dateFns from 'date-fns';

import * as tz from 'moment-timezone';

import * as ICAL from 'ical.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  proxy = 'https://cors-anywhere.herokuapp.com/';

  constructor(private http: Http) { }

  /**
  * sychronize calendar with url calendar
  * @param url 
  * @param calendar 
  */
  synchronize(url: string, calendar: any): Observable<any> {
    return this.http.get(this.proxy + url)
      .pipe(
        map(response => response.text()),
        map(response => {
          const jcalData = ICAL.parse(response);
          const comp = new ICAL.Component(jcalData);
          let isAirbnb = false;
          if (comp.getFirstProperty('prodid')) {
            if (comp.getFirstProperty('prodid').getFirstValue().indexOf('Airbnb') !== -1) {
              isAirbnb = true;
            }
          }
          const vevents = comp.getAllSubcomponents('vevent');
          const data = vevents.map(vevent => {
            const cevent = new ICAL.Event(vevent);
            let allDay = false;
            if (dateFns.differenceInDays(dateFns.parse(cevent.endDate), dateFns.parse(cevent.startDate)) >= 1) {
              allDay = true;
            }
            let location = null;
            if (cevent.location) {
              location = {
                address: cevent.location,
                country: '',
                latitude: 0,
                longitude: 0,
                postalCode: '',
                isValid: true
              }
            }
            if (isAirbnb && cevent.description) {
              return this.convertAirbnbEvent(cevent, calendar);
            } else {
              const event: any = {
                id: cevent.uid,
                title: cevent.summary,
                start: this.convertDateToUTC(new Date(cevent.startDate)).getHours() === 0 ? this.convertDateToUTC(new Date(cevent.startDate)) : new Date(cevent.startDate),
                end: this.convertDateToUTC(new Date(cevent.endDate)).getHours() === 0 ? this.convertDateToUTC(new Date(cevent.endDate)) : new Date(cevent.endDate),
                description: cevent.description,
                location: location,
                color: calendar.color,
                allDay: allDay,
                draggable: false,
                isReservation: false,
                calendar: calendar
              };
              return event;
            }
          });
          return data;
        })
      );
  }

  convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }

  convertAirbnbEvent(event, calendar) {
    const rservationProps = ['PROPERTY', 'NIGHTS'];
    const lodgerProps = ['PHONE', 'EMAIL'];
    let allDay = false;
    if (dateFns.differenceInDays(dateFns.parse(event.endDate), dateFns.parse(event.startDate)) >= 1) {
      allDay = true;
    }
    let location = null;
    if (event.location) {
      location = {
        address: event.location,
        country: '',
        latitude: 0,
        longitude: 0,
        postalCode: '',
        isValid: true
      }
    }
    let reservation: any = {
      id: event.uid,
      title: event.summary,
      start: dateFns.parse(event.startDate),
      end: dateFns.parse(event.endDate),
      isReservation: true,
      draggable: false,
      color: calendar.color,
      location: location,
      allDay: allDay,
      code: event.summary.split(" ")[2].replace('(', '').replace(')', ''),
      calendar: calendar
    };
    reservation.lodger = {
      firstname: event.summary.split(" ")[0],
      lastname: event.summary.split(" ")[1],
      phone: '',
      email: ''
    };
    lodgerProps.map(prop => {
      let propStart = event.description.indexOf(prop);
      if (propStart !== -1) {
        var propEnd = event.description.indexOf('\n', propStart);
        if (propEnd === -1) {
          propEnd = event.description.length;
        }
        var propVal = event.description.substring(propStart + prop.length + 2, propEnd);
        reservation.lodger[prop.toLocaleLowerCase()] = propVal;
      }
    });
    rservationProps.map(prop => {
      let propStart = event.description.indexOf(prop);
      if (propStart !== -1) {
        var propEnd = event.description.indexOf('\n', propStart);
        if (propEnd === -1) {
          propEnd = event.description.length;
        }
        var propVal = event.description.substring(propStart + prop.length + 2, propEnd);
        reservation[prop.toLocaleLowerCase()] = propVal;
      }
    });
    return reservation;
  }
}
