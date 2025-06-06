import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterReactiveFormComponent } from './register-reactive-form.component';

describe('RegisterReactiveFormComponent', () => {
  let component: RegisterReactiveFormComponent;
  let fixture: ComponentFixture<RegisterReactiveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterReactiveFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterReactiveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
