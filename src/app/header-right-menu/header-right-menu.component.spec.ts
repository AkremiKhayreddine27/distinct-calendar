import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderRightMenuComponent } from './header-right-menu.component';

describe('HeaderRightMenuComponent', () => {
  let component: HeaderRightMenuComponent;
  let fixture: ComponentFixture<HeaderRightMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderRightMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderRightMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
