import { Component, OnInit, Renderer2 } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { GenericService } from '../../services/generic/generic.service';
import { AlertModalComponent } from '../../components/modals/alert-modal/alert-modal.component';
import { CommonModule } from '@angular/common';
import { EditModalComponent } from '../../components/modals/edit-modal/edit-modal.component';

@Component({
  selector: 'app-settings-page',
  imports: [SideBarComponent, AlertModalComponent, CommonModule, EditModalComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent implements OnInit {
  constructor(private renderer: Renderer2, private genericService: GenericService<any>) { }

  // Configuraciónes para editar
  showEditModal: boolean = false;
  configToEdit: any = {};

  updateConfig(editedConfig: any) {

    const updatedConfig = this.addPixelValues(editedConfig);
    console.log("PRE");
    
    console.log(updatedConfig);
    
    this.genericService.update('/configurations', updatedConfig, updatedConfig.id).subscribe(
      (response) => {
        console.log('Configuration edite:', response);
        alert('Configuration edited');

      },
      (error) => {
        console.error('Error saving configuration:', error);
        //alert('Error saving configuration');
      }
    );

    //this.getUserConfigurations();
    this.showEditModal = false;
    window.location.reload();

  }

  addPixelValues(config: any) {
    return {
        ...config,
        paragraph_size: `${config.paragraph_size}px`,
        title_size: `${config.title_size}px`,
        subtitle_size: `${config.subtitle_size}px`,
    };
}

  cancelEdit() {
    this.showEditModal = false;
  }

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
    const storedConfig = localStorage.getItem('selectedConfig');
    if (storedConfig) {
        this.defaultConfig = storedConfig; // Carga la selección desde localStorage
        this.selectDefault(this.defaultConfig)
    } else {
        this.defaultConfig = 'main'; // Valor por defecto si no hay nada guardado
    }
  }

  // Método para cancelar la eliminación
  cancelDelete() {
    this.resetModal();
  }

  // Función para seleccionar la configuración predeterminada
  selectDefault(config: any) {
    this.defaultConfig = config;
    localStorage.setItem('selectedConfig', config); // Guarda la selección en localStorage

    // Si es 'secondary' usa el tema predefinido, de lo contrario aplica custom-theme
    if (config === 'secondary') {
      this.renderer.removeClass(document.body, 'custom-theme');
      this.renderer.addClass(document.body, 'secondary-theme');

    } else if (config === "main") {
      this.renderer.removeClass(document.body, 'custom-theme');
      this.renderer.removeClass(document.body, 'secondary-theme');
    } else {
      this.renderer.removeClass(document.body, 'secondary-theme');
      // Aplicar los estilos dinámicamente
      this.applyConfigStyles(config);

      this.renderer.addClass(document.body, 'custom-theme');

    }
  }

  // Modificar variables CSS dinámicamente
  applyConfigStyles(config: any) {
    document.documentElement.style.setProperty('--primary-color', config.primary_color);
    document.documentElement.style.setProperty('--secondary-color', config.secondary_color);
    document.documentElement.style.setProperty('--accent-color', config.accent_color);
    document.documentElement.style.setProperty('--extra-color-1', config.extra_color_1);
    document.documentElement.style.setProperty('--extra-color-2', config.extra_color_2);
    document.documentElement.style.setProperty('--paragraph-size', config.paragraph_size);
    document.documentElement.style.setProperty('--title-size', config.title_size);
    document.documentElement.style.setProperty('--subtitle-size', config.subtitle_size);

    if (config.primary_tipography !== 'None') {
      document.documentElement.style.setProperty('--primary-font', config.primary_tipography);
    }
    if (config.secondary_tipography !== 'None') {
      document.documentElement.style.setProperty('--secondary-font', config.secondary_tipography);
    }

  }

  // Función para editar una configuración
  editConfig(config: any) {
    console.log('Editar configuración:', config);
    this.configToEdit = config

    this.configToEdit.paragraph_size = parseInt(this.configToEdit.paragraph_size, 10);
    this.configToEdit.title_size = parseInt(this.configToEdit.title_size, 10);
    this.configToEdit.subtitle_size = parseInt(this.configToEdit.subtitle_size, 10);
    
    this.showEditModal = true;
  }

  deleteConfig(config: any) {
    console.log('Eliminar configuración:', config);
    // Asegúrate de que la configuración tiene un id y no se trata de configuraciones predeterminadas
    if (typeof config === 'object' && config.id) {
      this.genericService.delete('/configurations/', config.id).subscribe(
        (response: any) => {
          console.log('Configuración eliminada:', response);
          this.getUserConfigurations();  // Actualiza la lista de configuraciones después de la eliminación
        },
        (error: any) => {
          console.error('Error eliminando la configuración:', error);
        }
      );
    } //else {
      //alert("No se puede eliminar esta configuración predeterminada.");
    //}
  }

  resetModal() {
    this.showAlertModal = false;
    this.configToDelete = null;
  }

  // Abre el modal y asigna la configuración a borrar
  openDeleteModal(config: any) {
    console.log('Abriendo modal para borrar la configuración:', config);
    this.showAlertModal = true;
    this.configToDelete = config; // Asigna la configuración seleccionada al modal
  }

  // Se ejecuta al confirmar la eliminación desde el modal
  confirmDelete() {
    console.log('Confirmar eliminación de la configuración:', this.configToDelete);
    if (this.configToDelete) {
      this.deleteConfig(this.configToDelete);  // Elimina la configuración
    }
    this.resetModal();  // Cierra el modal después de confirmar
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
      alert('The configuration name is obligatory.');
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
        this.getUserConfigurations();
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
