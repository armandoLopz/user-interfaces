import { Component, Input, signal } from '@angular/core';
import { SkillsSectionComponent } from '../skills-section/skills-section.component';
import { LanguageInterface, skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';
import { LanguagesSectionComponent } from "../languages-section/languages-section.component";
import { CompetenciesSectionComponent } from "../competencies-section/competencies-section.component";

@Component({
  selector: 'app-tab',
  imports: [SkillsSectionComponent, LanguagesSectionComponent, CompetenciesSectionComponent],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css'
})
export class TabComponent {

  @Input() languages = signal<LanguageInterface[]>([])
  @Input() skills = signal<skillsOrCompetenciesInterface[]>([]);
  @Input() competencies = signal<skillsOrCompetenciesInterface[]>([]);

  activeTab: string = "languages";
}
