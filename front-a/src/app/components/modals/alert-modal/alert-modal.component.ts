import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-modal',
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.css'
})
export class AlertModalComponent {

  @Input() isVisible: boolean = false;
  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();

  closeModal() {
    this.cancelAction.emit();
  }

  confirmDelete() {
    this.confirmAction.emit();
  }
}
