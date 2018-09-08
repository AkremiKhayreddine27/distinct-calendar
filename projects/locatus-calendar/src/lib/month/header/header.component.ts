import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { WeekDay } from '../../shared';

@Component({
  selector: 'month-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() days: WeekDay[];

  @Input() locale: string;

  @Input() customTemplate: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

}
