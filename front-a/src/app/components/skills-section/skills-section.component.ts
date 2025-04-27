import { Component, Input, OnInit, signal } from '@angular/core';
import { skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-skills-section',
  imports: [],
  templateUrl: './skills-section.component.html',
  styleUrl: './skills-section.component.css'
})
export class SkillsSectionComponent {

  @Input() skills = signal<skillsOrCompetenciesInterface[]>([]);

}
