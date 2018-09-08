import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayViewComponent } from './view/view.component';

import { AngularDraggableModule } from 'angular2-draggable';
import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [
    CommonModule,
    AngularDraggableModule
  ],
  declarations: [DayViewComponent, HeaderComponent],
  exports: [DayViewComponent]
})
export class DayModule { }
