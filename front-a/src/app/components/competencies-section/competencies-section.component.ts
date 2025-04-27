import { Component, Input, signal } from '@angular/core';
import { skillsOrCompetenciesInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-competencies-section',
  imports: [],
  templateUrl: './competencies-section.component.html',
  styleUrl: './competencies-section.component.css'
})
export class CompetenciesSectionComponent {

  @Input() competencies = signal<skillsOrCompetenciesInterface[]>([])
}
