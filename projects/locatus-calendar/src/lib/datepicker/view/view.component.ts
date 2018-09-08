import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as dateFns from 'date-fns';

import {
  DAYS_IN_WEEK,
  DEFAULT_WEEKEND_DAYS,
  HOURS_IN_DAY,
  MonthViewDay,
} from '../../shared';

@Component({
  selector: 'locatus-datepicker',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  @Input()
  date: Date = new Date();

  @Input()
  displayNavigation: boolean = true;

  @Output()
  dateChanged: EventEmitter<Date> = new EventEmitter<Date>();

  @Output()
  navigation: EventEmitter<any> = new EventEmitter<any>();

  isYearView: boolean = false;

  isMonthView: boolean = true;

  isMonthsView: boolean = false;

  view: any;

  years: any[] = [];

  months: any[] = [];

  constructor() { }

  ngOnInit() {
    this.getView();
    this.getYears();
  }

  dayClicked(date: Date) {
    this.dateChanged.emit(date);
  }

  yearClicked(year: Date) {
    this.date = dateFns.setYear(this.date, year.getFullYear());
    this.getMonths();
    this.isMonthsView = true;
    this.isYearView = false;
  }

  monthClicked(month: Date) {
    this.date = dateFns.setMonth(this.date, month.getMonth());
    this.getView();
    this.isMonthsView = false;
    this.isYearView = false;
    this.isMonthView = true;
  }

  getMonths() {
    this.months = [];
    for (let month = dateFns.startOfYear(this.date); month < dateFns.endOfYear(this.date); month = dateFns.addMonths(month, 1)) {
      this.months.push({
        date: month,
        isPast: month < new Date(),
        isCurrent: dateFns.isSameMonth(month, new Date()),
        isFuture: month > new Date(),
      })
    }
  }

  switchView() {
    this.isMonthView = !this.isMonthView;
    this.isYearView = !this.isYearView;
    if (this.isMonthsView) {
      this.isYearView = false;
    }
    this.isMonthsView = false;
  }

  navigate(action: string) {
    switch (action) {
      case 'next':
        if (this.isMonthsView) {
          this.date = dateFns.addYears(this.date, 1);
          this.getMonths();
        } else if (this.isYearView) {
          this.date = dateFns.addYears(this.date, 25);
          this.getYears();
        } else if (this.isMonthView) {
          this.date = dateFns.addMonths(this.date, 1);
          this.getView();
        }
        this.navigation.emit({
          action: 'next',
          date: this.date
        });
        break;
      case 'previous':
        if (this.isMonthsView) {
          this.date = dateFns.subYears(this.date, 1);
          this.getMonths();
        } else if (this.isYearView) {
          this.date = dateFns.subYears(this.date, 25);
          this.getYears();
        } else if (this.isMonthView) {
          this.date = dateFns.subMonths(this.date, 1);
          this.getView();
        }
        this.navigation.emit({
          action: 'previous',
          date: this.date
        });
        break;
    }
  }

  getView() {
    this.view = this.getMonthViewGrid({
      viewDate: this.date,
      weekStartsOn: 1,
      excluded: [],
      weekendDays: []
    });
  }

  getMonthViewGrid({
    viewDate,
    weekStartsOn,
    excluded = [],
    viewStart = dateFns.startOfMonth(viewDate),
    viewEnd = dateFns.endOfMonth(viewDate),
    weekendDays
  }) {
    let start: Date = dateFns.startOfWeek(viewStart, { weekStartsOn });
    const end: Date = dateFns.endOfWeek(viewEnd, { weekStartsOn });
    const monthRows = (dateFns.differenceInDays(end, start) + 1) / 7;
    const weeks = [];
    for (let week = 0; week < monthRows; week++) {
      const endWeek: Date = dateFns.addDays(start, DAYS_IN_WEEK);
      const weekDays = this.getMonthWeekDays(viewDate, endWeek, start, excluded);
      weeks.push({
        days: weekDays
      });
      start = dateFns.addHours(start, (DAYS_IN_WEEK * HOURS_IN_DAY));
    }
    return {
      year: dateFns.format(viewDate, 'YYYY'),
      month: dateFns.format(viewDate, 'MMMM'),
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

  getMonthWeekDays(viewDate, endWeek, start, excluded) {
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
        day.inMonth = dateFns.isSameMonth(date, viewDate);
        weekDays.push(day);
      }
    }
    return weekDays;
  }

  getYears() {
    this.years = [];
    for (let year = dateFns.subYears(this.date, 3); year < dateFns.addYears(this.date, 25); year = dateFns.addYears(year, 1)) {
      const today: Date = new Date();
      this.years.push({
        date: year,
        isPast: year < today,
        isCurrent: dateFns.isSameYear(year, today),
        isFuture: year > today,
      });
    }
  }

}
