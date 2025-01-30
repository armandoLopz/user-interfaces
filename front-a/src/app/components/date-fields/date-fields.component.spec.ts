import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFieldsComponent } from './date-fields.component';

describe('DateFieldsComponent', () => {
  let component: DateFieldsComponent;
  let fixture: ComponentFixture<DateFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
