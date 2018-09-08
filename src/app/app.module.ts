import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatSelectModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonToggleModule, MatNativeDateModule } from '@angular/material';

import { AppComponent } from './app.component';

import { LocatusCalendarModule } from '../../projects/locatus-calendar/src/public_api';

import { EventFormComponent } from './event-form/event-form.component';
import { CalendarFormComponent } from './calendar-form/calendar-form.component';
import { CalendarImportFormComponent } from './calendar-import-form/calendar-import-form.component';
import { CalendarImportUrlComponent } from './calendar-import-url/calendar-import-url.component';
import { HeaderRightMenuComponent } from './header-right-menu/header-right-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    EventFormComponent,
    CalendarFormComponent,
    CalendarImportFormComponent,
    CalendarImportUrlComponent,
    HeaderRightMenuComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgbDatepickerModule,
    LocatusCalendarModule,

    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  entryComponents: [
    EventFormComponent,
    CalendarFormComponent,
    CalendarImportFormComponent,
    CalendarImportUrlComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
