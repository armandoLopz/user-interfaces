import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsInfoUserModalComponent } from './skills-info-user-modal.component';

describe('SkillsInfoUserModalComponent', () => {
  let component: SkillsInfoUserModalComponent;
  let fixture: ComponentFixture<SkillsInfoUserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsInfoUserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsInfoUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
