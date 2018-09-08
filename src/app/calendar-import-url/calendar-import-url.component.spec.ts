import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarImportUrlComponent } from './calendar-import-url.component';

describe('CalendarImportUrlComponent', () => {
  let component: CalendarImportUrlComponent;
  let fixture: ComponentFixture<CalendarImportUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarImportUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarImportUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
