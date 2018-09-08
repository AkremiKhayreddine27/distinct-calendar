import { DayModule } from './day.module';

describe('DayModule', () => {
  let dayModule: DayModule;

  beforeEach(() => {
    dayModule = new DayModule();
  });

  it('should create an instance', () => {
    expect(dayModule).toBeTruthy();
  });
});
