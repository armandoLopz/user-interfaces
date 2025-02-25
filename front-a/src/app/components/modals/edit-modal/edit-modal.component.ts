import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.css']
})
export class EditModalComponent {

  @Input() isVisible: boolean = false;
  
  // Propiedad para recibir la configuración a editar
  @Input() configToEdit: any = {
    name: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    paragraph_size: '',
    title_size: '',
    subtitle_size: '',
    primary_tipography: '',
    secondary_tipography: '',
  };

  // Salidas para comunicar acciones al padre
  @Output() saveAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<void>();

  // Método que se ejecuta al guardar la configuración
  saveEditedConfig() {
    this.saveAction.emit(this.configToEdit);
  }

  // Método que se ejecuta al cancelar la edición
  closeEditModal() {
    this.cancelAction.emit();
  }

  // Método para manejar el cambio de fuente
  onFontChange(event: Event, fontType: string) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (fontType === 'primary') {
          this.configToEdit.primary_tipography = e.target.result;
        } else if (fontType === 'secondary') {
          this.configToEdit.secondary_tipography = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}