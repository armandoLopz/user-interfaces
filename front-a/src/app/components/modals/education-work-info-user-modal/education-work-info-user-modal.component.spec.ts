import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationWorkInfoUserModalComponent } from './education-work-info-user-modal.component';

describe('EducationWorkInfoUserModalComponent', () => {
  let component: EducationWorkInfoUserModalComponent;
  let fixture: ComponentFixture<EducationWorkInfoUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationWorkInfoUserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EducationWorkInfoUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
