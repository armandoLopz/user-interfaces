import { Component, Input, signal } from '@angular/core';
import { educationInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-education-section',
  imports: [],
  templateUrl: './education-section.component.html',
  styleUrl: './education-section.component.css'
})
export class EducationSectionComponent {
  
  @Input() latestEducation = signal<educationInterface[]>([]);

  

}
