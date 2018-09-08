import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import * as dateFns from 'date-fns';

import { MonthViewDay } from '../../shared';

@Component({
  selector: 'locatus-calendar-month-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
  host: {
    class: 'cal-cell cal-day-cell',
    '[class.cal-past]': 'day.isPast',
    '[class.cal-today]': 'day.isToday',
    '[class.cal-future]': 'day.isFuture',
    '[class.cal-weekend]': 'day.isWeekend',
    '[class.cal-in-month]': 'day.inMonth',
    '[class.cal-out-month]': '!day.inMonth',
    '[class.cal-has-events]': 'day.events.length > 0',
    '[class.cal-open]': 'day === openDay',
    '[style.backgroundColor]': 'day.backgroundColor'
  }
})
export class CellComponent {

  @ViewChild('cell')
  cell: ElementRef;

  @Input() day: MonthViewDay;

  @Input() openDay: MonthViewDay;

  @Input() locale: string;

  @Output() dayNumberClicked: EventEmitter<any> = new EventEmitter();

  @Output() highlightDay: EventEmitter<any> = new EventEmitter();

  @Output() unhighlightDay: EventEmitter<any> = new EventEmitter();

  @Output()
  cellClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  cellMouseDown: EventEmitter<any> = new EventEmitter<any>();

  numberClicked(event: Event, day) {
    event.stopPropagation();
    this.dayNumberClicked.emit(day);
  }

  /**
   * @hidden
   */
  onCellClick(day): void {
    this.cellClicked.emit(day);
  }

  isToday() {
    return dateFns.isToday(this.day.date);
  }

}
