import { Component, Input, OnInit, signal } from '@angular/core';
import { WorkExperienceInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-work-section',
  imports: [],
  templateUrl: './work-section.component.html',
  styleUrl: './work-section.component.css'
})
export class WorkSectionComponent {

  @Input()latestWork = signal<WorkExperienceInterface[]>([]);

}
