import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { GenericService } from '../../services/generic/generic.service';
import { AlertModalComponent } from '../../components/modals/alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-page',
  imports: [SideBarComponent, AlertModalComponent, CommonModule],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent implements OnInit {
  constructor(private genericService: GenericService<any>) {}

  //Delete variables
  showAlertModal = false;
  configToDelete: any = null;

  // Variables de configuración
  nameConfig: string = '';
  primaryColor: string = '#000000';
  secondaryColor: string = '#000000';
  accentColor: string = '#000000';
  sizeParagraph: string = '16px';
  sizeTitle: string = '24px';
  sizeSubtitle: string = '20px';
  primaryFont: string = 'None';
  secondaryFont: string = 'None';
  extraColor1: string = '#ffffff';
  extraColor2: string = '#000000';

  primaryFontTitle = 'Title';
  secondaryFontTitle = 'Subtitle';

  // Variable para almacenar las configuraciones asociadas al usuario
  configurations: any[] = [];

  // Variable para identificar la configuración predeterminada
  defaultDefaultId: any = null;
  defaultConfig: any = null;

  // Ciclo de vida OnInit para obtener la configuración del usuario
  ngOnInit(): void {
    this.getUserConfigurations();
  }

  // Método que se ejecuta cuando se confirma la eliminación
  confirmDelete() {
    // Aquí llamas a la lógica de eliminación, por ejemplo:
    this.deleteConfig(this.configToDelete);
    this.resetModal();
  }

  // Método para cancelar la eliminación
  cancelDelete() {
    this.resetModal();
  }

  // Resetea las variables del modal
  resetModal() {
    this.showAlertModal = false;
    this.configToDelete = null;
  }

  // Función para seleccionar la configuración predeterminada
  selectDefault(config: string) {
    this.defaultConfig = config;
    if (config === 'secondary') {
      document.body.classList.add('secondary-theme');
    } else {
      document.body.classList.remove('secondary-theme');
    }
  }
  

  // Función para editar una configuración
  editConfig(config: any) {
    console.log('Editar configuración:', config);
    // Implementa la lógica de edición aquí
  }

  // Función para eliminar una configuración
  deleteConfig(config: any) {
    console.log('Eliminar configuración:', config);
    // Implementa la lógica de eliminación aquí
  }

  // Función para obtener el ID del usuario y solicitar las configuraciones filtradas
  getUserConfigurations() {
    const accessToken = localStorage.getItem('access_token');
    const userId: number | null = accessToken
      ? JSON.parse(atob(accessToken.split('.')[1])).user_id
      : null;
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario.');
      return;
    }

    this.genericService.getByUserId('/configurations', userId).subscribe(
      (response: any) => {
        // Se asume que la respuesta es un arreglo de configuraciones asociadas al usuario
        this.configurations = response;
        console.log('Configuraciones obtenidas:', this.configurations);
      },
      (error) => {
        console.error('Error al obtener las configuraciones:', error);
      }
    );
  }

  // Función para restaurar valores por defecto
  restoreDefaults() {
    this.primaryColor = '#000000';
    this.secondaryColor = '#000000';
    this.accentColor = '#000000';
    this.sizeParagraph = '16px';
    this.sizeTitle = '24px';
    this.sizeSubtitle = '20px';
    this.primaryFont = 'None';
    this.secondaryFont = 'None';
    this.extraColor1 = '#ffffff';
    this.extraColor2 = '#000000';
  }

  onColorChange(event: Event, colorType: string) {
    const input = event.target as HTMLInputElement;
    if (input) {
      const value = input.value;
      switch (colorType) {
        case 'primary':
          this.primaryColor = value;
          break;
        case 'secondary':
          this.secondaryColor = value;
          break;
        case 'accent':
          this.accentColor = value;
          break;
        case 'extra1':
          this.extraColor1 = value;
          break;
        case 'extra2':
          this.extraColor2 = value;
          break;
      }
    }
  }

  onSizeChange(event: Event, sizeType: string) {
    const input = event.target as HTMLInputElement;
    if (input) {
      let value = parseInt(input.value, 10) || 16;
      if (value < 1) {
        // Aseguramos que el tamaño mínimo sea 1
        value = 1;
      }
      switch (sizeType) {
        case 'paragraph':
          this.sizeParagraph = value + 'px';
          break;
        case 'title':
          this.sizeTitle = value + 'px';
          break;
        case 'subtitle':
          this.sizeSubtitle = value + 'px';
          break;
      }
    }
  }

  onNameConfigChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      // Limitar a 25 caracteres
      if (input.value.length > 25) {
        this.nameConfig = input.value.substring(0, 25);
      } else {
        this.nameConfig = input.value;
      }
    }
  }

  saveConfiguration() {
    // Validar que se ingrese un nombre para la configuración
    if (!this.nameConfig.trim()) {
      alert('El nombre de la configuración es obligatorio.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    const userId: string | null = accessToken
      ? JSON.parse(atob(accessToken.split('.')[1])).user_id
      : null;

    const configData = {
      name: this.nameConfig, // Valor ingresado por el usuario
      determinated: true,
      primary_color: this.primaryColor,
      secondary_color: this.secondaryColor,
      accent_color: this.accentColor,
      extra_color_1: this.extraColor1,
      extra_color_2: this.extraColor2,
      paragraph_size: this.sizeParagraph,
      title_size: this.sizeTitle,
      subtitle_size: this.sizeSubtitle,
      primary_tipography: this.primaryFont,
      secondary_tipography: this.secondaryFont,
      user: [userId],
    };

    // Realizar la solicitud POST a la URL actualizada
    this.genericService.create('/configurations/', configData).subscribe(
      (response) => {
        console.log('Configuration saved:', response);
        alert('Configuration saved');
        // Aquí puedes agregar lógica adicional para manejar la respuesta
      },
      (error) => {
        console.error('Error saving configuration:', error);
        alert('Error saving configuration');
      }
    );
  }

  onFontChange(event: Event, fontType: string) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const fontUrl = e.target.result;
        const fontName = file.name.split('.')[0];
        const style = document.createElement('style');
        style.innerHTML = `
          @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('truetype');
          }
        `;
        document.head.appendChild(style);
        if (fontType === 'primary') {
          this.primaryFont = fontName;
        } else if (fontType === 'secondary') {
          this.secondaryFont = fontName;
        }
      };

      reader.readAsDataURL(file);
    }
  }
}
