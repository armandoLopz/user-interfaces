import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInfoUserModalComponent } from './basic-info-user-modal.component';

describe('BasicInfoUserModalComponent', () => {
  let component: BasicInfoUserModalComponent;
  let fixture: ComponentFixture<BasicInfoUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInfoUserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInfoUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
