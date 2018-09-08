import { TestBed, inject } from '@angular/core/testing';

import { LocatusCalendarService } from './locatus-calendar.service';

describe('LocatusCalendarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocatusCalendarService]
    });
  });

  it('should be created', inject([LocatusCalendarService], (service: LocatusCalendarService) => {
    expect(service).toBeTruthy();
  }));
});
