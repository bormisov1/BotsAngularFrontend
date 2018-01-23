import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmitentsComponent } from './emitents.component';

describe('EmitentsComponent', () => {
  let component: EmitentsComponent;
  let fixture: ComponentFixture<EmitentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmitentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmitentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
