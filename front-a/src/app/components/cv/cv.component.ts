import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultInterface } from '../../interfaces/interfaces.models';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
})
export class CvComponent {

  @Input() user!: ResultInterface;

  formatPeriod(start: number, end: number | null, currently: boolean): string {
    const startStr = start.toString();
    const endStr = currently ? 'Present' : (end ? end.toString() : '');
    return `${startStr} - ${endStr}`;
  }
}