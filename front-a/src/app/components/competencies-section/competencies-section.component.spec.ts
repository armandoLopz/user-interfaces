import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetenciesSectionComponent } from './competencies-section.component';

describe('CompetenciesSectionComponent', () => {
  let component: CompetenciesSectionComponent;
  let fixture: ComponentFixture<CompetenciesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetenciesSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetenciesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
