import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, OnChanges, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'week-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnChanges {

  @ViewChild('container')
  container: ElementRef;

  @ViewChild('eventscontainer')
  eventscontainer: ElementRef;

  @Input() days: any[];

  @Input() allDayEvents;

  @Input() locale: string;

  /**
   * Called when the event title is clicked
  */
  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  dayHeaderClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  heightChanged: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  eventDropped: EventEmitter<{
    event: any;
    newStart: Date;
  }> = new EventEmitter<{ event: any; newStart: Date }>();

  ngOnChanges() {
    setTimeout(() => {
      this.heightChanged.emit(this.container.nativeElement.offsetHeight);
    }, 50)
  }

}
