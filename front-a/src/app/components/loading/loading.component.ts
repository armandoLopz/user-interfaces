import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  imports: [CommonModule]
})
export class LoadingComponent {
  @Input() show: boolean = false;
}
