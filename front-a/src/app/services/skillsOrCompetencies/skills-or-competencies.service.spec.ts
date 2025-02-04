import { TestBed } from '@angular/core/testing';

import { SkillsOrCompetenciesService } from './skills-or-competencies.service';

describe('SkillsOrCompetenciesService', () => {
  let service: SkillsOrCompetenciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkillsOrCompetenciesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
