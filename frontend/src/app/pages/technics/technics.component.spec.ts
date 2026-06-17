import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicsComponent } from './technics.component';

describe('TechnicsComponent', () => {
  let component: TechnicsComponent;
  let fixture: ComponentFixture<TechnicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
