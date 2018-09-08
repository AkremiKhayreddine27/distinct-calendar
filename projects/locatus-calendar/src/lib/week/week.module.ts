import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekViewComponent } from './view/view.component';
import { HeaderComponent } from './header/header.component';

import { AngularDraggableModule } from 'angular2-draggable';
import { MonthModule } from '../month/month.module';

@NgModule({
  imports: [
    CommonModule,
    MonthModule,
    AngularDraggableModule
  ],
  declarations: [
    WeekViewComponent,
    HeaderComponent,
  ],
  exports: [
    WeekViewComponent
  ]
})
export class WeekModule { }
