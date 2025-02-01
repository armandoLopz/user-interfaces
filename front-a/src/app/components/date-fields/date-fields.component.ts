import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-date-fields',
  standalone: true,
  imports: [FormsModule, NgIf], // Importa FormsModule
  templateUrl: './date-fields.component.html',
  styleUrls: ['./date-fields.component.css']
})
export class DateFieldsComponent {
  startDate: string = ''; // Fecha de inicio
  endDate: string = ''; // Fecha de finalización
  isCurrent: boolean = false; // Indica si la actividad está en curso
  validationError: string | null = null; // Mensaje de error de validación

  @Input() nameStartDate: string = "";
  @Input() nameEndDate: string = "";

  // Valida las fechas
  validateDates(): void {
    if (this.isCurrent) {
      this.validationError = null; // No hay error si está en curso
      return;
    }

    if (!this.startDate || !this.endDate) {
      this.validationError = 'Both start and end dates are required.';
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start > end) {
      this.validationError = 'End date cannot be earlier than start date.';
    } else {
      this.validationError = null; // No hay error
    }
  }

  // Maneja el cambio en el checkbox "Currently"
  onCurrentChange(): void {
    if (this.isCurrent) {
      this.endDate = ''; // Limpia la fecha de finalización si está en curso
    }
    this.validateDates(); // Valida las fechas
  }
}