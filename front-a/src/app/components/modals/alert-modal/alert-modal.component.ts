import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-modal',
  imports: [CommonModule],
  templateUrl: './alert-modal.component.html',
  styleUrl: './alert-modal.component.css'
})
export class AlertModalComponent {

  @Input() isVisible: boolean = false;  // Propiedad para controlar si el modal está visible
  
  closeModal() {
    this.isVisible = false;
  }

  confirmDelete() {
    console.log('Deleted!');
    this.isVisible = false;  // Cierra el modal después de confirmar
  }
}
