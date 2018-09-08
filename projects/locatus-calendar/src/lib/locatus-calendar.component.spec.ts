import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocatusCalendarComponent } from './locatus-calendar.component';

describe('LocatusCalendarComponent', () => {
  let component: LocatusCalendarComponent;
  let fixture: ComponentFixture<LocatusCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocatusCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocatusCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
