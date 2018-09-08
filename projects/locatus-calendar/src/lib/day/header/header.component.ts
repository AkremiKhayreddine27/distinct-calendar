import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'locatus-day-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnChanges {

  @ViewChild('container')
  container: ElementRef;

  @Input() viewDate;

  @Input() view;

  @Output()
  eventClicked: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  heightChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnChanges() {
    setTimeout(() => {
      this.heightChanged.emit(this.container.nativeElement.offsetHeight);
    }, 50)
  }

}
