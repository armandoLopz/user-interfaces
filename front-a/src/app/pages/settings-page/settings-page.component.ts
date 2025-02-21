import { Component } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { GenericService } from '../../services/generic/generic.service';

@Component({
  selector: 'app-settings-page',
  imports: [SideBarComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css'
})
export class SettingsPageComponent {

  constructor(private genericService: GenericService<any>){}
  
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

  primaryFontTitle = "Title"
  secondaryFontTitle = "Subtitle"
  
  // Función para restaurar los valores por defecto
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
      const value = input.value || '16px'; // Default size
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

  saveConfiguration() {
    // Obtener el ID del usuario desde el JWT (si está disponible)
    const accessToken = localStorage.getItem('access_token');
    const userId: string | null = accessToken ? JSON.parse(atob(accessToken.split('.')[1])).user_id : null;
    
    const configData = {
      name: 'First config',
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

    // Usar el servicio genérico para crear la configuración
    this.genericService.create('/configurations/', configData).subscribe(
      (response) => {
        console.log('Configuration saved:', response);
        // Aquí puedes agregar lógica para manejar la respuesta del servidor
      },
      (error) => {
        console.error('Error saving configuration:', error);
        // Aquí puedes manejar errores si ocurren
      }
    );
  }

  // Función para manejar el cambio de fuente
  onFontChange(event: Event, fontType: string) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];

      // Crear un objeto FileReader para leer el archivo
      const reader = new FileReader();
      
      // Cuando el archivo se haya leído, aplicamos la fuente
      reader.onload = (e: any) => {
        const fontUrl = e.target.result;  // Obtenemos la URL de datos del archivo

        // Creamos un nuevo estilo CSS para la fuente
        const fontName = file.name.split('.')[0];  // Nombre de la fuente (sin la extensión)
        const style = document.createElement('style');
        style.innerHTML = `
          @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('truetype');
          }
        `;
        document.head.appendChild(style);  // Añadimos el estilo al documento

        // Actualizamos la fuente seleccionada en el estado del componente
        if (fontType === 'primary') {
          this.primaryFont = fontName;
        } else if (fontType === 'secondary') {
          this.secondaryFont = fontName;
        }
      };

      // Leemos el archivo como URL de datos
      reader.readAsDataURL(file);
    }
  }

}
