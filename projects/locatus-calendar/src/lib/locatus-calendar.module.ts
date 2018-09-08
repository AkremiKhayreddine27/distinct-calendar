import { NgModule, ModuleWithProviders } from '@angular/core';

import { LocatusCalendarComponent } from './locatus-calendar.component';

import { MonthModule } from './month/month.module';
import { WeekModule } from './week/week.module';
import { DayModule } from './day/day.module';
import { YearModule } from './year/year.module';

import { DatepickerModule } from './datepicker/datepicker.module';

import { CalendarImportDirective } from './directives/calendar-import.directive';
import { CalendarExportDirective } from './directives/calendar-export.directive';

import { CalendarService } from './services';

@NgModule({
  imports: [
    DatepickerModule,
    MonthModule,
    WeekModule,
    DayModule,
    YearModule
  ],
  declarations: [
    LocatusCalendarComponent,
    CalendarImportDirective,
    CalendarExportDirective
  ],
  exports: [
    LocatusCalendarComponent,
    DatepickerModule,
    MonthModule,
    WeekModule,
    DayModule,
    YearModule,
    CalendarImportDirective,
    CalendarExportDirective
  ],
  providers: [
    CalendarService
  ]
})
export class LocatusCalendarModule {
  static forRoot(config = {}): ModuleWithProviders {
    return {
      ngModule: LocatusCalendarModule,
      providers: [
        CalendarService
      ]
    };
  }
}
