import { WeekModule } from './week.module';

describe('WeekModule', () => {
  let weekModule: WeekModule;

  beforeEach(() => {
    weekModule = new WeekModule();
  });

  it('should create an instance', () => {
    expect(weekModule).toBeTruthy();
  });
});
