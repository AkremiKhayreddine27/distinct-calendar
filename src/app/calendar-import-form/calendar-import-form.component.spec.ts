import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarImportFormComponent } from './calendar-import-form.component';

describe('CalendarImportFormComponent', () => {
  let component: CalendarImportFormComponent;
  let fixture: ComponentFixture<CalendarImportFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarImportFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarImportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
