import { MonthModule } from './month.module';

describe('MonthModule', () => {
  let monthModule: MonthModule;

  beforeEach(() => {
    monthModule = new MonthModule();
  });

  it('should create an instance', () => {
    expect(monthModule).toBeTruthy();
  });
});
