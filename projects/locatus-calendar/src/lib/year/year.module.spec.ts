import { YearModule } from './year.module';

describe('YearModule', () => {
  let yearModule: YearModule;

  beforeEach(() => {
    yearModule = new YearModule();
  });

  it('should create an instance', () => {
    expect(yearModule).toBeTruthy();
  });
});
