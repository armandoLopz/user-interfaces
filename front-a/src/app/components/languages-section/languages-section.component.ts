import { Component, Input, OnInit, signal } from '@angular/core';
import { LanguageInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-languages-section',
  imports: [],
  templateUrl: './languages-section.component.html',
  styleUrl: './languages-section.component.css'
})
export class LanguagesSectionComponent {

  @Input() languages = signal<LanguageInterface[]>([])

}
