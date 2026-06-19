import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicsEditorComponent } from './technics-editor.component';

describe('TechnicsEditorComponent', () => {
  let component: TechnicsEditorComponent;
  let fixture: ComponentFixture<TechnicsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
