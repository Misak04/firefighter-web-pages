import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicsListComponent } from './technics-list.component';

describe('TechnicsListComponent', () => {
  let component: TechnicsListComponent;
  let fixture: ComponentFixture<TechnicsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
