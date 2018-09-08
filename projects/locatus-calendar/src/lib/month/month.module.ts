import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularDraggableModule } from 'angular2-draggable';
import { MonthCellDragDirective } from '../directives/month-cell-drag.directive';


import { ViewComponent } from './view/view.component';
import { HeaderComponent } from './header/header.component';
import { CellComponent } from './cell/cell.component';

@NgModule({ 
  imports: [
    CommonModule,
    AngularDraggableModule
  ],
  declarations: [
    MonthCellDragDirective,

    ViewComponent,
    HeaderComponent,
    CellComponent
  ],
  exports: [
    ViewComponent,
    MonthCellDragDirective
  ]
})
export class MonthModule { }
